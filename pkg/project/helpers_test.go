package project

import (
	"github.com/go-logr/logr"
	"k8s.io/apimachinery/pkg/api/resource"
)

func logrDiscard() logr.Logger { return logr.Discard() }

func resourceQuantity(s string) *resource.Quantity {
	q := resource.MustParse(s)
	return &q
}
