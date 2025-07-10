package logger

import (
	"github.com/sirupsen/logrus"
)

var Log *logrus.Logger

func Init(level, format string) {
	Log = logrus.New()

	// 设置格式
	SetFormat(format)

	// 设置级别
	SetLevel(level)

	// 初始化文件分级 Hook
	AddFileHook(Log)

	Log.Info("Logger initialized")
}

func SetFormat(format string) {
	switch format {
	case "json":
		Log.SetFormatter(&logrus.JSONFormatter{
			TimestampFormat: "2006-01-02 15:04:05",
		})
	case "text":
		Log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp:   true,
			TimestampFormat: "2006-01-02 15:04:05",
		})
	default:
		Log.SetFormatter(&logrus.JSONFormatter{})
	}
}

func SetLevel(level string) {
	switch level {
	case "debug":
		Log.SetLevel(logrus.DebugLevel)
	case "info":
		Log.SetLevel(logrus.InfoLevel)
	case "warn":
		Log.SetLevel(logrus.WarnLevel)
	case "error":
		Log.SetLevel(logrus.ErrorLevel)
	default:
		Log.SetLevel(logrus.InfoLevel)
	}
}
