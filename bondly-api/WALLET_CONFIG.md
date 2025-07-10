# 钱包配置说明

## WALLET_SECRET_KEY 环境变量配置

`/api/v1/wallets/generate` 接口需要配置 `WALLET_SECRET_KEY` 环境变量来加密生成的托管钱包私钥。

### 配置步骤

1. **复制环境变量模板**
   ```bash
   cp env.example .env
   ```

2. **生成安全的32字节密钥**
   ```bash
   # 使用 OpenSSL 生成随机密钥
   openssl rand -hex 32
   ```

3. **更新 .env 文件**
   将生成的密钥设置到 `.env` 文件中：
   ```env
   WALLET_SECRET_KEY=your-generated-32-byte-hex-key
   ```

### 示例配置

```env
# 其他配置...
WALLET_SECRET_KEY=2be4a7a16aa1c7f6be3cfb64aa1b7215bbf3e1aeab5e5bca867bb0d4adf35cb7
```

### 安全注意事项

- **不要将真实的密钥提交到版本控制系统**
- **在生产环境中使用强随机密钥**
- **定期轮换密钥**
- **确保密钥长度为32字节（64个十六进制字符）**

### 验证配置

启动服务后，可以通过以下方式验证配置：

```bash
# 测试钱包生成接口
curl -X POST http://localhost:8080/api/v1/wallets/generate \
  -H "Content-Type: application/json"
```

如果配置正确，接口将返回生成的托管钱包信息。 