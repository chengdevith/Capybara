// Command server is Capybara's API server (HTTP + websockets).
package main

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/capybara/capybara/pkg/cluster"
	"github.com/capybara/capybara/pkg/config"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, "capybara-server:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	cfg, err := config.Load(args, os.Getenv)
	if err != nil {
		return err
	}
	logger := newLogger(cfg.LogLevel)

	registry, err := cluster.LoadFile(cfg.ClustersFile, logger)
	if err != nil {
		return err
	}
	for _, c := range registry.List() {
		if _, err := registry.Client(c.ID); err != nil {
			logger.Warn("cluster not ready at startup", "cluster", c.ID, "err", err)
		} else {
			logger.Info("cluster registered", "cluster", c.ID)
		}
	}

	if !cfg.IsLoopback() {
		logger.Warn("listening on a non-loopback address; there is no authentication yet", "addr", cfg.Addr)
	}

	srv := &http.Server{
		Addr:              cfg.Addr,
		Handler:           newHandler(cfg, registry, logger),
		ReadHeaderTimeout: 10 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	errc := make(chan error, 1)
	go func() {
		logger.Info("listening", "addr", cfg.Addr)
		errc <- srv.ListenAndServe()
	}()

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
	}

	logger.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return err
	}
	if err := <-errc; !errors.Is(err, http.ErrServerClosed) {
		return err
	}
	return nil
}

func newLogger(level string) *slog.Logger {
	var l slog.Level
	_ = l.UnmarshalText([]byte(level)) // validated by config
	return slog.New(slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: l}))
}
