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

type CreateReconciliationRequest struct {
	DramaID              uint64  `json:"drama_id" binding:"required"`
	SettlementPeriod     string  `json:"settlement_period" binding:"required"`
	ThirdPartyPlayCount  int64   `json:"third_party_play_count"`
	ThirdPartyPaymentAmount float64 `json:"third_party_payment_amount"`
}

func CreateReconciliation(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateReconciliationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var existing model.ReconciliationRecord
	result := dao.DB.Where("drama_id = ? AND settlement_period = ?",
		req.DramaID, req.SettlementPeriod).First(&existing)

	if result.Error == nil {
		utils.Success(c, existing)
		return
	}

	startDate, endDate := getPeriodDateRange(req.SettlementPeriod)

	var playData []model.PlayData
	dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ? AND status = 1",
		req.DramaID, startDate, endDate).Find(&playData)

	var systemPlayCount int64
	for _, pd := range playData {
		systemPlayCount += pd.PlayCount
	}

	var paymentData []model.PaymentData
	dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ? AND status = 1",
		req.DramaID, startDate, endDate).Find(&paymentData)

	var systemPaymentAmount float64
	for _, pd := range paymentData {
		systemPaymentAmount += pd.PaymentAmount
	}

	playCountDiff := req.ThirdPartyPlayCount - systemPlayCount
	paymentAmountDiff := req.ThirdPartyPaymentAmount - systemPaymentAmount

	status := int8(1)
	if playCountDiff != 0 || paymentAmountDiff != 0 {
		status = 2
	}

	reconciliation := &model.ReconciliationRecord{
		ReconciliationNo:     utils.GenerateNo("REC"),
		DramaID:              req.DramaID,
		SettlementPeriod:     req.SettlementPeriod,
		SystemPlayCount:      systemPlayCount,
		ThirdPartyPlayCount:  req.ThirdPartyPlayCount,
		PlayCountDiff:        playCountDiff,
		SystemPaymentAmount:  systemPaymentAmount,
		ThirdPartyPaymentAmount: req.ThirdPartyPaymentAmount,
		PaymentAmountDiff:    paymentAmountDiff,
		Status:               status,
		CreatedBy:            userID.(uint64),
	}

	if err := dao.DB.Create(reconciliation).Error; err != nil {
		utils.Error(c, "创建对账记录失败: "+err.Error())
		return
	}

	if status == 2 {
		createReconciliationDetails(reconciliation.ID, req.DramaID, startDate, endDate)
	}

	utils.Success(c, reconciliation)
}

func createReconciliationDetails(reconciliationID, dramaID uint64, startDate, endDate time.Time) {
	var playData []model.PlayData
	dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ?",
		dramaID, startDate, endDate).Find(&playData)

	for _, pd := range playData {
		systemValue := float64(pd.PlayCount)
		diff := 0.0
		diffRatio := 0.0
		if systemValue > 0 {
			diffRatio = diff / systemValue * 100
		}

		detail := &model.ReconciliationDetail{
			ReconciliationID: reconciliationID,
			DataType:         1,
			DataDate:         pd.DataDate,
			SystemValue:      systemValue,
			ThirdPartyValue:  systemValue,
			DiffValue:        diff,
			DiffRatio:        diffRatio,
		}
		dao.DB.Create(detail)
	}

	var paymentData []model.PaymentData
	dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ?",
		dramaID, startDate, endDate).Find(&paymentData)

	for _, pd := range paymentData {
		diff := 0.0
		diffRatio := 0.0
		if pd.PaymentAmount > 0 {
			diffRatio = diff / pd.PaymentAmount * 100
		}

		detail := &model.ReconciliationDetail{
			ReconciliationID: reconciliationID,
			DataType:         2,
			DataDate:         pd.DataDate,
			SystemValue:      pd.PaymentAmount,
			ThirdPartyValue:  pd.PaymentAmount,
			DiffValue:        diff,
			DiffRatio:        diffRatio,
		}
		dao.DB.Create(detail)
	}
}

func getPeriodDateRange(period string) (time.Time, time.Time) {
	t, _ := time.Parse("200601", period)
	startDate := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, -1)
	return startDate, endDate
}

func GetReconciliation(c *gin.Context) {
	id := c.Param("id")

	var reconciliation model.ReconciliationRecord
	if err := dao.DB.First(&reconciliation, id).Error; err != nil {
		utils.Error(c, "对账记录不存在")
		return
	}

	var details []model.ReconciliationDetail
	dao.DB.Where("reconciliation_id = ?", reconciliation.ID).Find(&details)

	utils.Success(c, gin.H{
		"reconciliation": reconciliation,
		"details":        details,
	})
}

func ListReconciliations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dramaID := c.Query("drama_id")
	status := c.Query("status")
	settlementPeriod := c.Query("settlement_period")

	query := dao.DB.Model(&model.ReconciliationRecord{})

	if dramaID != "" {
		query = query.Where("drama_id = ?", dramaID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if settlementPeriod != "" {
		query = query.Where("settlement_period = ?", settlementPeriod)
	}

	var total int64
	query.Count(&total)

	var reconciliations []model.ReconciliationRecord
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&reconciliations)

	utils.Page(c, reconciliations, total, page, pageSize)
}

func AdjustReconciliation(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		AdjustmentRemark string `json:"adjustment_remark" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var reconciliation model.ReconciliationRecord
	if err := dao.DB.First(&reconciliation, id).Error; err != nil {
		utils.Error(c, "对账记录不存在")
		return
	}

	reconciliation.Status = 3
	reconciliation.AdjustmentRemark = req.AdjustmentRemark
	now := time.Now()
	reconciliation.ReconciledAt = &now

	if err := dao.DB.Save(&reconciliation).Error; err != nil {
		utils.Error(c, "调整对账记录失败: "+err.Error())
		return
	}

	utils.Success(c, reconciliation)
}

func RegisterReconciliationRoutes(r *gin.Engine) {
	reconGroup := r.Group("/api/reconciliations")
	reconGroup.Use(middleware.AuthMiddleware())
	{
		reconGroup.POST("", middleware.AdminMiddleware(), CreateReconciliation)
		reconGroup.GET("", ListReconciliations)

		reconGroup.POST("/:id/adjust", middleware.AdminMiddleware(), AdjustReconciliation)

		reconGroup.GET("/:id", GetReconciliation)
	}
}
