package logger

import (
	"os"

	"github.com/sirupsen/logrus"
)

type Logger struct {
	*logrus.Logger
}

func NewLogger() *Logger {
	logger := logrus.New()

	// 设置输出
	logger.SetOutput(os.Stdout)

	// 设置日志级别
	logger.SetLevel(logrus.InfoLevel)

	// 设置格式
	logger.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: "2006-01-02 15:04:05",
	})

	return &Logger{logger}
}

func (l *Logger) SetLevel(level string) {
	switch level {
	case "debug":
		l.Logger.SetLevel(logrus.DebugLevel)
	case "info":
		l.Logger.SetLevel(logrus.InfoLevel)
	case "warn":
		l.Logger.SetLevel(logrus.WarnLevel)
	case "error":
		l.Logger.SetLevel(logrus.ErrorLevel)
	case "fatal":
		l.Logger.SetLevel(logrus.FatalLevel)
	case "panic":
		l.Logger.SetLevel(logrus.PanicLevel)
	default:
		l.Logger.SetLevel(logrus.InfoLevel)
	}
}

func (l *Logger) SetFormat(format string) {
	switch format {
	case "json":
		l.Logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})
	case "text":
		l.Logger.SetFormatter(&logrus.TextFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
			FullTimestamp:   true,
		})
	default:
		l.Logger.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})
	}
}
