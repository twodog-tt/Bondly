# Redis用户信息清除脚本

这个脚本用于清除Bondly项目中的用户相关缓存数据，包括用户信息、会话、令牌等。

## 功能特性

- 🎯 **精确清除**：只删除用户相关的缓存，不影响其他数据
- 🔍 **预览模式**：可以预览将要删除的键，不实际删除
- 📊 **状态显示**：显示当前缓存状态和删除统计
- 🛡️ **安全连接**：自动检查Redis连接状态
- 🎨 **彩色输出**：友好的彩色终端输出

## 支持的缓存类型

| 缓存类型 | 键模式 | 描述 |
|---------|--------|------|
| 用户数据 | `bondly:user:*` | 用户基本信息缓存 |
| 用户声誉 | `bondly:user:*:reputation` | 用户声誉积分缓存 |
| 用户余额 | `bondly:user:*:balance` | 用户代币余额缓存 |
| 会话 | `bondly:session:*` | 用户会话缓存 |
| 令牌 | `bondly:token:*` | JWT令牌缓存 |

## 使用方法

### 通过Makefile使用（推荐）

```bash
# 查看Redis缓存状态
make redis-status

# 预览用户缓存（不实际删除）
make redis-clear-users-dry-run

# 清除所有用户相关缓存
make redis-clear-users

# 只清除会话缓存
make redis-clear-sessions

# 只清除令牌缓存
make redis-clear-tokens

# 只清除用户数据缓存
make redis-clear-user-data
```

### 直接使用脚本

```bash
# 查看帮助信息
./scripts/clear-redis-users.sh --help

# 查看当前缓存状态
./scripts/clear-redis-users.sh --dry-run

# 清除所有用户相关缓存
./scripts/clear-redis-users.sh --all-users

# 只清除会话缓存
./scripts/clear-redis-users.sh --sessions

# 连接到指定的Redis服务器
./scripts/clear-redis-users.sh -h 192.168.1.100 -p 6380 --all-users

# 使用不同的缓存前缀
./scripts/clear-redis-users.sh -c myapp --all-users
```

## 配置选项

脚本支持以下配置选项：

| 选项 | 环境变量 | 默认值 | 描述 |
|------|----------|--------|------|
| `-h, --host` | `REDIS_HOST` | `localhost` | Redis主机地址 |
| `-p, --port` | `REDIS_PORT` | `6379` | Redis端口 |
| `-a, --password` | `REDIS_PASSWORD` | 无 | Redis密码 |
| `-d, --db` | `REDIS_DB` | `0` | Redis数据库编号 |
| `-c, --prefix` | `CACHE_PREFIX` | `bondly` | 缓存键前缀 |

## 使用场景

### 1. 开发环境清理
```bash
# 清除所有用户缓存，重新开始测试
make redis-clear-users
```

### 2. 会话管理
```bash
# 强制所有用户重新登录
make redis-clear-sessions
```

### 3. 令牌刷新
```bash
# 清除所有JWT令牌，强制重新认证
make redis-clear-tokens
```

### 4. 用户数据重置
```bash
# 清除用户数据缓存，重新从数据库加载
make redis-clear-user-data
```

## 安全注意事项

⚠️ **重要提醒**：

1. **生产环境谨慎使用**：在生产环境中使用前，请确保了解影响
2. **备份重要数据**：清除前建议备份重要的Redis数据
3. **测试环境验证**：先在测试环境验证脚本功能
4. **权限检查**：确保有足够的Redis访问权限

## 故障排除

### 连接失败
```bash
# 检查Redis服务状态
redis-cli ping

# 检查网络连接
telnet localhost 6379

# 检查防火墙设置
sudo ufw status
```

### 权限问题
```bash
# 确保脚本有执行权限
chmod +x scripts/clear-redis-users.sh

# 检查Redis访问权限
redis-cli -a your_password ping
```

### 键模式不匹配
```bash
# 查看实际的键模式
redis-cli keys "*user*"

# 调整缓存前缀
./scripts/clear-redis-users.sh -c your_prefix --dry-run
```

## 示例输出

### 状态查看
```
📊 当前缓存状态

📊 用户数据缓存: 5 个键
📊 用户声誉缓存: 3 个键
✅ 用户余额缓存: 无数据
📊 会话缓存: 12 个键
📊 令牌缓存: 8 个键
```

### 清除操作
```
🧹 清除所有用户相关缓存

🗑️  删除 用户数据缓存 (5 个键)...
✅ 用户数据缓存 删除完成
🗑️  删除 用户声誉缓存 (3 个键)...
✅ 用户声誉缓存 删除完成
✅ 用户余额缓存: 无数据需要删除
🗑️  删除 会话缓存 (12 个键)...
✅ 会话缓存 删除完成
🗑️  删除 令牌缓存 (8 个键)...
✅ 令牌缓存 删除完成

🎉 所有用户相关缓存清除完成！
```

## 贡献

如果您发现任何问题或有改进建议，请提交Issue或Pull Request。 