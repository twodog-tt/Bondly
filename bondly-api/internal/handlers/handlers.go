package handlers

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

// HealthData 健康检查响应数据
type HealthData struct {
	Status  string `json:"status" example:"ok"`
	Message string `json:"message" example:"Bondly API is running"`
	Version string `json:"version" example:"1.0.0"`
}

// BlockchainStatusData 区块链状态响应数据
type BlockchainStatusData struct {
	Status  string `json:"status" example:"connected"`
	Network string `json:"network" example:"ethereum"`
	Message string `json:"message" example:"Blockchain connection status"`
}

// ContractInfoData 合约信息响应数据
type ContractInfoData struct {
	Address string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Status  string `json:"status" example:"active"`
	Message string `json:"message" example:"Contract information"`
}

// UserInfoData 用户信息响应数据
type UserInfoData struct {
	Address string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Message string `json:"message" example:"User information"`
}

// UserBalanceData 用户余额响应数据
type UserBalanceData struct {
	Address string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Balance string `json:"balance" example:"1000.50"`
	Message string `json:"message" example:"User balance"`
}

// UserReputationData 用户声誉响应数据
type UserReputationData struct {
	Address    string `json:"address" example:"0x1234567890abcdef1234567890abcdef12345678"`
	Reputation int    `json:"reputation" example:"85"`
}

// CreateUserData 创建用户响应数据
type CreateUserData struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"User created successfully"`
}

// ContentListData 内容列表响应数据
type ContentListData struct {
	Content []interface{} `json:"content"`
	Message string        `json:"message" example:"Content list"`
}

// ContentDetailData 内容详情响应数据
type ContentDetailData struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Content detail"`
}

// ProposalListData 提案列表响应数据
type ProposalListData struct {
	Proposals []interface{} `json:"proposals"`
	Message   string        `json:"message" example:"Proposals list"`
}

// ProposalDetailData 提案详情响应数据
type ProposalDetailData struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Proposal detail"`
}

// CreateContentData 创建内容响应数据
type CreateContentData struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Content created successfully"`
}

// CreateProposalData 创建提案响应数据
type CreateProposalData struct {
	ID      string `json:"id" example:"1"`
	Message string `json:"message" example:"Proposal created successfully"`
}

// VoteData 投票响应数据
type VoteData struct {
	Message string `json:"message" example:"Vote submitted successfully"`
}

// StakeData 质押响应数据
type StakeData struct {
	Message string `json:"message" example:"Tokens staked successfully"`
}

// StatsData 统计信息响应数据
type StatsData struct {
	TotalUsers       int    `json:"total_users" example:"10000"`
	TotalContent     int    `json:"total_content" example:"25600"`
	TotalProposals   int    `json:"total_proposals" example:"125"`
	ActiveStakers    int    `json:"active_stakers" example:"3500"`
	TotalValueLocked string `json:"total_value_locked" example:"1250000.50"`
}

// HealthCheck 健康检查
// @Summary 健康检查
// @Description 检查API服务是否正常运行，返回服务状态、版本信息和运行时长。用于负载均衡器和监控系统的健康检查。
// @Tags 系统监控
// @Accept json
// @Produce json
// @Success 200 {object} response.Response[HealthData] "服务正常运行"
// @Router /health [get]
func HealthCheck(c *gin.Context) {
	data := HealthData{
		Status:  "ok",
		Message: "Bondly API is running",
		Version: "1.0.0",
	}
	response.OK(c, data, response.MsgHealthCheckSuccess)
}

// GetBlockchainStatus 获取区块链状态
// @Summary 获取区块链连接状态
// @Description 查询当前区块链网络的连接状态、网络信息、最新区块号和Gas价格等实时信息
// @Tags 区块链
// @Accept json
// @Produce json
// @Success 200 {object} response.Response[BlockchainStatusData] "区块链状态信息"
// @Router /api/v1/blockchain/status [get]
func GetBlockchainStatus(c *gin.Context) {
	data := BlockchainStatusData{
		Status:  "connected",
		Network: "ethereum",
		Message: "Blockchain connection status",
	}
	response.OK(c, data, response.MsgBlockchainStatusRetrieved)
}

// GetContractInfo 获取合约信息
// @Summary 获取智能合约信息
// @Description 根据合约地址获取智能合约的详细信息，包括合约名称、符号、精度、总供应量等基本信息
// @Tags 区块链
// @Accept json
// @Produce json
// @Param address path string true "合约地址" example(0x1234567890abcdef1234567890abcdef12345678) minLength(42) maxLength(42)
// @Success 200 {object} response.Response[ContractInfoData] "合约信息"
// @Failure 200 {object} response.Response[any] "无效的合约地址格式"
// @Router /api/v1/blockchain/contract/{address} [get]
func GetContractInfo(c *gin.Context) {
	address := c.Param("address")
	data := ContractInfoData{
		Address: address,
		Status:  "active",
		Message: "Contract information",
	}
	response.OK(c, data, response.MsgContractInfoRetrieved)
}

// GetUserInfo 获取用户信息
// @Summary 获取用户基本信息
// @Description 根据用户地址获取用户的基本信息（已弃用，请使用 /users/{address}）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} response.Response[UserInfoData] "用户信息"
// @Deprecated
// @Router /users/{address}/info [get]
func GetUserInfo(c *gin.Context) {
	address := c.Param("address")
	data := UserInfoData{
		Address: address,
		Message: "User information",
	}
	response.OK(c, data, response.MsgUserInfoRetrieved)
}

// GetUserBalance 获取用户余额
// @Summary 获取用户余额
// @Description 根据用户地址获取用户的代币余额（已弃用，请使用 /users/{address}/balance）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} response.Response[UserBalanceData] "用户余额信息"
// @Deprecated
// @Router /users/{address}/balance-old [get]
func GetUserBalance(c *gin.Context) {
	address := c.Param("address")
	data := UserBalanceData{
		Address: address,
		Balance: "0",
		Message: "User balance",
	}
	response.OK(c, data, response.MsgUserBalanceRetrieved)
}

// GetContentList 获取内容列表
// @Summary 获取内容列表
// @Description 获取平台上的内容列表，支持分页、分类筛选和关键词搜索。返回内容摘要、作者信息、点赞数等基本信息。
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param page query int false "页码，默认为1" example(1) minimum(1)
// @Param limit query int false "每页数量，默认为20" example(20) minimum(1) maximum(100)
// @Param category query string false "内容分类" example(article) Enums(article, post, comment)
// @Param keyword query string false "搜索关键词" example(区块链)
// @Success 200 {object} response.Response[ContentListData] "内容列表"
// @Router /api/v1/content [get]
func GetContentList(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/content", nil, "", nil)

	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")
	keyword := c.Query("keyword")

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"page":        page,
		"limit":       limit,
		"category":    category,
		"has_keyword": keyword != "",
	})

	// 参数验证
	if page < 1 {
		bizLog.ValidationFailed("page", "页码不能小于1", page)
		page = 1
	}
	if limit < 1 || limit > 100 {
		bizLog.ValidationFailed("limit", "每页数量必须在1-100之间", limit)
		limit = 20
	}

	// 获取内容列表成功
	bizLog.Success("get_content_list", map[string]interface{}{
		"page":          page,
		"limit":         limit,
		"category":      category,
		"has_keyword":   keyword != "",
		"content_count": 0, // 模拟数据
	})

	data := ContentListData{
		Content: []interface{}{},
		Message: "Content list",
	}
	response.OK(c, data, response.MsgContentListRetrieved)
}

// GetContentDetail 获取内容详情
// @Summary 获取内容详情
// @Description 根据内容ID获取详细的内容信息，包括完整内容、作者信息、点赞/踩数、评论统计等。访问时会自动增加浏览次数。
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param id path string true "内容ID" example(1)
// @Success 200 {object} response.Response[ContentDetailData] "内容详情"
// @Failure 200 {object} response.Response[any] "内容不存在或已被删除"
// @Router /api/v1/content/{id} [get]
func GetContentDetail(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/content/{id}", nil, "", nil)

	id := c.Param("id")
	if id == "" {
		bizLog.ValidationFailed("content_id", "内容ID不能为空", "")
		response.Fail(c, response.CodeInvalidParams, "内容ID不能为空")
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_id": id,
	})

	// 获取内容详情成功
	bizLog.Success("get_content_detail", map[string]interface{}{
		"content_id": id,
	})

	data := ContentDetailData{
		ID:      id,
		Message: "Content detail",
	}
	response.OK(c, data, response.MsgContentDetailRetrieved)
}

// GetProposals 获取提案列表
// @Summary 获取治理提案列表
// @Description 获取平台治理提案列表，包括提案状态、投票情况、截止时间等信息。支持按状态筛选和分页查询。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param status query string false "提案状态" example(active) Enums(active, pending, completed, rejected, executed)
// @Param page query int false "页码，默认为1" example(1) minimum(1)
// @Param limit query int false "每页数量，默认为20" example(20) minimum(1) maximum(100)
// @Success 200 {object} response.Response[ProposalListData] "提案列表"
// @Router /api/v1/governance/proposals [get]
func GetProposals(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/governance/proposals", nil, "", nil)

	// 获取查询参数
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"page":   page,
		"limit":  limit,
		"status": status,
	})

	// 参数验证
	if page < 1 {
		bizLog.ValidationFailed("page", "页码不能小于1", page)
		page = 1
	}
	if limit < 1 || limit > 100 {
		bizLog.ValidationFailed("limit", "每页数量必须在1-100之间", limit)
		limit = 20
	}

	// 获取提案列表成功
	bizLog.Success("get_proposals", map[string]interface{}{
		"page":           page,
		"limit":          limit,
		"status":         status,
		"proposal_count": 0, // 模拟数据
	})

	data := ProposalListData{
		Proposals: []interface{}{},
		Message:   "Proposals list",
	}
	response.OK(c, data, response.MsgProposalListRetrieved)
}

// GetProposalDetail 获取提案详情
// @Summary 获取提案详情
// @Description 根据提案ID获取详细的提案信息，包括完整描述、投票记录、讨论评论、提案者信息等。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param id path string true "提案ID" example(1)
// @Success 200 {object} response.Response[ProposalDetailData] "提案详情"
// @Failure 200 {object} response.Response[any] "提案不存在或已被删除"
// @Router /api/v1/governance/proposals/{id} [get]
func GetProposalDetail(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/governance/proposals/{id}", nil, "", nil)

	id := c.Param("id")
	if id == "" {
		bizLog.ValidationFailed("proposal_id", "提案ID不能为空", "")
		response.Fail(c, response.CodeInvalidParams, "提案ID不能为空")
		return
	}

	// 记录关键参数
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"proposal_id": id,
	})

	// 获取提案详情成功
	bizLog.Success("get_proposal_detail", map[string]interface{}{
		"proposal_id": id,
	})

	data := ProposalDetailData{
		ID:      id,
		Message: "Proposal detail",
	}
	response.OK(c, data, response.MsgProposalDetailRetrieved)
}

// CreateContent 创建内容
// @Summary 创建新内容
// @Description 创建新的内容（文章、帖子等），需要提供标题、内容和类型。内容创建后默认为草稿状态。
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "创建内容请求体"
// @Success 200 {object} response.Response[CreateContentData] "内容创建成功"
// @Failure 200 {object} response.Response[any] "请求参数错误"
// @Router /api/v1/content [post]
func CreateContent(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/content", nil, "", nil)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"content_type": "article", // 模拟数据
		"has_title":    true,
		"has_content":  true,
	})

	// 内容创建成功
	bizLog.Success("create_content", map[string]interface{}{
		"content_id":   "1",
		"content_type": "article",
	})

	data := CreateContentData{
		ID:      "1",
		Message: "Content created successfully",
	}
	response.OK(c, data, response.MsgContentCreated)
}

// CreateProposal 创建提案
// @Summary 创建治理提案
// @Description 创建新的治理提案，需要提供标题、描述和投票截止时间。提案创建后进入待审核状态。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "创建提案请求体"
// @Success 200 {object} response.Response[CreateProposalData] "提案创建成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或截止时间无效"
// @Router /api/v1/governance/proposals [post]
func CreateProposal(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/governance/proposals", nil, "", nil)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"has_title":       true,
		"has_description": true,
		"has_deadline":    true,
	})

	// 提案创建成功
	bizLog.Success("create_proposal", map[string]interface{}{
		"proposal_id": "1",
		"status":      "pending",
	})

	data := CreateProposalData{
		ID:      "1",
		Message: "Proposal created successfully",
	}
	response.OK(c, data, response.MsgProposalCreated)
}

// VoteProposal 提案投票
// @Summary 对提案进行投票
// @Description 用户对指定提案投票（赞成或反对）。投票权重根据用户持有的代币数量计算。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "投票请求体"
// @Success 200 {object} response.Response[VoteData] "投票成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或提案已结束"
// @Router /api/v1/governance/proposals/vote [post]
func VoteProposal(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/governance/proposals/vote", nil, "", nil)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"proposal_id":     "1",       // 模拟数据
		"vote_type":       "approve", // 模拟数据
		"has_vote_weight": true,
	})

	// 投票成功
	bizLog.Success("vote_proposal", map[string]interface{}{
		"proposal_id": "1",
		"vote_type":   "approve",
		"vote_weight": 100, // 模拟数据
	})

	data := VoteData{
		Message: "Vote submitted successfully",
	}
	response.OK(c, data, response.MsgVoteSubmitted)
}

// StakeTokens 质押代币
// @Summary 质押BONDLY代币
// @Description 质押指定数量的BONDLY代币到智能合约，获得治理权重和奖励。质押期间代币被锁定。
// @Tags 区块链
// @Accept json
// @Produce json
// @Param request body map[string]interface{} true "质押请求体"
// @Success 200 {object} response.Response[StakeData] "质押成功"
// @Failure 200 {object} response.Response[any] "请求参数错误或余额不足"
// @Router /api/v1/blockchain/stake [post]
func StakeTokens(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("POST", "/api/v1/blockchain/stake", nil, "", nil)

	// 记录关键参数（脱敏处理）
	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"token_amount":   1000,  // 模拟数据
		"stake_duration": "30d", // 模拟数据
	})

	// 质押成功
	bizLog.Success("stake_tokens", map[string]interface{}{
		"token_amount":     1000,
		"stake_duration":   "30d",
		"transaction_hash": "0x123...", // 模拟数据
	})

	data := StakeData{
		Message: "Tokens staked successfully",
	}
	response.OK(c, data, response.MsgTokenStaked)
}

// GetStats 获取统计信息
// @Summary 获取平台统计信息
// @Description 获取平台的各项统计数据，包括用户数量、内容数量、提案数量、质押总额等信息。
// @Tags 系统监控
// @Accept json
// @Produce json
// @Success 200 {object} response.Response[StatsData] "统计信息"
// @Router /api/v1/stats [get]
func GetStats(c *gin.Context) {
	// 创建业务日志工具
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())

	// 记录接口开始
	bizLog.StartAPI("GET", "/api/v1/stats", nil, "", nil)

	// 获取统计信息成功
	bizLog.Success("get_stats", map[string]interface{}{
		"total_users":        10000,
		"total_content":      25600,
		"total_proposals":    125,
		"active_stakers":     3500,
		"total_value_locked": "1250000.50",
	})

	data := StatsData{
		TotalUsers:       10000,
		TotalContent:     25600,
		TotalProposals:   125,
		ActiveStakers:    3500,
		TotalValueLocked: "1250000.50",
	}
	response.OK(c, data, response.MsgStatisticsRetrieved)
}
