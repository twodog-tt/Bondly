package cache

import (
	"bondly-api/internal/redis"
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// CacheService 缓存服务接口
type CacheService interface {
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Get(ctx context.Context, key string, dest interface{}) error
	Del(ctx context.Context, keys ...string) error
	Exists(ctx context.Context, keys ...string) (int64, error)
	Expire(ctx context.Context, key string, expiration time.Duration) error
	TTL(ctx context.Context, key string) (time.Duration, error)
	Incr(ctx context.Context, key string) (int64, error)
	IncrBy(ctx context.Context, key string, value int64) (int64, error)
	Close() error
}

// RedisCacheService Redis 缓存服务实现
type RedisCacheService struct {
	client *redis.RedisClient
}

// NewRedisCacheService 创建新的 Redis 缓存服务
func NewRedisCacheService(client *redis.RedisClient) CacheService {
	return &RedisCacheService{
		client: client,
	}
}

// Set 设置缓存
func (r *RedisCacheService) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	// 序列化值
	data, err := r.serialize(value)
	if err != nil {
		return fmt.Errorf("failed to serialize value: %v", err)
	}

	return r.client.Set(ctx, key, data, expiration)
}

// Get 获取缓存
func (r *RedisCacheService) Get(ctx context.Context, key string, dest interface{}) error {
	// 获取原始数据
	data, err := r.client.Get(ctx, key)
	if err != nil {
		return err
	}

	// 反序列化
	return r.deserialize(data, dest)
}

// Del 删除缓存
func (r *RedisCacheService) Del(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...)
}

// Exists 检查缓存是否存在
func (r *RedisCacheService) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.client.Exists(ctx, keys...)
}

// Expire 设置过期时间
func (r *RedisCacheService) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return r.client.Expire(ctx, key, expiration)
}

// TTL 获取剩余生存时间
func (r *RedisCacheService) TTL(ctx context.Context, key string) (time.Duration, error) {
	return r.client.TTL(ctx, key)
}

// Incr 递增
func (r *RedisCacheService) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key)
}

// IncrBy 按指定值递增
func (r *RedisCacheService) IncrBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.IncrBy(ctx, key, value)
}

// Close 关闭连接
func (r *RedisCacheService) Close() error {
	return r.client.Close()
}

// serialize 序列化对象
func (r *RedisCacheService) serialize(value interface{}) (string, error) {
	switch v := value.(type) {
	case string:
		return v, nil
	case []byte:
		return string(v), nil
	case int, int8, int16, int32, int64, uint, uint8, uint16, uint32, uint64:
		return fmt.Sprintf("%v", v), nil
	case float32, float64:
		return fmt.Sprintf("%v", v), nil
	case bool:
		return fmt.Sprintf("%v", v), nil
	default:
		// 复杂对象使用 JSON 序列化
		data, err := json.Marshal(value)
		if err != nil {
			return "", err
		}
		return string(data), nil
	}
}

// deserialize 反序列化对象
func (r *RedisCacheService) deserialize(data string, dest interface{}) error {
	switch dest := dest.(type) {
	case *string:
		*dest = data
		return nil
	case *[]byte:
		*dest = []byte(data)
		return nil
	default:
		// 复杂对象使用 JSON 反序列化
		return json.Unmarshal([]byte(data), dest)
	}
}

// CacheKeyBuilder 缓存键构建器
type CacheKeyBuilder struct {
	prefix string
}

// NewCacheKeyBuilder 创建缓存键构建器
func NewCacheKeyBuilder(prefix string) *CacheKeyBuilder {
	return &CacheKeyBuilder{
		prefix: prefix,
	}
}

// UserKey 构建用户缓存键
func (c *CacheKeyBuilder) UserKey(address string) string {
	return fmt.Sprintf("%s:user:%s", c.prefix, address)
}

// UserReputationKey 构建用户声誉缓存键
func (c *CacheKeyBuilder) UserReputationKey(address string) string {
	return fmt.Sprintf("%s:user:%s:reputation", c.prefix, address)
}

// UserBalanceKey 构建用户余额缓存键
func (c *CacheKeyBuilder) UserBalanceKey(address string) string {
	return fmt.Sprintf("%s:user:%s:balance", c.prefix, address)
}

// ContentKey 构建内容缓存键
func (c *CacheKeyBuilder) ContentKey(id uint) string {
	return fmt.Sprintf("%s:content:%d", c.prefix, id)
}

// ContentListKey 构建内容列表缓存键
func (c *CacheKeyBuilder) ContentListKey(page, limit int) string {
	return fmt.Sprintf("%s:content:list:%d:%d", c.prefix, page, limit)
}

// ProposalKey 构建提案缓存键
func (c *CacheKeyBuilder) ProposalKey(id uint) string {
	return fmt.Sprintf("%s:proposal:%d", c.prefix, id)
}

// ProposalListKey 构建提案列表缓存键
func (c *CacheKeyBuilder) ProposalListKey(page, limit int) string {
	return fmt.Sprintf("%s:proposal:list:%d:%d", c.prefix, page, limit)
}

// SessionKey 构建会话缓存键
func (c *CacheKeyBuilder) SessionKey(sessionID string) string {
	return fmt.Sprintf("%s:session:%s", c.prefix, sessionID)
}

// TokenKey 构建令牌缓存键
func (c *CacheKeyBuilder) TokenKey(token string) string {
	return fmt.Sprintf("%s:token:%s", c.prefix, token)
}

// RateLimitKey 构建限流缓存键
func (c *CacheKeyBuilder) RateLimitKey(identifier string) string {
	return fmt.Sprintf("%s:ratelimit:%s", c.prefix, identifier)
}

// StatsKey 构建统计缓存键
func (c *CacheKeyBuilder) StatsKey(statsType string) string {
	return fmt.Sprintf("%s:stats:%s", c.prefix, statsType)
}

// CacheConfig 缓存配置
type CacheConfig struct {
	DefaultExpiration time.Duration
	UserCacheTTL      time.Duration
	ContentCacheTTL   time.Duration
	ProposalCacheTTL  time.Duration
	SessionCacheTTL   time.Duration
	StatsCacheTTL     time.Duration
}

// DefaultCacheConfig 默认缓存配置
func DefaultCacheConfig() CacheConfig {
	return CacheConfig{
		DefaultExpiration: 1 * time.Hour,
		UserCacheTTL:      30 * time.Minute,
		ContentCacheTTL:   15 * time.Minute,
		ProposalCacheTTL:  10 * time.Minute,
		SessionCacheTTL:   24 * time.Hour,
		StatsCacheTTL:     5 * time.Minute,
	}
}
