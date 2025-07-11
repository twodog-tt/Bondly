package handlers

import (
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ProposalHandlers 提案处理器
type ProposalHandlers struct {
	proposalService *services.ProposalService
}

func NewProposalHandlers(proposalService *services.ProposalService) *ProposalHandlers {
	return &ProposalHandlers{
		proposalService: proposalService,
	}
}

// CreateProposal 创建提案
// @Summary 创建提案
// @Description 创建新的提案
// @Tags 提案管理
// @Accept json
// @Produce json
// @Param proposal body models.Proposal true "提案信息"
// @Success 201 {object} response.ResponseProposal
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/proposals [post]
// @Security BearerAuth
func (h *ProposalHandlers) CreateProposal(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/proposals", nil, "", nil)

	var proposal models.Proposal
	if err := c.ShouldBindJSON(&proposal); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		bizLog.ValidationFailed("user_id", "用户未认证", "")
		response.Fail(c, response.CodeUnauthorized, "User not authenticated")
		return
	}
	proposal.ProposerID = userID.(int64)

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"proposer_id": proposal.ProposerID,
		"status":      proposal.Status,
		"start_time":  proposal.StartTime,
		"end_time":    proposal.EndTime,
	})

	if err := h.proposalService.CreateProposal(c.Request.Context(), &proposal); err != nil {
		bizLog.ThirdPartyError("proposal_service", "create_proposal", map[string]interface{}{"proposer_id": proposal.ProposerID}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("提案创建成功", map[string]interface{}{"proposal_id": proposal.ID, "proposer_id": proposal.ProposerID})
	response.OK(c, proposal, "Proposal created successfully")
}

// GetProposal 获取单个提案
// @Summary 获取提案详情
// @Description 根据ID获取提案详情
// @Tags 提案管理
// @Accept json
// @Produce json
// @Param id path int true "提案ID"
// @Success 200 {object} response.ResponseProposal
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/proposals/{id} [get]
func (h *ProposalHandlers) GetProposal(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/proposals/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("proposal_id", "无效的提案ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid proposal ID")
		return
	}

	proposal, err := h.proposalService.GetProposal(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "proposal not found" {
			bizLog.ValidationFailed("proposal_id", "提案不存在", id)
			response.Fail(c, response.CodeNotFound, "Proposal not found")
			return
		}
		bizLog.ThirdPartyError("proposal_service", "get_proposal", map[string]interface{}{"proposal_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取提案成功", map[string]interface{}{"proposal_id": id})
	response.OK(c, proposal, "Proposal retrieved successfully")
}

// UpdateProposal 更新提案
// @Summary 更新提案
// @Description 更新指定提案的信息
// @Tags 提案管理
// @Accept json
// @Produce json
// @Param id path int true "提案ID"
// @Param proposal body models.Proposal true "更新的提案信息"
// @Success 200 {object} response.ResponseProposal
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/proposals/{id} [put]
// @Security BearerAuth
func (h *ProposalHandlers) UpdateProposal(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("PUT", "/api/v1/proposals/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("proposal_id", "无效的提案ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid proposal ID")
		return
	}

	var updateData models.Proposal
	if err := c.ShouldBindJSON(&updateData); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"proposal_id": id,
	})

	proposal, err := h.proposalService.UpdateProposal(c.Request.Context(), id, &updateData)
	if err != nil {
		if err.Error() == "proposal not found" {
			bizLog.ValidationFailed("proposal_id", "提案不存在", id)
			response.Fail(c, response.CodeNotFound, "Proposal not found")
			return
		}
		bizLog.ThirdPartyError("proposal_service", "update_proposal", map[string]interface{}{"proposal_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("提案更新成功", map[string]interface{}{"proposal_id": id})
	response.OK(c, proposal, "Proposal updated successfully")
}

// DeleteProposal 删除提案
// @Summary 删除提案
// @Description 删除指定的提案
// @Tags 提案管理
// @Accept json
// @Produce json
// @Param id path int true "提案ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 403 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/proposals/{id} [delete]
// @Security BearerAuth
func (h *ProposalHandlers) DeleteProposal(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/proposals/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("proposal_id", "无效的提案ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid proposal ID")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"proposal_id": id,
	})

	if err := h.proposalService.DeleteProposal(c.Request.Context(), id); err != nil {
		if err.Error() == "proposal not found" {
			bizLog.ValidationFailed("proposal_id", "提案不存在", id)
			response.Fail(c, response.CodeNotFound, "Proposal not found")
			return
		}
		bizLog.ThirdPartyError("proposal_service", "delete_proposal", map[string]interface{}{"proposal_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("提案删除成功", map[string]interface{}{"proposal_id": id})
	response.OK(c, gin.H{}, "Proposal deleted successfully")
}

// ListProposals 获取提案列表
// @Summary 获取提案列表
// @Description 分页获取提案列表
// @Tags 提案管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseProposal
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/proposals [get]
func (h *ProposalHandlers) ListProposals(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/proposals", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	proposals, total, err := h.proposalService.ListProposal(c.Request.Context(), page, limit)
	if err != nil {
		bizLog.ThirdPartyError("proposal_service", "list_proposals", map[string]interface{}{"page": page, "limit": limit}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取提案列表成功", map[string]interface{}{"total": total, "page": page, "limit": limit})
	result := gin.H{
		"proposals": proposals,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Proposal list retrieved successfully")
}
