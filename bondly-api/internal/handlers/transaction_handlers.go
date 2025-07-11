package handlers

import (
	"bondly-api/internal/database"
	loggerpkg "bondly-api/internal/logger"
	"bondly-api/internal/models"
	"bondly-api/internal/pkg/response"
	"bondly-api/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

// TransactionHandlers 交易处理器
type TransactionHandlers struct {
	transactionService *services.TransactionService
}

func NewTransactionHandlers(transactionService *services.TransactionService) *TransactionHandlers {
	return &TransactionHandlers{
		transactionService: transactionService,
	}
}

// CreateTransaction 创建交易
// @Summary 创建交易
// @Description 创建新的交易记录
// @Tags 交易管理
// @Accept json
// @Produce json
// @Param transaction body models.Transaction true "交易信息"
// @Success 201 {object} response.ResponseTransaction
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions [post]
// @Security BearerAuth
func (h *TransactionHandlers) CreateTransaction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("POST", "/api/v1/transactions", nil, "", nil)

	var transaction models.Transaction
	if err := c.ShouldBindJSON(&transaction); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"from_address": transaction.FromAddress,
		"to_address":   transaction.ToAddress,
		"value":        transaction.Value,
		"status":       transaction.Status,
	})

	if err := h.transactionService.CreateTransaction(c.Request.Context(), &transaction); err != nil {
		bizLog.ThirdPartyError("transaction_service", "create_transaction", map[string]interface{}{"from_address": transaction.FromAddress, "to_address": transaction.ToAddress}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("交易创建成功", map[string]interface{}{"transaction_id": transaction.ID})
	response.OK(c, transaction, "Transaction created successfully")
}

// GetTransaction 获取单个交易
// @Summary 获取交易详情
// @Description 根据ID获取交易详情
// @Tags transaction
// @Accept json
// @Produce json
// @Param id path int true "交易ID"
// @Success 200 {object} response.ResponseTransaction
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions/{id} [get]
func (h *TransactionHandlers) GetTransaction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/transactions/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("transaction_id", "无效的交易ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid transaction ID")
		return
	}

	transaction, err := h.transactionService.GetTransaction(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "transaction not found" {
			bizLog.ValidationFailed("transaction_id", "交易不存在", id)
			response.Fail(c, response.CodeNotFound, "Transaction not found")
			return
		}
		bizLog.ThirdPartyError("transaction_service", "get_transaction", map[string]interface{}{"transaction_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取交易成功", map[string]interface{}{"transaction_id": id})
	response.OK(c, transaction, "Transaction retrieved successfully")
}

// GetTransactionByHash 根据哈希获取交易
// @Summary 根据哈希获取交易
// @Description 根据交易哈希获取交易详情
// @Tags 交易管理
// @Accept json
// @Produce json
// @Param hash path string true "交易哈希"
// @Success 200 {object} response.ResponseTransaction
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions/hash/{hash} [get]
func (h *TransactionHandlers) GetTransactionByHash(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/transactions/hash/{hash}", nil, "", nil)

	hash := c.Param("hash")
	if hash == "" {
		bizLog.ValidationFailed("hash", "交易哈希不能为空", "")
		response.Fail(c, response.CodeInvalidParams, "Transaction hash is required")
		return
	}

	transaction, err := h.transactionService.GetTransactionByHash(c.Request.Context(), hash)
	if err != nil {
		if err.Error() == "transaction not found" {
			bizLog.ValidationFailed("hash", "交易不存在", hash)
			response.Fail(c, response.CodeNotFound, "Transaction not found")
			return
		}
		bizLog.ThirdPartyError("transaction_service", "get_transaction_by_hash", map[string]interface{}{"hash": hash}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("根据哈希获取交易成功", map[string]interface{}{"hash": hash})
	response.OK(c, transaction, "Transaction retrieved successfully")
}

// ListTransactions 获取交易列表
// @Summary 获取交易列表
// @Description 分页获取交易列表
// @Tags 交易管理
// @Accept json
// @Produce json
// @Param page query int false "页码" default(1)
// @Param limit query int false "每页数量" default(10)
// @Success 200 {object} response.ResponseTransaction
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions [get]
func (h *TransactionHandlers) ListTransactions(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("GET", "/api/v1/transactions", nil, "", nil)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	transactions, total, err := h.transactionService.ListTransaction(c.Request.Context(), page, limit)
	if err != nil {
		bizLog.ThirdPartyError("transaction_service", "list_transactions", map[string]interface{}{"page": page, "limit": limit}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("获取交易列表成功", map[string]interface{}{"total": total, "page": page, "limit": limit})
	result := gin.H{
		"transactions": transactions,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}
	response.OK(c, result, "Transaction list retrieved successfully")
}

// UpdateTransaction 更新交易
// @Summary 更新交易
// @Description 更新指定交易的信息
// @Tags 交易管理
// @Accept json
// @Produce json
// @Param id path int true "交易ID"
// @Param transaction body models.Transaction true "更新的交易信息"
// @Success 200 {object} response.ResponseTransaction
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions/{id} [put]
// @Security BearerAuth
func (h *TransactionHandlers) UpdateTransaction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("PUT", "/api/v1/transactions/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("transaction_id", "无效的交易ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid transaction ID")
		return
	}

	var updateData models.Transaction
	if err := c.ShouldBindJSON(&updateData); err != nil {
		bizLog.ValidationFailed("request_body", "JSON格式错误", err.Error())
		response.Fail(c, response.CodeInvalidParams, err.Error())
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"transaction_id": id,
	})

	transaction, err := h.transactionService.UpdateTransaction(c.Request.Context(), id, &updateData)
	if err != nil {
		if err.Error() == "transaction not found" {
			bizLog.ValidationFailed("transaction_id", "交易不存在", id)
			response.Fail(c, response.CodeNotFound, "Transaction not found")
			return
		}
		bizLog.ThirdPartyError("transaction_service", "update_transaction", map[string]interface{}{"transaction_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("交易更新成功", map[string]interface{}{"transaction_id": id})
	response.OK(c, transaction, "Transaction updated successfully")
}

// DeleteTransaction 删除交易
// @Summary 删除交易
// @Description 删除指定的交易
// @Tags 交易管理
// @Accept json
// @Produce json
// @Param id path int true "交易ID"
// @Success 200 {object} response.ResponseAny
// @Failure 400 {object} response.ResponseAny
// @Failure 401 {object} response.ResponseAny
// @Failure 404 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions/{id} [delete]
// @Security BearerAuth
func (h *TransactionHandlers) DeleteTransaction(c *gin.Context) {
	bizLog := loggerpkg.NewBusinessLogger(c.Request.Context())
	bizLog.StartAPI("DELETE", "/api/v1/transactions/{id}", nil, "", nil)

	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		bizLog.ValidationFailed("transaction_id", "无效的交易ID", c.Param("id"))
		response.Fail(c, response.CodeInvalidParams, "Invalid transaction ID")
		return
	}

	bizLog.BusinessLogic("参数处理", map[string]interface{}{
		"transaction_id": id,
	})

	if err := h.transactionService.DeleteTransaction(c.Request.Context(), id); err != nil {
		if err.Error() == "transaction not found" {
			bizLog.ValidationFailed("transaction_id", "交易不存在", id)
			response.Fail(c, response.CodeNotFound, "Transaction not found")
			return
		}
		bizLog.ThirdPartyError("transaction_service", "delete_transaction", map[string]interface{}{"transaction_id": id}, err)
		response.Fail(c, response.CodeInternalError, err.Error())
		return
	}

	bizLog.BusinessLogic("交易删除成功", map[string]interface{}{"transaction_id": id})
	response.OK(c, gin.H{}, "Transaction deleted successfully")
}

// GetTransactionStats 获取交易统计
// @Summary 获取交易统计
// @Description 获取交易相关的统计数据
// @Tags 交易管理
// @Accept json
// @Produce json
// @Success 200 {object} response.ResponseAny
// @Failure 500 {object} response.ResponseAny
// @Router /api/v1/transactions/stats [get]
func (h *TransactionHandlers) GetTransactionStats(c *gin.Context) {
	db := database.GetDB()

	var stats struct {
		TotalTransactions int64   `json:"total_transactions"`
		PendingCount      int64   `json:"pending_count"`
		ConfirmedCount    int64   `json:"confirmed_count"`
		FailedCount       int64   `json:"failed_count"`
		TotalGasUsed      uint64  `json:"total_gas_used"`
		AverageGasPrice   float64 `json:"average_gas_price"`
	}

	// 获取总交易数
	db.Model(&models.Transaction{}).Count(&stats.TotalTransactions)

	// 获取各状态交易数
	db.Model(&models.Transaction{}).Where("status = ?", "pending").Count(&stats.PendingCount)
	db.Model(&models.Transaction{}).Where("status = ?", "confirmed").Count(&stats.ConfirmedCount)
	db.Model(&models.Transaction{}).Where("status = ?", "failed").Count(&stats.FailedCount)

	// 获取总Gas使用量
	db.Model(&models.Transaction{}).Select("COALESCE(SUM(gas_used), 0)").Scan(&stats.TotalGasUsed)

	// 获取平均Gas价格
	db.Model(&models.Transaction{}).Select("COALESCE(AVG(CAST(gas_price AS DECIMAL)), 0)").Scan(&stats.AverageGasPrice)

	response.OK(c, stats, "Transaction stats retrieved successfully")
}
