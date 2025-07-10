package logger

import (
	"os"
	"time"

	rotatelogs "github.com/lestrrat-go/file-rotatelogs"
	"github.com/sirupsen/logrus"
	"github.com/sirupsen/logrus/hooks/writer"
)

func AddFileHook(logger *logrus.Logger) {
	// 检查是否在Docker环境中运行
	if os.Getenv("DOCKER_ENV") == "true" {
		// Docker环境中只输出到控制台，不写入文件
		logger.Info("Running in Docker environment - logs will only output to console")
		return
	}

	logDir := "./logs"

	// 保留标准输出，同时写入文件
	// logger.SetOutput(io.Discard)  // 注释掉这行，保留控制台输出

	// 按天分割日志文件
	infoWriter, _ := rotatelogs.New(
		logDir+"/info.%Y%m%d.log",
		rotatelogs.WithLinkName(logDir+"/info.log"),
		rotatelogs.WithRotationTime(24*time.Hour),
		rotatelogs.WithMaxAge(7*24*time.Hour),
	)
	errorWriter, _ := rotatelogs.New(
		logDir+"/error.%Y%m%d.log",
		rotatelogs.WithLinkName(logDir+"/error.log"),
		rotatelogs.WithRotationTime(24*time.Hour),
		rotatelogs.WithMaxAge(7*24*time.Hour),
	)

	// Add hooks for different log levels
	logger.AddHook(&writer.Hook{
		Writer:    infoWriter,
		LogLevels: []logrus.Level{logrus.InfoLevel, logrus.WarnLevel},
	})

	logger.AddHook(&writer.Hook{
		Writer:    errorWriter,
		LogLevels: []logrus.Level{logrus.ErrorLevel, logrus.FatalLevel, logrus.PanicLevel},
	})
}
