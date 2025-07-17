package handlers

import (
	"bondly-api/internal/dto"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ReputationHandlers struct {
	reputationService *services.ReputationService
}

func NewReputationHandlers(reputationService *services.ReputationService) *ReputationHandlers {
	return &ReputationHandlers{
		reputationService: reputationService,
	}
}

// GetUserReputation 获取用户声誉分数
// @Summary 获取用户声誉分数
// @Description 根据用户ID获取声誉分数，优先从链上获取并同步到数据库
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response[dto.ReputationResponse] "声誉信息"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/user/{id} [get]
func (h *ReputationHandlers) GetUserReputation(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/reputation/user/{id}", nil, "", nil)

	idStr := c.Param("id")
	userID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	reputation, err := h.reputationService.GetUserReputation(c.Request.Context(), userID)
	if err != nil {
		bizLog.DatabaseError("get", "reputation", "GetUserReputation", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("getUserReputation", map[string]interface{}{
		"user_id":    userID,
		"reputation": reputation,
	})

	data := &dto.ReputationResponse{
		UserID:     userID,
		Reputation: reputation,
	}

	response.OK(c, data, "获取声誉分数成功")
}

// GetUserReputationByAddress 根据钱包地址获取用户声誉分数
// @Summary 根据钱包地址获取用户声誉分数
// @Description 根据钱包地址获取声誉分数，优先从链上获取
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param address path string true "钱包地址"
// @Success 200 {object} response.Response[dto.ReputationResponse] "声誉信息"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/address/{address} [get]
func (h *ReputationHandlers) GetUserReputationByAddress(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/reputation/address/{address}", nil, "", nil)

	address := c.Param("address")
	if address == "" {
		bizLog.ValidationFailed("address", "钱包地址不能为空", address)
		response.Fail(c, response.CodeInvalidParams, "钱包地址不能为空")
		return
	}

	reputation, err := h.reputationService.GetUserReputationByAddress(c.Request.Context(), address)
	if err != nil {
		bizLog.DatabaseError("get", "reputation", "GetUserReputationByAddress", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("getUserReputationByAddress", map[string]interface{}{
		"address":    address,
		"reputation": reputation,
	})

	data := &dto.ReputationResponse{
		WalletAddress: &address,
		Reputation:    reputation,
	}

	response.OK(c, data, "获取声誉分数成功")
}

// AddReputation 增加用户声誉分数
// @Summary 增加用户声誉分数
// @Description 为用户增加声誉分数，同时更新链上和数据库（需要管理员权限）
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param request body dto.AddReputationRequest true "增加声誉请求"
// @Success 200 {object} response.Response[any] "操作成功"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 401 {object} response.Response[any] "权限不足"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/add [post]
// @Security BearerAuth
func (h *ReputationHandlers) AddReputation(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/reputation/add", nil, "", nil)

	var req dto.AddReputationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 参数验证
	if req.UserID <= 0 {
		bizLog.ValidationFailed("user_id", "用户ID必须大于0", req.UserID)
		response.Fail(c, response.CodeInvalidParams, "用户ID必须大于0")
		return
	}

	if req.Amount <= 0 {
		bizLog.ValidationFailed("amount", "声誉分数必须大于0", req.Amount)
		response.Fail(c, response.CodeInvalidParams, "声誉分数必须大于0")
		return
	}

	if req.Reason == "" {
		req.Reason = "管理员手动调整"
	}

	bizLog.BusinessLogic("增加声誉分数", map[string]interface{}{
		"user_id": req.UserID,
		"amount":  req.Amount,
		"reason":  req.Reason,
	})

	err := h.reputationService.AddReputation(c.Request.Context(), req.UserID, req.Amount, req.Reason)
	if err != nil {
		bizLog.DatabaseError("update", "reputation", "AddReputation", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("addReputation", map[string]interface{}{
		"user_id": req.UserID,
		"amount":  req.Amount,
		"reason":  req.Reason,
	})

	response.OK(c, map[string]interface{}{}, "增加声誉分数成功")
}

// SubtractReputation 减少用户声誉分数
// @Summary 减少用户声誉分数
// @Description 为用户减少声誉分数，同时更新链上和数据库（需要管理员权限）
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param request body dto.SubtractReputationRequest true "减少声誉请求"
// @Success 200 {object} response.Response[any] "操作成功"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 401 {object} response.Response[any] "权限不足"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/subtract [post]
// @Security BearerAuth
func (h *ReputationHandlers) SubtractReputation(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/reputation/subtract", nil, "", nil)

	var req dto.SubtractReputationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeRequestFormatError, response.MsgRequestFormatError)
		return
	}

	// 参数验证
	if req.UserID <= 0 {
		bizLog.ValidationFailed("user_id", "用户ID必须大于0", req.UserID)
		response.Fail(c, response.CodeInvalidParams, "用户ID必须大于0")
		return
	}

	if req.Amount <= 0 {
		bizLog.ValidationFailed("amount", "声誉分数必须大于0", req.Amount)
		response.Fail(c, response.CodeInvalidParams, "声誉分数必须大于0")
		return
	}

	if req.Reason == "" {
		req.Reason = "管理员手动调整"
	}

	bizLog.BusinessLogic("减少声誉分数", map[string]interface{}{
		"user_id": req.UserID,
		"amount":  req.Amount,
		"reason":  req.Reason,
	})

	err := h.reputationService.SubtractReputation(c.Request.Context(), req.UserID, req.Amount, req.Reason)
	if err != nil {
		bizLog.DatabaseError("update", "reputation", "SubtractReputation", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("subtractReputation", map[string]interface{}{
		"user_id": req.UserID,
		"amount":  req.Amount,
		"reason":  req.Reason,
	})

	response.OK(c, map[string]interface{}{}, "减少声誉分数成功")
}

// SyncReputationFromChain 从链上同步用户声誉分数
// @Summary 从链上同步用户声誉分数
// @Description 从链上同步用户声誉分数到数据库
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response[any] "同步成功"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/sync/{id} [post]
func (h *ReputationHandlers) SyncReputationFromChain(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/reputation/sync/{id}", nil, "", nil)

	idStr := c.Param("id")
	userID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	err = h.reputationService.SyncReputationFromChain(c.Request.Context(), userID)
	if err != nil {
		bizLog.ThirdPartyError("blockchain", "syncReputation", map[string]interface{}{
			"user_id": userID,
		}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("syncReputationFromChain", map[string]interface{}{
		"user_id": userID,
	})

	response.OK(c, map[string]interface{}{}, "同步声誉分数成功")
}

// IsEligibleForGovernance 检查用户是否符合治理条件
// @Summary 检查用户是否符合治理条件
// @Description 检查用户是否符合参与治理的声誉条件
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param id path int true "用户ID"
// @Success 200 {object} response.Response[dto.GovernanceEligibilityResponse] "资格检查结果"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 404 {object} response.Response[any] "用户不存在"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/governance/eligible/{id} [get]
func (h *ReputationHandlers) IsEligibleForGovernance(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/reputation/governance/eligible/{id}", nil, "", nil)

	idStr := c.Param("id")
	userID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		bizLog.ValidationFailed("user_id", "用户ID格式错误", idStr)
		response.Fail(c, response.CodeUserIDInvalid, response.MsgUserIDInvalid)
		return
	}

	eligible, err := h.reputationService.IsEligibleForGovernance(c.Request.Context(), userID)
	if err != nil {
		bizLog.DatabaseError("get", "reputation", "IsEligibleForGovernance", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.Success("checkGovernanceEligibility", map[string]interface{}{
		"user_id":  userID,
		"eligible": eligible,
	})

	data := &dto.GovernanceEligibilityResponse{
		UserID:   userID,
		Eligible: eligible,
	}

	response.OK(c, data, "检查治理资格成功")
}

// GetTopUsersByReputation 获取声誉排行榜
// @Summary 获取声誉排行榜
// @Description 获取声誉分数最高的用户列表
// @Tags 声誉系统
// @Accept json
// @Produce json
// @Param limit query int false "返回数量，默认10，最大100" example(10)
// @Success 200 {object} response.Response[dto.ReputationRankingResponse] "声誉排行榜"
// @Failure 400 {object} response.Response[any] "参数错误"
// @Failure 500 {object} response.Response[any] "服务器错误"
// @Router /api/v1/reputation/ranking [get]
func (h *ReputationHandlers) GetTopUsersByReputation(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/reputation/ranking", nil, "", nil)

	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		bizLog.ValidationFailed("limit", "限制数量必须在1-100之间", limitStr)
		limit = 10
	}

	users, err := h.reputationService.GetTopUsersByReputation(c.Request.Context(), limit)
	if err != nil {
		bizLog.DatabaseError("select", "users", "GetTopUsersByReputation", err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	var rankings []dto.ReputationRankingItem
	for i, user := range users {
		rankings = append(rankings, dto.ReputationRankingItem{
			Rank:          i + 1,
			UserID:        user.ID,
			Nickname:      user.Nickname,
			WalletAddress: user.WalletAddress,
			AvatarURL:     user.AvatarURL,
			Reputation:    user.ReputationScore,
		})
	}

	bizLog.Success("getReputationRanking", map[string]interface{}{
		"limit":      limit,
		"user_count": len(rankings),
	})

	data := &dto.ReputationRankingResponse{
		Rankings: rankings,
		Total:    len(rankings),
	}

	response.OK(c, data, "获取声誉排行榜成功")
}
