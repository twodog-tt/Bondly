package config

import (
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Redis    RedisConfig
	Ethereum EthereumConfig
	Kafka    KafkaConfig
	Logging  LoggingConfig
	CORS     CORSConfig
	JWT      JWTConfig
	Wallet   WalletConfig
	Email    EmailConfig
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

type RedisConfig struct {
	Host         string
	Port         string
	Password     string
	DB           int
	PoolSize     int
	MinIdleConns int
	MaxRetries   int
	DialTimeout  int // seconds
	ReadTimeout  int // seconds
	WriteTimeout int // seconds
}

type EthereumConfig struct {
	RPCURL                 string
	PrivateKey             string
	ContractAddress        string
	RelayWalletKey         string // 中转钱包私钥
	ReputationVaultAddress string // ReputationVault合约地址
	ContentNFTAddress      string // ContentNFT合约地址
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

type JWTConfig struct {
	Secret    string
	ExpiresIn time.Duration
}

type WalletConfig struct {
	SecretKey string
}

type EmailConfig struct {
	Provider  string
	ResendKey string
	FromEmail string
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
		Redis: RedisConfig{
			Host:         getEnv("REDIS_HOST", "localhost"),
			Port:         getEnv("REDIS_PORT", "6379"),
			Password:     getEnv("REDIS_PASSWORD", ""),
			DB:           getEnvAsInt("REDIS_DB", 0),
			PoolSize:     getEnvAsInt("REDIS_POOL_SIZE", 10),
			MinIdleConns: getEnvAsInt("REDIS_MIN_IDLE_CONNS", 5),
			MaxRetries:   getEnvAsInt("REDIS_MAX_RETRIES", 3),
			DialTimeout:  getEnvAsInt("REDIS_DIAL_TIMEOUT", 5),
			ReadTimeout:  getEnvAsInt("REDIS_READ_TIMEOUT", 3),
			WriteTimeout: getEnvAsInt("REDIS_WRITE_TIMEOUT", 3),
		},
		Ethereum: EthereumConfig{
			RPCURL:                 getEnv("ETH_RPC_URL", "http://localhost:8545"),
			PrivateKey:             getEnv("ETH_PRIVATE_KEY", ""),
			ContractAddress:        getEnv("ETH_CONTRACT_ADDRESS", ""),
			RelayWalletKey:         getEnv("ETH_RELAY_WALLET_KEY", ""),
			ReputationVaultAddress: getEnv("ETH_REPUTATION_VAULT_ADDRESS", ""),
			ContentNFTAddress:      getEnv("ETH_CONTENT_NFT_ADDRESS", ""),
		},
		Kafka: KafkaConfig{
			Brokers:     strings.Split(getEnv("KAFKA_BROKERS", "localhost:9092"), ","),
			TopicEvents: getEnv("KAFKA_TOPIC_BONDLY_EVENTS", "bondly_events"),
		},
		Logging: LoggingConfig{
			Level:  getEnv("LOG_LEVEL", "info"),
			Format: getEnv("LOG_FORMAT", "json"),
		},
		CORS: CORSConfig{
			AllowedOrigins: strings.Split(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,http://localhost:5174"), ","),
		},
		JWT: JWTConfig{
			Secret:    getEnv("JWT_SECRET", "your-secret-key"),
			ExpiresIn: time.Duration(getEnvAsInt("JWT_EXPIRES_IN_HOURS", 24)) * time.Hour,
		},
		Wallet: WalletConfig{
			SecretKey: getEnv("WALLET_SECRET_KEY", ""),
		},
		Email: EmailConfig{
			Provider:  getEnv("EMAIL_PROVIDER", "mock"),
			ResendKey: getEnv("RESEND_API_KEY", ""),
			FromEmail: getEnv("EMAIL_FROM", ""),
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
