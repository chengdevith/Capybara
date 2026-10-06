package stream

import (
	"context"

	"github.com/coder/websocket"
)

// bindLifetime returns a context that ends when parent ends or when the
// cluster's lifetime does (credentials changed, cluster removed). The
// cause of a lifetime end is kept. Call stop when done.
func bindLifetime(parent, lifetime context.Context) (context.Context, context.CancelFunc) {
	ctx, cancel := context.WithCancelCause(parent)
	if lifetime == nil {
		return ctx, func() { cancel(nil) }
	}
	unhook := context.AfterFunc(lifetime, func() { cancel(context.Cause(lifetime)) })
	return ctx, func() {
		unhook()
		cancel(nil)
	}
}

// lifetimeEnded reports whether ctx ended because of the cluster (not the
// browser), and closes the socket saying why, so the browser can reconnect
// (credentials changed) or show that the cluster is gone.
func lifetimeEnded(ctx, lifetime context.Context, conn *websocket.Conn) bool {
	if lifetime == nil || lifetime.Err() == nil || ctx.Err() == nil {
		return false
	}
	_ = conn.Close(websocket.StatusGoingAway, context.Cause(lifetime).Error())
	return true
}
