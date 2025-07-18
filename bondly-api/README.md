# Bondly API

> **Backend API service built with Go + Gin + GORM**

## 🚀 Quick Start

### Environment Requirements
- Go 1.21+
- PostgreSQL 12+
- Redis 6+
- Docker (Recommended)

### Local Development

```bash
# 1. Clone project
git clone <repository>
cd bondly-api

# 2. Configure environment variables
cp env.example .env
# Edit .env file to set database and Redis connections

# 3. Install dependencies
go mod download

# 4. Start dependency services with Docker
docker-compose -f docker-compose.dev.yml up -d

# 5. Run application
go run main.go
```

### API Documentation
After starting, visit Swagger UI: `http://localhost:8080/swagger/index.html`

### Database Documentation
Detailed database table structure description: [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)

## 📊 Database Table Structure

### Database Overview
- **Database Name**: bondly_db
- **Total Tables**: 9 tables
- **Database Type**: PostgreSQL

### Table Structure Details

#### 1. **users Table** (User Table)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
    avatar_url TEXT,
    bio TEXT,
    role VARCHAR(255) NOT NULL DEFAULT 'user',
    reputation_score BIGINT NOT NULL DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    custody_wallet_address VARCHAR(42),
    encrypted_private_key TEXT
);

-- Constraints
CHECK (char_length(wallet_address) = 42)
CHECK (char_length(custody_wallet_address) = 42)
CHECK (position('@' in email) > 1)
CHECK (char_length(nickname) > 0)
CHECK (role IN ('user', 'admin', 'moderator'))
CHECK (reputation_score >= 0)

-- Indexes
UNIQUE INDEX idx_users_wallet_address (wallet_address)
UNIQUE INDEX idx_users_email (email)
```

#### 2. **posts Table** (Article Table)
```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    likes INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Constraints
CHECK (char_length(title) > 0)
CHECK (char_length(content) > 0)
CHECK (likes >= 0)
CHECK (views >= 0)

-- Indexes
INDEX idx_posts_author (author_id)
INDEX idx_posts_created_at (created_at)
INDEX idx_posts_is_published (is_published)
```

#### 3. **comments Table** (Comment Table)
```sql
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id BIGINT,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);

-- Constraints
CHECK (char_length(content) > 0)
CHECK (likes >= 0)

-- Indexes
INDEX idx_comments_post (post_id)
INDEX idx_comments_author (author_id)
INDEX idx_comments_parent (parent_comment_id)
```

#### 4. **user_followers Table** (User Follow Relationship Table)
```sql
CREATE TABLE user_followers (
    follower_id BIGINT NOT NULL,
    followed_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followed_id),
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (follower_id <> followed_id)
);

-- Indexes
INDEX idx_user_followers_follower_id (follower_id)
INDEX idx_user_followers_followed_id (followed_id)
```

#### 5. **wallet_bindings Table** (Wallet Binding Table)
```sql
CREATE TABLE wallet_bindings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    network VARCHAR(255) NOT NULL DEFAULT 'ethereum',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user_id, wallet_address)
);

-- Constraints
CHECK (char_length(wallet_address) = 42)
CHECK (network IN ('ethereum', 'polygon', 'arbitrum', 'optimism', 'bsc'))

-- Indexes
INDEX idx_wallet_bindings_user_id (user_id)
INDEX idx_wallet_bindings_wallet_address (wallet_address)
```

#### 6. **contents Table** (Content Table - Legacy)
```sql
CREATE TABLE contents (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT,
    title TEXT,
    content TEXT,
    type TEXT,
    status TEXT DEFAULT 'draft',
    likes BIGINT DEFAULT 0,
    dislikes BIGINT DEFAULT 0,
    views BIGINT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Indexes
INDEX idx_contents_deleted_at (deleted_at)
```

#### 7. **proposals Table** (Proposal Table)
```sql
CREATE TABLE proposals (
    id BIGSERIAL PRIMARY KEY,
    title TEXT,
    description TEXT,
    proposer_id BIGINT,
    status TEXT DEFAULT 'active',
    votes_for BIGINT DEFAULT 0,
    votes_against BIGINT DEFAULT 0,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (proposer_id) REFERENCES users(id)
);

-- Indexes
INDEX idx_proposals_deleted_at (deleted_at)
```

#### 8. **votes Table** (Vote Table)
```sql
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    proposal_id BIGINT,
    voter_id BIGINT,
    vote BOOLEAN,
    weight BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id),
    FOREIGN KEY (voter_id) REFERENCES users(id)
);

-- Indexes
INDEX idx_votes_deleted_at (deleted_at)
```

#### 9. **transactions Table** (Transaction Table)
```sql
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    hash TEXT UNIQUE,
    from_address TEXT,
    to_address TEXT,
    value TEXT,
    gas_used BIGINT,
    gas_price TEXT,
    status TEXT,
    block_number BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
INDEX idx_transactions_hash (hash) UNIQUE
INDEX idx_transactions_deleted_at (deleted_at)
```

### Table Relationship Diagram

```
users (User Table)
├── 1:N posts (Article Table) - author_id
├── 1:N comments (Comment Table) - author_id
├── 1:N proposals (Proposal Table) - proposer_id
├── 1:N votes (Vote Table) - voter_id
├── 1:N wallet_bindings (Wallet Binding Table) - user_id
├── 1:N user_followers (Follow Relationship Table) - follower_id
└── 1:N user_followers (Follow Relationship Table) - followed_id

posts (Article Table)
└── 1:N comments (Comment Table) - post_id

comments (Comment Table)
└── 1:N comments (Nested Comments) - parent_comment_id

proposals (Proposal Table)
└── 1:N votes (Vote Table) - proposal_id

transactions (Transaction Table) - Independent table, records blockchain transactions
```

### Core Function Modules

1. **User System**: Supports both email and wallet login, user follow mechanism
2. **Content Management**: Article publishing, comment system (supports nested comments)
3. **Wallet Management**: Multi-network wallet binding, hosted wallet support
4. **Governance System**: Proposal voting mechanism
5. **Blockchain Integration**: Transaction recording and status tracking
6. **Reputation System**: On-chain reputation management, governance qualification verification, reputation leaderboard

## 📚 Swagger Documentation Usage

### Features
- **Complete API Documentation**: 21 API endpoints covering 6 functional modules
- **Auto-generated curl**: Each endpoint automatically generates curl commands
- **Interactive Testing**: Supports online API testing
- **Detailed Parameter Documentation**: Includes request parameters, response format, error code descriptions

### Usage Guide

#### 1. View curl Examples
1. Open any API endpoint to expand details
2. Click the **"Try it out"** button in the top right
3. Fill in required parameters (example values will be auto-filled)
4. View the generated curl command below the parameter area
5. Click **"Execute"** to execute the request and view results

#### 2. API Group Overview
- **🔐 Authentication Management**: Email verification codes, login verification
- **👤 User Management**: User information, balance, reputation
- **⛓️ Blockchain**: Status queries, contract information
- **📄 Content Management**: Content CRUD operations
- **🏛️ Governance Management**: Proposals, voting system
- **🏆 Reputation System**: Reputation queries, leaderboard, governance qualification
- **🔍 System Monitoring**: Health checks, status monitoring

## 📁 Project Structure

```
bondly-api/
├── main.go                 # Application entry point
├── config/                 # Configuration management
├── internal/
│   ├── handlers/          # HTTP handlers
│   │   └── reputation_handlers.go # Reputation system handlers
│   ├── services/          # Business logic layer
│   │   └── reputation_service.go  # Reputation system service
│   ├── repositories/      # Data access layer
│   ├── models/            # Data models
│   ├── dto/               # Data transfer objects
│   │   └── reputation.go  # Reputation system DTO
│   ├── middleware/        # Middleware
│   ├── database/          # Database configuration
│   ├── redis/             # Redis client
│   ├── blockchain/        # Blockchain integration
│   │   └── reputation.go  # Reputation contract integration
│   └── utils/             # Utility functions
├── docs/                   # Swagger documentation
├── test_reputation_api.sh  # Reputation system API test script
└── docker-compose.dev.yml  # Development environment configuration
```

## 🔧 Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL + Redis
- **Message Queue**: Apache Kafka
- **Blockchain**: Ethereum (go-ethereum)
- **Documentation**: Swagger/OpenAPI

## 📚 Core Features

### Authentication Management
- Email verification code login
- JWT token authentication
- Session management

### User Management
- User information CRUD
- Balance queries
- User follow system

### Blockchain Integration
- Smart contract interaction
- Token staking operations
- Transaction status queries

### Content Management
- Article/post management
- Comment system
- Content moderation

### Governance System
- DAO proposal management
- Voting mechanism
- Governance statistics

### Reputation System
- On-chain reputation data synchronization
- Reputation leaderboard queries
- Governance qualification verification (≥100 reputation points)
- Admin reputation adjustments

## 🔗 Main API Endpoints

### Health Check
- `GET /health` - Service status
- `GET /health/redis` - Redis status

### Authentication
- `POST /api/v1/auth/send-code` - Send verification code
- `POST /api/v1/auth/verify-code` - Verify login

### User Management
- `GET /api/v1/users/:address` - Get user information
- `POST /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/:address/balance` - Query balance

### Blockchain
- `GET /api/v1/blockchain/status` - Blockchain status
- `POST /api/v1/blockchain/stake` - Stake tokens
- `GET /api/v1/blockchain/transactions/:address` - Transaction records

### Governance
- `GET /api/v1/governance/proposals` - Proposal list
- `POST /api/v1/governance/proposals` - Create proposal
- `POST /api/v1/governance/vote` - Vote

### Reputation System
- `GET /api/v1/reputation/user/:id` - Get user reputation
- `GET /api/v1/reputation/address/:address` - Query reputation by wallet address
- `GET /api/v1/reputation/ranking` - Reputation leaderboard
- `GET /api/v1/reputation/governance/eligible/:id` - Check governance eligibility

## ⚙️ Environment Variable Configuration

```bash
# Server configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=8080

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=bondly
DB_PASSWORD=password
DB_NAME=bondly_db

# Redis configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Blockchain configuration
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETH_CONTRACT_ADDRESS=0x...
ETH_REPUTATION_VAULT_ADDRESS=0x...

# Kafka configuration
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_BONDLY_EVENTS=bondly_events

# Logging configuration
LOG_LEVEL=info
LOG_FORMAT=json

# CORS configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# JWT configuration
JWT_SECRET=your-secret-key

# Wallet configuration
WALLET_SECRET_KEY=your-wallet-secret-key

# Email configuration
EMAIL_PROVIDER=mock
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=Bondly <noreply@yourdomain.com>
```

## 🛠️ Development Tools

### Database Table Structure Viewer
```bash
# View actual database table structure
go run cmd/read-schema/main.go
```

### Database Migration
```bash
# Run database migration
go run cmd/migrate/main.go
```

### Generate Swagger Documentation
```bash
# Generate API documentation
swag init -g main.go
```

## 📊 Unified Response Format

### Success Response
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // Actual data
  }
}
```

### Error Response
```json
{
  "code": 400,
  "message": "Error message",
  "data": null
}
```

## 🧪 Development Tools

```bash
# Format code
make fmt

# Code checking
make lint

# Run tests
make test

# Build application
make build

# Database migration
make migrate
```

## 🐳 Docker Deployment

```bash
# Build and start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check service status
docker ps

# View logs
docker logs bondly-api

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 🧪 API Testing Examples

### Authentication Interface Testing

```bash
# Send verification code
curl -X POST "http://localhost:8080/api/v1/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Verify login
curl -X POST "http://localhost:8080/api/v1/auth/verify-code" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'

# Query verification code status
curl "http://localhost:8080/api/v1/auth/code-status?email=test@example.com"
```

### User Interface Testing

```bash
# Get user information
curl "http://localhost:8080/api/v1/users/0x1234567890abcdef1234567890abcdef12345678"

# Query user balance
curl "http://localhost:8080/api/v1/users/0x1234567890abcdef1234567890abcdef12345678/balance"

# Create new user
curl -X POST "http://localhost:8080/api/v1/users" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "username": "testuser",
    "bio": "Test user profile"
  }'
```

### System Interface Testing

```bash
# Health check
curl "http://localhost:8080/health"

# Blockchain status
curl "http://localhost:8080/api/v1/blockchain/status"

# Governance proposal list
curl "http://localhost:8080/api/v1/governance/proposals"

# Reputation system testing
curl "http://localhost:8080/api/v1/reputation/user/1"
curl "http://localhost:8080/api/v1/reputation/address/0x1234567890abcdef1234567890abcdef12345678"
curl "http://localhost:8080/api/v1/reputation/ranking"
curl "http://localhost:8080/api/v1/reputation/governance/eligible/1"
```

## 📖 Development Guide

### Adding New Feature Modules

1. **Create Model** (`internal/models/`)
2. **Create Repository** (`internal/repositories/`)
3. **Create Service** (`internal/services/`)
4. **Create Handler** (`internal/handlers/`)
5. **Register Routes** (`internal/server/`)
6. **Add Swagger Comments**
7. **Write Test Cases**

### Best Practices

- Use layered architecture pattern
- Follow RESTful API design
- Unified error handling and logging
- Add Swagger documentation for all interfaces
- Write unit tests and integration tests
- Use dependency injection to improve testability

---

**Document Version**: v1.0 | **Last Updated**: 2024

## 🌱 Database Mock Data Seeding (Seed)

To facilitate development, integration, and frontend demonstrations, Bondly provides a one-click database seeding tool that generates realistic social data.

### Feature Overview
- Automatically generates users, articles, comments, follow relationships, wallet bindings, proposals, votes, on-chain transactions, and other data
- Data content fits Web3 social blogging scenarios, includes rich on-chain and off-chain interactions
- Supports multiple resets for repeated testing in development environment

### Usage Guide

1. **Ensure database is initialized and connectable** (recommend running `make migrate` first to complete table structure migration)
2. Execute in the bondly-api directory:

```bash
make seed
```

3. After successful execution, the database will automatically populate with mock data that can be viewed directly through the frontend or database tools.

### Data Type Description
- **Users**: Includes wallet addresses, emails, nicknames, avatars, roles, reputation scores, etc.
- **Articles**: Multi-topic content with tags, covers, view counts, like counts
- **Comments**: Distributed across different articles with diverse content
- **Follow Relationships**: Simulates real social network structure
- **Wallet Bindings**: Each user can bind multiple chain wallets, supports multi-chain
- **Proposals/Votes**: Proposals and votes in DAO governance scenarios
- **On-chain Transactions**: Simulates real on-chain transfers and status

### Important Notes
- Each execution of `make seed` will clear related tables and regenerate data (development environment only, do not run in production)
- To customize data volume or content, modify `cmd/seed-data/main.go`
- This tool is only for development, testing, and demonstration, not recommended for production environment 