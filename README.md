# **Bondly: 去中心化社交价值网络**

> **连接你信任的人，分享你创造的价值。**

---

## 一、项目简介

**Bondly** 是一个以去中心化金融（DeFi）为底层逻辑、以社交网络为驱动的 SocialFi 平台。它通过**质押机制**、**社交身份系统**、**内容金融化**和**渐进式钱包架构**，构建一个 **"互动即资产、声誉即信用"** 的新型社交生态。

Bondly 的愿景是重塑社交平台的价值分配结构，让用户从内容和关系的"贡献者"转变为资产的"拥有者"，最终实现"社交即经济"的完全去中心化平台。

---

## 二、项目亮点

| 模块          | 创新点                              |
| ----------- | -------------------------------- |
| 📱 用户入口     | 渐进式登录，支持邮箱/社交账户 → Web3 钱包        |
| 🧱 价值闭环     | 内容 → 互动 → 等级 → NFT → Token → 再质押 |
| 🔐 安全护栏     | 基于质押的互动门槛机制，防女巫攻击与刷量行为           |
| 📊 声誉系统     | 链上行为生成 SBT 声誉值，影响激励与权限           |
| 💸 Token 机制 | Token 与行为紧密绑定，非单纯治理用途            |
| ⚙️ 架构设计     | 全链上交互 + IPFS/Arweave 内容存储，完全去中心化 |

---

## 三、目标愿景

1. **赋予用户内容与社交资产的主权**
2. **实现行为价值的可度量与可流通**
3. **打造用户驱动的去中心化社交平台**
4. **重构"关注-内容-互动-收益"价值通道**

---

## 四、使用场景

### 1. 内容创作与 NFT 变现

KOL、博主等通过链上内容发布获得声誉、升级等级，并将高质量内容铸造成 NFT 进行出售或奖励。

### 2. 高质量互动激励

用户对内容进行点赞、评论、转发需质押 Token。互动质量越高，返还越多，且获得额外声誉值。

### 3. 链上声誉身份系统

用户链上行为构建声誉档案，生成 SBT（非转让 Token）作为身份标签，决定其社交权限与经济收益。

### 4. DAO 治理与社区仲裁

社区成员可通过声誉值参与治理，包括内容审查、举报仲裁、奖励分配、功能提案等。

---

## 五、技术架构

### 1. 核心智能合约

* **BondlyToken**：ERC20 代币，支持 UUPS 升级，结合铸造、质押、奖励等功能
* **ContentNFT**：内容 NFT 合约，支持创作者追踪、独立元数据、可转让
* **AchievementNFT**：成就 SBT 合约，不可转让，记录用户荣誉和身份
* **InteractionStaking**：互动质押合约，点赞/评论前质押，奖励归创作者
* **ReputationVault**：声誉分数管理，支持快照、治理门槛
* **RewardDistributor**：按声誉分配奖励，防止重复领取
* **BondlyDAO**：治理提案管理，支持押金/声誉双通道提案
* **BondlyVoting**：投票机制，支持 Token、Reputation、混合权重快照
* **BondlyTreasury**：资金库，治理资金安全、参数变更、紧急提取
* **BondlyRegistry**：合约注册表，统一寻址、升级、白名单校验

### 2. 钱包与登录体系

* **Web3Auth 登录系统**：邮箱/社交登录创建 MPC 钱包
* **钱包迁移机制**：导出私钥或转至 MetaMask 持有资产

### 3. 内容存储方案

* **去中心化存储**：IPFS 或 Arweave，用于内容文件
* **链上引用机制**：内容哈希存于区块链，保障不可篡改

---

## 六、Token 经济模型（Bond 代币）

### 代币用途：

* 内容互动质押
* 声誉分加速器
* 铸造内容/身份 NFT
* 治理投票权
* DAO 收益参与权

### 激励来源：

| 行为         | 奖励方式             |
| ---------- | ---------------- |
| 点赞/评论      | 高质量互动返还质押 + 奖励   |
| 发帖/内容NFT铸造 | 根据声誉等级获得平台 Token |
| 举报仲裁       | 正确举报可获得奖励，误判扣罚质押 |
| 等级提升       | 解锁更高级的铸造/治理/收益权限 |

---

## 七、三大系统设计

### 1. 激励闭环系统

> 行为 → 等级 → NFT → Token → 再质押/再成长

* 行为产生 EXP
* 达成阈值可铸造等级 NFT
* NFT 可展示、交易、参与额外权益
* 平台 Token 可用于解锁功能或参与质押

### 2. 信任护栏系统

> 质押 → 成本 → 声誉 → 权限

* 所有行为需质押，防止滥用
* 失败互动惩罚，优质互动奖励
* 声誉值高的用户质押需求更低，行为更自由

### 3. 增长通道系统

> 低门槛 → 渐进式迁移 → 数据主权

* 首次使用仅需邮箱登录
* 引导式迁移私钥/绑定 ENS
* 渐进式成长为链上原生用户

---

## 八、项目路线图（Hackathon 阶段）

| 阶段     | 内容                    |
| ------ | --------------------- |
| ✅ 阶段一  | 搭建渐进式登录系统 + MPC 钱包    |
| ✅ 阶段二  | 部署内容发布与互动质押合约         |
| ⏳ 阶段三  | 声誉分计算系统 + 等级成长机制      |
| 🔜 阶段四 | NFT 铸造合约集成 + SBT 声誉绑定 |
| 🔜 阶段五 | DAO 治理模块集成与仲裁机制上线     |

---

## 九、市场分析与竞品差异

| 项目            | Bondly 优势对比            |
| ------------- | ---------------------- |
| Lens Protocol | ✅ 内容 NFT + 声誉系统 + 互动质押 |
| Friend.tech   | ✅ 开放社交关系图谱 + 社区治理机制    |
| Farcaster     | ✅ 激励经济闭环 + 多行为金融化路径    |
| Deso          | ✅ 多链可部署架构 + 渐进式钱包迁移    |

---

## 十、风险与挑战

| 类型       | 问题             | 对策                  |
| -------- | -------------- | ------------------- |
| 用户门槛     | Web3 登录对新用户不友好 | 渐进式登录 + 引导式迁移流程     |
| 内容监管     | 上传违法内容难处理      | 引入离链缓存 + 仲裁 DAO 机制  |
| Token 滥发 | 激励强度大易稀释价值     | NFT 铸造销毁机制 + 质押锁仓周期 |
| 冷启动难     | 初期内容/互动不足      | 非链上互动通道 + 互动即挖矿激励   |

---

## 十一、总结

Bondly 试图回答一个关键问题：

> **"社交行为是否能像金融资产一样被自由度量、拥有与流通？"**

我们的答案是肯定的。

Bondly 不是另一个 Web3 社交 App，而是一个 **可以生成资产的行为引擎**、一个 **以用户为核心的去中心化平台协议**，将成为内容创作者、普通用户和 Web3 原住民之间的价值桥梁。

---

## 📁 项目结构

```
bondly/
├── bondly-fe/        # 前端项目
├── bondly-api/       # 后端 API 服务
├── bondly-contracts/ # 智能合约模块
├── docs/             # 技术文档中心
└── README.md         # 项目说明文档
```

### 模块说明

#### 🎨 **bondly-fe** - 前端应用
基于 React + TypeScript + Vite 构建的现代化 Web3 社交平台前端应用。

**核心功能：**
- 渐进式登录系统（邮箱/社交账户 → Web3 钱包）
- 富文本编辑器（支持 Markdown、图片、视频、代码块）
- 社交互动系统（点赞、评论、回复、举报）
- 打赏系统（支持 Token、NFT、SBT 打赏）
- 通知系统（全局通知和用户反馈）
- 多语言支持（中文、英文）

**技术栈：**
- React 18 + TypeScript + Vite
- Tailwind CSS + Headless UI
- Wagmi + Web3Auth
- i18next 国际化

**快速开始：**
```bash
cd bondly-fe
npm install
npm run dev
```

#### 🔧 **bondly-api** - 后端服务
基于 Golang 构建的高性能后端服务，提供 RESTful API 接口和 gRPC 服务。

**核心功能：**
- 用户管理（注册、登录、身份验证）
- 内容管理（存储、索引、审核）
- 社交互动（评论、点赞、关注）
- 区块链集成（智能合约交互、事件监听）
- 数据分析（用户行为、内容分析）
- 实时通信（WebSocket、消息推送）

**技术栈：**
- **语言框架**：Golang + Gin
- **数据库**：PostgreSQL + Redis
- **ORM**：GORM
- **区块链**：go-ethereum + ethers-go
- **消息队列**：Apache Kafka
- **缓存**：Redis
- **监控**：Prometheus + Grafana
- **日志**：Zap
- **容器化**：Docker + Docker Compose

**快速开始：**
```bash
cd bondly-api
go mod download
go run main.go
# 或者使用 Docker
docker-compose up
```

#### ⚡ **bondly-contracts** - 智能合约
基于 Solidity 开发的智能合约集合，提供去中心化的核心功能。

**核心合约：**
- **代币系统**：BondlyToken (ERC20 + UUPS 升级)
- **NFT 系统**：ContentNFT (内容 NFT)、AchievementNFT (成就 SBT)
- **声誉系统**：ReputationVault、RewardDistributor、MixedTokenReputationStrategy
- **互动质押**：InteractionStaking (点赞/评论质押机制)
- **治理系统**：BondlyDAO、BondlyVoting (提案与投票)
- **资金管理**：BondlyTreasury (资金库与参数管理)
- **注册表**：BondlyRegistry (合约地址管理与升级)

**技术栈：**
- Solidity 0.8.19 + Hardhat
- OpenZeppelin 5.3.0 安全合约
- TypeScript 测试脚本
- Etherscan 验证
- UUPS 升级模式

**测试覆盖：**
- 总体覆盖率：46.53%
- NFT 模块：96.15% (优秀)
- 代币模块：98.48% (优秀)
- 注册表模块：93.1% (优秀)

**快速开始：**
```bash
cd bondly-contracts
npm install
npx hardhat compile
npx hardhat test
npx hardhat coverage
```

#### 📚 **docs** - 技术文档
项目的技术文档中心，包含架构设计、API 文档、开发指南等。

**文档内容：**
- **架构文档**：系统设计、数据流、安全设计
- **开发文档**：环境搭建、代码规范、API 文档
- **部署文档**：环境要求、安装部署、配置说明
- **用户文档**：使用指南、FAQ、故障排除
- **合约文档**：合约概述、接口定义、部署指南
- **白皮书**：技术白皮书、经济模型、路线图

**文档工具：**
- Markdown 格式
- GitHub Pages 部署
- 版本控制管理
- 多语言支持

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0
- Go >= 1.21.0
- Git

### 克隆项目
```bash
git clone https://github.com/bondly/bondly.git
cd bondly
```

### 启动开发环境

#### 1. 启动前端
```bash
cd bondly-fe
npm install
npm run dev
# 访问 http://localhost:5173
```

#### 2. 启动后端（可选）
```bash
cd bondly-api
go mod download
go run main.go
# 或者使用 Docker
docker-compose up
# API 服务运行在 http://localhost:8080
```

#### 3. 部署合约（可选）
```bash
cd bondly-contracts
npm install
npx hardhat node
npx hardhat run scripts/deploy/01_deploy_core.ts --network localhost
```

### 查看文档
```bash
cd docs
# 使用 docsify 或其他文档工具查看
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看各模块的 README.md 文件了解详细的贡献指南。

### 贡献方式
- 🐛 **Bug 报告**：通过 GitHub Issues 提交
- 💡 **功能建议**：在 Discussions 中讨论
- 📝 **文档改进**：提交 Pull Request
- 🔧 **代码贡献**：Fork 项目并提交 PR

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 运行测试
5. 提交 Pull Request

---

## 📞 联系我们

- **项目主页**：https://bondly.io
- **GitHub**：https://github.com/bondly
- **Discord**：https://discord.gg/bondly
- **Twitter**：https://twitter.com/bondly_io
- **Email**：hello@bondly.io

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**Bondly** - 连接你信任的人，分享你创造的价值 🚀