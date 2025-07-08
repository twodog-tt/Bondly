package redis

import (
	"bondly-api/config"
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	client *redis.Client
	config config.RedisConfig
}

// NewRedisClient 创建新的 Redis 客户端
func NewRedisClient(cfg config.RedisConfig) (*RedisClient, error) {
	// 创建 Redis 客户端配置
	options := &redis.Options{
		Addr:         fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		MinIdleConns: cfg.MinIdleConns,
		MaxRetries:   cfg.MaxRetries,
		DialTimeout:  time.Duration(cfg.DialTimeout) * time.Second,
		ReadTimeout:  time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
	}

	// 创建客户端
	client := redis.NewClient(options)

	// 测试连接
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %v", err)
	}

	return &RedisClient{
		client: client,
		config: cfg,
	}, nil
}

// GetClient 获取原始 Redis 客户端
func (r *RedisClient) GetClient() *redis.Client {
	return r.client
}

// Set 设置键值对
func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Get 获取值
func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	result := r.client.Get(ctx, key)
	if result.Err() == redis.Nil {
		return "", fmt.Errorf("key does not exist")
	}
	return result.Val(), result.Err()
}

// Del 删除键
func (r *RedisClient) Del(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists 检查键是否存在
func (r *RedisClient) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.client.Exists(ctx, keys...).Result()
}

// Expire 设置键的过期时间
func (r *RedisClient) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return r.client.Expire(ctx, key, expiration).Err()
}

// TTL 获取键的剩余生存时间
func (r *RedisClient) TTL(ctx context.Context, key string) (time.Duration, error) {
	return r.client.TTL(ctx, key).Result()
}

// HSet 设置哈希表字段
func (r *RedisClient) HSet(ctx context.Context, key string, values ...interface{}) error {
	return r.client.HSet(ctx, key, values...).Err()
}

// HGet 获取哈希表字段值
func (r *RedisClient) HGet(ctx context.Context, key, field string) (string, error) {
	result := r.client.HGet(ctx, key, field)
	if result.Err() == redis.Nil {
		return "", fmt.Errorf("field does not exist")
	}
	return result.Val(), result.Err()
}

// HGetAll 获取哈希表所有字段和值
func (r *RedisClient) HGetAll(ctx context.Context, key string) (map[string]string, error) {
	return r.client.HGetAll(ctx, key).Result()
}

// HDel 删除哈希表字段
func (r *RedisClient) HDel(ctx context.Context, key string, fields ...string) error {
	return r.client.HDel(ctx, key, fields...).Err()
}

// LPush 从列表左边推入元素
func (r *RedisClient) LPush(ctx context.Context, key string, values ...interface{}) error {
	return r.client.LPush(ctx, key, values...).Err()
}

// RPush 从列表右边推入元素
func (r *RedisClient) RPush(ctx context.Context, key string, values ...interface{}) error {
	return r.client.RPush(ctx, key, values...).Err()
}

// LPop 从列表左边弹出元素
func (r *RedisClient) LPop(ctx context.Context, key string) (string, error) {
	result := r.client.LPop(ctx, key)
	if result.Err() == redis.Nil {
		return "", fmt.Errorf("list is empty")
	}
	return result.Val(), result.Err()
}

// RPop 从列表右边弹出元素
func (r *RedisClient) RPop(ctx context.Context, key string) (string, error) {
	result := r.client.RPop(ctx, key)
	if result.Err() == redis.Nil {
		return "", fmt.Errorf("list is empty")
	}
	return result.Val(), result.Err()
}

// LRange 获取列表指定范围的元素
func (r *RedisClient) LRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.LRange(ctx, key, start, stop).Result()
}

// SAdd 向集合添加成员
func (r *RedisClient) SAdd(ctx context.Context, key string, members ...interface{}) error {
	return r.client.SAdd(ctx, key, members...).Err()
}

// SMembers 获取集合所有成员
func (r *RedisClient) SMembers(ctx context.Context, key string) ([]string, error) {
	return r.client.SMembers(ctx, key).Result()
}

// SIsMember 检查元素是否是集合成员
func (r *RedisClient) SIsMember(ctx context.Context, key string, member interface{}) (bool, error) {
	return r.client.SIsMember(ctx, key, member).Result()
}

// SRem 从集合移除成员
func (r *RedisClient) SRem(ctx context.Context, key string, members ...interface{}) error {
	return r.client.SRem(ctx, key, members...).Err()
}

// ZAdd 向有序集合添加成员
func (r *RedisClient) ZAdd(ctx context.Context, key string, members ...redis.Z) error {
	return r.client.ZAdd(ctx, key, members...).Err()
}

// ZRange 获取有序集合指定范围的成员
func (r *RedisClient) ZRange(ctx context.Context, key string, start, stop int64) ([]string, error) {
	return r.client.ZRange(ctx, key, start, stop).Result()
}

// ZRangeWithScores 获取有序集合指定范围的成员及分数
func (r *RedisClient) ZRangeWithScores(ctx context.Context, key string, start, stop int64) ([]redis.Z, error) {
	return r.client.ZRangeWithScores(ctx, key, start, stop).Result()
}

// ZRem 从有序集合移除成员
func (r *RedisClient) ZRem(ctx context.Context, key string, members ...interface{}) error {
	return r.client.ZRem(ctx, key, members...).Err()
}

// Incr 递增整数值
func (r *RedisClient) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// IncrBy 按指定值递增
func (r *RedisClient) IncrBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.IncrBy(ctx, key, value).Result()
}

// Decr 递减整数值
func (r *RedisClient) Decr(ctx context.Context, key string) (int64, error) {
	return r.client.Decr(ctx, key).Result()
}

// DecrBy 按指定值递减
func (r *RedisClient) DecrBy(ctx context.Context, key string, value int64) (int64, error) {
	return r.client.DecrBy(ctx, key, value).Result()
}

// FlushDB 清空当前数据库
func (r *RedisClient) FlushDB(ctx context.Context) error {
	return r.client.FlushDB(ctx).Err()
}

// Keys 获取所有匹配模式的键
func (r *RedisClient) Keys(ctx context.Context, pattern string) ([]string, error) {
	return r.client.Keys(ctx, pattern).Result()
}

// Ping 测试连接
func (r *RedisClient) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// Close 关闭连接
func (r *RedisClient) Close() error {
	return r.client.Close()
}

// GetStats 获取连接池统计信息
func (r *RedisClient) GetStats() *redis.PoolStats {
	return r.client.PoolStats()
}
