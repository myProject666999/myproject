package api

import (
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateSettlementRequest struct {
	StakeholderID    uint64 `json:"stakeholder_id" binding:"required"`
	SettlementPeriod string `json:"settlement_period" binding:"required"`
}

func CreateSettlementOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateSettlementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var existing model.SettlementOrder
	result := dao.DB.Where("stakeholder_id = ? AND settlement_period = ?",
		req.StakeholderID, req.SettlementPeriod).First(&existing)

	if result.Error == nil {
		utils.Success(c, existing)
		return
	}

	var shareDetails []model.ShareDetail
	dao.DB.Where("stakeholder_id = ? AND settlement_period = ?",
		req.StakeholderID, req.SettlementPeriod).Find(&shareDetails)

	if len(shareDetails) == 0 {
		utils.Error(c, "没有找到该权益方的分账明细")
		return
	}

	var totalShareAmount float64
	var detailIDs []uint64
	for _, d := range shareDetails {
		totalShareAmount += d.ShareAmount
		detailIDs = append(detailIDs, d.ID)
	}

	hashData := map[string]interface{}{
		"stakeholder_id":     req.StakeholderID,
		"settlement_period":  req.SettlementPeriod,
		"total_share_amount": totalShareAmount,
		"detail_ids":         detailIDs,
		"timestamp":          time.Now().Unix(),
	}
	hashSignature := utils.CalculateHash(hashData)

	settlement := &model.SettlementOrder{
		SettlementNo:          utils.GenerateNo("SET"),
		StakeholderID:         req.StakeholderID,
		SettlementPeriod:      req.SettlementPeriod,
		TotalShareAmount:      totalShareAmount,
		DeductionAmount:       0,
		ActualSettlementAmount: totalShareAmount,
		TailDiffAmount:        0,
		Status:                0,
		HashSignature:         hashSignature,
		CreatedBy:             userID.(uint64),
	}

	tx := dao.DB.Begin()

	if err := tx.Create(settlement).Error; err != nil {
		tx.Rollback()
		utils.Error(c, "创建结算单失败: "+err.Error())
		return
	}

	for _, d := range shareDetails {
		detail := &model.SettlementOrderDetail{
			SettlementOrderID: settlement.ID,
			ShareDetailID:     d.ID,
			DramaID:           d.DramaID,
			RevenueType:       d.RevenueType,
			ShareAmount:       d.ShareAmount,
		}
		if err := tx.Create(detail).Error; err != nil {
			tx.Rollback()
			utils.Error(c, "创建结算单明细失败: "+err.Error())
			return
		}
	}

	tx.Commit()
	utils.Success(c, settlement)
}

func VerifySettlementOrder(c *gin.Context) {
	id := c.Param("id")

	var settlement model.SettlementOrder
	if err := dao.DB.First(&settlement, id).Error; err != nil {
		utils.Error(c, "结算单不存在")
		return
	}

	if settlement.Status > 1 {
		utils.Error(c, "结算单已确认，无法修改")
		return
	}

	var details []model.SettlementOrderDetail
	dao.DB.Where("settlement_order_id = ?", settlement.ID).Find(&details)

	var detailIDs []uint64
	var totalAmount float64
	for _, d := range details {
		detailIDs = append(detailIDs, d.ShareDetailID)
		totalAmount += d.ShareAmount
	}

	hashData := map[string]interface{}{
		"stakeholder_id":     settlement.StakeholderID,
		"settlement_period":  settlement.SettlementPeriod,
		"total_share_amount": totalAmount,
		"detail_ids":         detailIDs,
	}
	calculatedHash := utils.CalculateHash(hashData)
	isValid := calculatedHash == settlement.HashSignature

	utils.Success(c, gin.H{
		"is_valid":           isValid,
		"recalculated_total": totalAmount,
		"stored_total":       settlement.TotalShareAmount,
		"calculated_hash":    calculatedHash,
	})
}

func ConfirmSettlementOrder(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var settlement model.SettlementOrder
	if err := dao.DB.First(&settlement, id).Error; err != nil {
		utils.Error(c, "结算单不存在")
		return
	}

	if settlement.Status != 0 {
		utils.Error(c, "结算单状态不正确")
		return
	}

	settlement.Status = 1
	settlement.ConfirmedBy = userID.(uint64)
	settlement.ConfirmedAt = time.Now()

	if err := dao.DB.Save(&settlement).Error; err != nil {
		utils.Error(c, "确认结算单失败: "+err.Error())
		return
	}

	utils.Success(c, settlement)
}

func MarkSettlementPaid(c *gin.Context) {
	id := c.Param("id")

	var settlement model.SettlementOrder
	if err := dao.DB.First(&settlement, id).Error; err != nil {
		utils.Error(c, "结算单不存在")
		return
	}

	if settlement.Status != 1 {
		utils.Error(c, "请先确认结算单")
		return
	}

	settlement.Status = 2
	settlement.PaidAt = time.Now()

	if err := dao.DB.Save(&settlement).Error; err != nil {
		utils.Error(c, "标记付款失败: "+err.Error())
		return
	}

	utils.Success(c, settlement)
}

func GetSettlementOrder(c *gin.Context) {
	id := c.Param("id")

	var settlement model.SettlementOrder
	if err := dao.DB.First(&settlement, id).Error; err != nil {
		utils.Error(c, "结算单不存在")
		return
	}

	var details []model.SettlementOrderDetail
	dao.DB.Where("settlement_order_id = ?", settlement.ID).Find(&details)

	utils.Success(c, gin.H{
		"settlement": settlement,
		"details":    details,
	})
}

func ListSettlementOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	stakeholderID := c.Query("stakeholder_id")
	status := c.Query("status")
	settlementPeriod := c.Query("settlement_period")

	query := dao.DB.Model(&model.SettlementOrder{})

	if stakeholderID != "" {
		query = query.Where("stakeholder_id = ?", stakeholderID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if settlementPeriod != "" {
		query = query.Where("settlement_period = ?", settlementPeriod)
	}

	var total int64
	query.Count(&total)

	var settlements []model.SettlementOrder
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&settlements)

	utils.Page(c, settlements, total, page, pageSize)
}

func RegisterSettlementRoutes(r *gin.Engine) {
	settlementGroup := r.Group("/api/settlements")
	settlementGroup.Use(middleware.AuthMiddleware())
	{
		settlementGroup.POST("", middleware.AdminMiddleware(), CreateSettlementOrder)
		settlementGroup.GET("/:id", GetSettlementOrder)
		settlementGroup.GET("", ListSettlementOrders)
		settlementGroup.POST("/:id/verify", middleware.AdminMiddleware(), VerifySettlementOrder)
		settlementGroup.POST("/:id/confirm", middleware.AdminMiddleware(), ConfirmSettlementOrder)
		settlementGroup.POST("/:id/paid", middleware.AdminMiddleware(), MarkSettlementPaid)
	}
}
