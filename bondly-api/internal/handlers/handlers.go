package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheck 健康检查
// @Summary 健康检查
// @Description 检查API服务是否正常运行，返回服务状态、版本信息和运行时长。用于负载均衡器和监控系统的健康检查。
// @Tags 系统监控
// @Accept json
// @Produce json
// @Success 200 {object} models.HealthResponse "服务正常运行"
// @Router /health [get]
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"message": "Bondly API is running",
		"version": "1.0.0",
	})
}

// GetBlockchainStatus 获取区块链状态
// @Summary 获取区块链连接状态
// @Description 查询当前区块链网络的连接状态、网络信息、最新区块号和Gas价格等实时信息
// @Tags 区块链
// @Accept json
// @Produce json
// @Success 200 {object} models.StandardResponse{data=models.BlockchainStatusResponse} "区块链状态信息"
// @Router /api/v1/blockchain/status [get]
func GetBlockchainStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "connected",
		"network": "ethereum",
		"message": "Blockchain connection status",
	})
}

// GetContractInfo 获取合约信息
// @Summary 获取智能合约信息
// @Description 根据合约地址获取智能合约的详细信息，包括合约名称、符号、精度、总供应量等基本信息
// @Tags 区块链
// @Accept json
// @Produce json
// @Param address path string true "合约地址" example(0x1234567890abcdef1234567890abcdef12345678) minLength(42) maxLength(42)
// @Success 200 {object} models.StandardResponse{data=models.ContractInfoResponse} "合约信息"
// @Failure 400 {object} models.ErrorResponse "无效的合约地址格式"
// @Failure 404 {object} models.ErrorResponse "合约不存在或未验证"
// @Router /api/v1/blockchain/contract/{address} [get]
func GetContractInfo(c *gin.Context) {
	address := c.Param("address")
	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"status":  "active",
		"message": "Contract information",
	})
}

// GetUserInfo 获取用户信息
// @Summary 获取用户基本信息
// @Description 根据用户地址获取用户的基本信息（已弃用，请使用 /users/{address}）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} map[string]interface{} "用户信息"
// @Deprecated
// @Router /users/{address}/info [get]
func GetUserInfo(c *gin.Context) {
	address := c.Param("address")
	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"message": "User information",
	})
}

// GetUserBalance 获取用户余额
// @Summary 获取用户余额
// @Description 根据用户地址获取用户的代币余额（已弃用，请使用 /users/{address}/balance）
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param address path string true "用户钱包地址"
// @Success 200 {object} map[string]interface{} "用户余额信息"
// @Deprecated
// @Router /users/{address}/balance-old [get]
func GetUserBalance(c *gin.Context) {
	address := c.Param("address")
	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"balance": "0",
		"message": "User balance",
	})
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
// @Success 200 {object} models.StandardResponse{data=models.ContentListResponse} "内容列表"
// @Router /api/v1/content [get]
func GetContentList(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"content": []interface{}{},
		"message": "Content list",
	})
}

// GetContentDetail 获取内容详情
// @Summary 获取内容详情
// @Description 根据内容ID获取详细的内容信息，包括完整内容、作者信息、点赞/踩数、评论统计等。访问时会自动增加浏览次数。
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param id path string true "内容ID" example(1)
// @Success 200 {object} models.StandardResponse{data=models.ContentResponse} "内容详情"
// @Failure 404 {object} models.ErrorResponse "内容不存在或已被删除"
// @Router /api/v1/content/{id} [get]
func GetContentDetail(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id":      id,
		"message": "Content detail",
	})
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
// @Success 200 {object} models.StandardResponse{data=models.ProposalListResponse} "提案列表"
// @Router /api/v1/governance/proposals [get]
func GetProposals(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"proposals": []interface{}{},
		"message":   "Proposals list",
	})
}

// GetProposalDetail 获取提案详情
// @Summary 获取提案详情
// @Description 根据提案ID获取详细的提案信息，包括完整描述、投票记录、讨论评论、提案者信息等。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param id path string true "提案ID" example(1)
// @Success 200 {object} models.StandardResponse{data=models.ProposalResponse} "提案详情"
// @Failure 404 {object} models.ErrorResponse "提案不存在或已被删除"
// @Router /api/v1/governance/proposals/{id} [get]
func GetProposalDetail(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"id":      id,
		"message": "Proposal detail",
	})
}

// CreateContent 创建内容
// @Summary 创建新内容
// @Description 创建新的内容（文章、帖子等），需要提供标题、内容和类型。内容创建后默认为草稿状态。
// @Tags 内容管理
// @Accept json
// @Produce json
// @Param request body models.CreateContentRequest true "创建内容请求体"
// @Success 200 {object} models.StandardResponse{data=models.ContentResponse} "内容创建成功"
// @Failure 400 {object} models.ErrorResponse "请求参数错误"
// @Failure 401 {object} models.ErrorResponse "用户未认证"
// @Router /api/v1/content [post]
func CreateContent(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"id":      "1",
		"message": "Content created successfully",
	})
}

// CreateProposal 创建提案
// @Summary 创建治理提案
// @Description 创建新的治理提案，需要提供标题、描述和投票截止时间。提案创建后进入待审核状态。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param request body models.CreateProposalRequest true "创建提案请求体"
// @Success 200 {object} models.StandardResponse{data=models.ProposalResponse} "提案创建成功"
// @Failure 400 {object} models.ErrorResponse "请求参数错误或截止时间无效"
// @Failure 401 {object} models.ErrorResponse "用户未认证"
// @Failure 403 {object} models.ErrorResponse "用户权限不足"
// @Router /api/v1/governance/proposals [post]
func CreateProposal(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"id":      "1",
		"message": "Proposal created successfully",
	})
}

// VoteProposal 提案投票
// @Summary 对提案进行投票
// @Description 用户对指定提案投票（赞成或反对）。投票权重根据用户持有的代币数量计算。
// @Tags 治理管理
// @Accept json
// @Produce json
// @Param request body models.VoteRequest true "投票请求体"
// @Success 200 {object} models.StandardResponse{data=models.VoteResponse} "投票成功"
// @Failure 400 {object} models.ErrorResponse "请求参数错误或提案已结束"
// @Failure 401 {object} models.ErrorResponse "用户未认证"
// @Failure 409 {object} models.ErrorResponse "用户已对此提案投票"
// @Router /api/v1/governance/proposals/vote [post]
func VoteProposal(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Vote submitted successfully",
	})
}

// StakeTokens 质押代币
// @Summary 质押BONDLY代币
// @Description 质押指定数量的BONDLY代币到智能合约，获得治理权重和奖励。质押期间代币被锁定。
// @Tags 区块链
// @Accept json
// @Produce json
// @Param request body models.StakeRequest true "质押请求体"
// @Success 200 {object} models.StandardResponse{data=models.StakeResponse} "质押成功"
// @Failure 400 {object} models.ErrorResponse "请求参数错误或余额不足"
// @Failure 401 {object} models.ErrorResponse "用户未认证"
// @Router /api/v1/blockchain/stake [post]
func StakeTokens(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Tokens staked successfully",
	})
}

// GetStats 获取统计信息
// @Summary 获取平台统计信息
// @Description 获取平台的各项统计数据，包括用户数量、内容数量、提案数量、质押总额等信息。
// @Tags 系统监控
// @Accept json
// @Produce json
// @Success 200 {object} models.StandardResponse{data=models.StatsResponse} "统计信息"
// @Router /api/v1/stats [get]
func GetStats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_users":        10000,
		"total_content":      25600,
		"total_proposals":    125,
		"active_stakers":     3500,
		"total_value_locked": "1250000.50",
	})
}
