package handlers

import (
	"net/http"
	"strconv"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type PaymentHandler struct {
	DB *gorm.DB
}

func NewPaymentHandler(db *gorm.DB) *PaymentHandler {
	return &PaymentHandler{DB: db}
}

func (h *PaymentHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	paymentType := c.Query("payment_type")
	payStatus := c.Query("pay_status")
	payMethod := c.Query("pay_method")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	query := h.DB.Model(&models.Payment{})
	if paymentType != "" {
		query = query.Where("payment_type = ?", paymentType)
	}
	if payStatus != "" {
		query = query.Where("pay_status = ?", payStatus)
	}
	if payMethod != "" {
		query = query.Where("pay_method = ?", payMethod)
	}
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate+" 23:59:59")
	}

	var total int64
	query.Count(&total)

	var payments []models.Payment
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&payments)

	utils.Success(c, gin.H{
		"list":      payments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *PaymentHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var payment models.Payment
	if err := h.DB.First(&payment, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "支付记录不存在")
		return
	}

	utils.Success(c, payment)
}

func (h *PaymentHandler) Statistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		startDate = "1970-01-01"
	}
	if endDate == "" {
		endDate = "2099-12-31"
	}

	var stats struct {
		TotalCount     int64   `json:"total_count"`
		TotalAmount    float64 `json:"total_amount"`
		ParkingCount   int64   `json:"parking_count"`
		ParkingAmount  float64 `json:"parking_amount"`
		MonthlyCount   int64   `json:"monthly_count"`
		MonthlyAmount  float64 `json:"monthly_amount"`
	}

	query := h.DB.Model(&models.Payment{}).
		Where("pay_status = 1 AND created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59")

	query.Count(&stats.TotalCount)
	query.Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalAmount)

	h.DB.Model(&models.Payment{}).
		Where("payment_type = 1 AND pay_status = 1 AND created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59").
		Count(&stats.ParkingCount)
	h.DB.Model(&models.Payment{}).
		Where("payment_type = 1 AND pay_status = 1 AND created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59").
		Select("COALESCE(SUM(amount), 0)").Scan(&stats.ParkingAmount)

	h.DB.Model(&models.Payment{}).
		Where("payment_type = 2 AND pay_status = 1 AND created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59").
		Count(&stats.MonthlyCount)
	h.DB.Model(&models.Payment{}).
		Where("payment_type = 2 AND pay_status = 1 AND created_at >= ? AND created_at <= ?", startDate, endDate+" 23:59:59").
		Select("COALESCE(SUM(amount), 0)").Scan(&stats.MonthlyAmount)

	utils.Success(c, stats)
}
