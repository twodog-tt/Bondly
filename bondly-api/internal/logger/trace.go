package logger

import (
	"context"

	"github.com/sirupsen/logrus"
)

type ctxKey string

const traceIDKey ctxKey = "trace_id"

func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDKey, traceID)
}

func FromContext(ctx context.Context) *logrus.Entry {
	if v := ctx.Value(traceIDKey); v != nil {
		if tid, ok := v.(string); ok {
			return Log.WithField("trace_id", tid)
		}
	}
	return logrus.NewEntry(Log)
}
