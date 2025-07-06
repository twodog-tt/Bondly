package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Ethereum EthereumConfig
	Kafka    KafkaConfig
	Logging  LoggingConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port string
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type EthereumConfig struct {
	RPCURL          string
	PrivateKey      string
	ContractAddress string
}

type KafkaConfig struct {
	Brokers     []string
	TopicEvents string
}

type LoggingConfig struct {
	Level  string
	Format string
}

type CORSConfig struct {
	AllowedOrigins []string
}

func Load() (*Config, error) {
	// 加载 .env 文件
	if err := godotenv.Load(); err != nil {
		// 如果 .env 文件不存在，继续使用环境变量
	}

	return &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "localhost"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "bondly_db"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		Ethereum: EthereumConfig{
			RPCURL:          getEnv("ETH_RPC_URL", "http://localhost:8545"),
			PrivateKey:      getEnv("ETH_PRIVATE_KEY", ""),
			ContractAddress: getEnv("ETH_CONTRACT_ADDRESS", ""),
		},
		Kafka: KafkaConfig{
			Brokers:     []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
			TopicEvents: getEnv("KAFKA_TOPIC_BONDLY_EVENTS", "bondly_events"),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
		CORS: CORSConfig{
			AllowedOrigins: []string{getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173")},
		},
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
