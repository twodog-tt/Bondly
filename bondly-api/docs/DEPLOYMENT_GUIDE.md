# Bondly Deployment Configuration Guide

## 📋 Table of Contents

- [Airdrop Feature Configuration](#airdrop-feature-configuration)
- [Wallet Configuration](#wallet-configuration)
- [Database Configuration](#database-configuration)
- [Environment Variables Configuration](#environment-variables-configuration)

---

## 🪙 Airdrop Feature Configuration

### Feature Overview

When new users register/login for the first time, the system will automatically airdrop 1000 BOND tokens to the user's wallet address.

### Configuration Steps

#### 1. Environment Variables Configuration

Add the following configuration to the `.env` file:

```bash
# Ethereum network configuration
ETH_RPC_URL=http://localhost:8545  # or your Ethereum node URL

# Relay wallet private key (Important: keep it secure)
ETH_RELAY_WALLET_KEY=your-relay-wallet-private-key (remove 0x prefix)

# BOND token contract address
ETH_CONTRACT_ADDRESS=0x8Cb00D43b5627528d97831b9025F33aE3dE7415E
```

#### 2. Relay Wallet Setup

1. **Create relay wallet**:
   - Address: `0x2C830B8D1a6A9B840bde165a36df2A69fc9AA075`
   - Ensure the wallet has sufficient BOND token balance (recommend at least 10000)

2. **Get private key**:
   - Export private key from wallet
   - Remove `0x` prefix
   - Securely save to environment variables

#### 3. Database Migration

Execute database migration script:

```bash
# Method 1: Using psql
psql -U youruser -d yourdb -f cmd/migrate/add_airdrop_tables.sql

# Method 2: Using database management tool
# Manually execute SQL script content
```

Migration script will:
- Add `has_received_airdrop` field to `users` table
- Create `airdrop_records` table to record airdrop transactions

#### 4. Test Configuration

Run test script to verify configuration:

```bash
go run cmd/test-airdrop/main.go
```

Test script will check:
- Database connection
- Ethereum network connection
- Relay wallet balance
- Whether configuration is correct

### Feature Flow

#### User Registration Process

1. User registers new account
2. System checks if user is new and hasn't received airdrop
3. If conditions are met, asynchronously execute airdrop:
   - Check relay wallet balance
   - Initiate BOND token transfer transaction
   - Record airdrop transaction
   - Mark user as having received airdrop
4. Wait for transaction confirmation and update status

#### Airdrop Records

Each airdrop will be recorded in the `airdrop_records` table:
- User ID
- Wallet address
- Airdrop amount
- Transaction hash
- Status (pending/success/failed)
- Timestamp

### Security Considerations

#### 1. Private Key Security
- Relay wallet private key must be stored securely
- Do not hardcode in code
- Recommend using key management service

#### 2. Prevent Duplicate Airdrops
- System prevents duplicate airdrops through `has_received_airdrop` field
- Each user can only receive one airdrop

#### 3. Balance Monitoring
- Regularly check relay wallet balance
- Set up balance alerts

#### 4. Transaction Monitoring
- Monitor airdrop transaction status
- Handle failed transactions

### API Endpoints

#### Get User Airdrop Status

```http
GET /api/users/{user_id}/airdrop-status
```

#### Get Airdrop History

```http
GET /api/admin/airdrop-history?offset=0&limit=20
```

### Monitoring and Alerts

Recommended monitoring setup:

1. **Relay wallet balance monitoring**
2. **Airdrop success rate monitoring**
3. **Transaction confirmation time monitoring**
4. **Failed transaction alerts**

---

## 🔐 Wallet Configuration

### WALLET_SECRET_KEY Environment Variable Configuration

The `/api/v1/wallets/generate` endpoint requires the `WALLET_SECRET_KEY` environment variable to encrypt generated hosted wallet private keys.

### Configuration Steps

#### 1. Copy Environment Variable Template
```bash
cp env.example .env
```

#### 2. Generate Secure 32-byte Key
```bash
# Use OpenSSL to generate random key
openssl rand -hex 32
```

#### 3. Update .env File
Set the generated key in the `.env` file:
```env
WALLET_SECRET_KEY=your-generated-32-byte-hex-key
```

### Example Configuration

```env
# Other configurations...
WALLET_SECRET_KEY=2be4a7a16aa1c7f6be3cfb64aa1b7215bbf3e1aeab5e5bca867bb0d4adf35cb7
```

### Security Considerations

- **Do not commit real keys to version control system**
- **Use strong random keys in production environment**
- **Regularly rotate keys**
- **Ensure key length is 32 bytes (64 hexadecimal characters)**

### Verify Configuration

After starting the service, you can verify the configuration with:

```bash
# Test wallet generation endpoint
curl -X POST http://localhost:8080/api/v1/wallets/generate \
  -H "Content-Type: application/json"
```

If configured correctly, the endpoint will return generated hosted wallet information.

---

## 🗄️ Database Configuration

### Database Migration

```bash
# Run database migration
go run cmd/migrate/main.go
```

### Data Seeding

```bash
# Seed test data
go run cmd/seed-data/main.go
```

### View Table Structure

```bash
# Run table structure viewer
go run cmd/read-schema/main.go
```

---

## ⚙️ Environment Variables Configuration

### Complete Environment Variables Example

```env
# Server configuration
SERVER_HOST=localhost
SERVER_PORT=8080

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=bondly_db
DB_SSL_MODE=disable

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Email configuration
EMAIL_PROVIDER=resend
EMAIL_RESEND_KEY=your-resend-api-key
EMAIL_FROM_EMAIL=noreply@bondly.com

# Ethereum configuration
ETH_RPC_URL=http://localhost:8545
ETH_RELAY_WALLET_KEY=your-relay-wallet-private-key
ETH_CONTRACT_ADDRESS=0x8Cb00D43b5627528d97831b9025F33aE3dE7415E

# Wallet configuration
WALLET_SECRET_KEY=your-32-byte-wallet-secret-key

# Logging configuration
LOG_LEVEL=info
LOG_FORMAT=json

# CORS configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Troubleshooting

#### Common Issues

1. **Compilation errors**:
   ```bash
   go mod tidy
   go build -o bondly-api .
   ```

2. **Database connection failure**:
   - Check database configuration
   - Ensure database service is running

3. **Ethereum connection failure**:
   - Check RPC URL
   - Ensure network connection is normal

4. **Airdrop failure**:
   - Check relay wallet balance
   - Check private key configuration
   - View log error messages

#### Log Viewing

Airdrop-related logs will record:
- Business logic logs
- Database operation logs
- Blockchain transaction logs

---

## 🔧 Extended Features

Future considerations for adding:

1. **Batch airdrop functionality**
2. **Configurable airdrop amounts**
3. **Extended airdrop conditions** (such as invitation rewards)
4. **Airdrop statistics reports** 