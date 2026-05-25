package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MonthlyCardHandler struct {
	DB *gorm.DB
}

func NewMonthlyCardHandler(db *gorm.DB) *MonthlyCardHandler {
	return &MonthlyCardHandler{DB: db}
}

type MonthlyCardRequest struct {
	VehicleID   uint   `json:"vehicle_id" binding:"required"`
	PlateNumber string `json:"plate_number"`
	OwnerName   string `json:"owner_name"`
	OwnerPhone  string `json:"owner_phone"`
	StartDate   string `json:"start_date" binding:"required"`
	Months      int    `json:"months" binding:"required,min=1"`
	PayMethod   string `json:"pay_method"`
	Remark      string `json:"remark"`
}

func (h *MonthlyCardHandler) Create(c *gin.Context) {
	var req MonthlyCardRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	var vehicle models.Vehicle
	if err := h.DB.First(&vehicle, req.VehicleID).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车辆不存在")
		return
	}

	plateNumber := req.PlateNumber
	if plateNumber == "" {
		plateNumber = vehicle.PlateNumber
	}
	ownerName := req.OwnerName
	if ownerName == "" {
		ownerName = vehicle.OwnerName
	}
	ownerPhone := req.OwnerPhone
	if ownerPhone == "" {
		ownerPhone = vehicle.OwnerPhone
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		utils.Fail(c, http.StatusBadRequest, "日期格式错误，应为YYYY-MM-DD")
		return
	}

	endDate := startDate.AddDate(0, req.Months, 0)

	var rule models.BillingRule
	h.DB.Where("vehicle_type = ? AND status = 1", vehicle.VehicleType).
		Order("priority DESC").
		First(&rule)

	var totalFee float64
	if rule.MonthlyFee != nil {
		totalFee = *rule.MonthlyFee * float64(req.Months)
	}

	cardNumber := fmt.Sprintf("MC%s%s", time.Now().Format("20060102150405"), uuid.New().String()[:8])

	card := models.MonthlyCard{
		CardNumber:  cardNumber,
		VehicleID:   req.VehicleID,
		PlateNumber: plateNumber,
		OwnerName:   ownerName,
		OwnerPhone:  ownerPhone,
		StartDate:   startDate,
		EndDate:     endDate,
		Months:      req.Months,
		TotalFee:    totalFee,
		Status:      1,
		Remark:      req.Remark,
	}

	tx := h.DB.Begin()
	if err := tx.Create(&card).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "创建月卡失败")
		return
	}

	if err := tx.Model(&vehicle).Updates(map[string]interface{}{
		"card_type":        2,
		"card_expire_time": endDate,
	}).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "更新车辆信息失败")
		return
	}

	payMethod := req.PayMethod
	if payMethod == "" {
		payMethod = "现金"
	}

	now := time.Now()
	paymentNumber := fmt.Sprintf("PAY%s%s", now.Format("20060102150405"), uuid.New().String()[:8])
	payment := models.Payment{
		PaymentNumber: paymentNumber,
		CardID:        &card.ID,
		PaymentType:   2,
		Amount:        totalFee,
		PayMethod:     payMethod,
		PayStatus:     1,
		PayTime:       &now,
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "创建支付记录失败")
		return
	}

	tx.Commit()
	utils.Success(c, gin.H{
		"card":    card,
		"payment": payment,
	})
}

func (h *MonthlyCardHandler) Renew(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Months    int    `json:"months" binding:"required,min=1"`
		PayMethod string `json:"pay_method"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var card models.MonthlyCard
	if err := h.DB.First(&card, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "月卡不存在")
		return
	}

	var vehicle models.Vehicle
	h.DB.First(&vehicle, card.VehicleID)

	var rule models.BillingRule
	h.DB.Where("vehicle_type = ? AND status = 1", vehicle.VehicleType).
		Order("priority DESC").
		First(&rule)

	var fee float64
	if rule.MonthlyFee != nil {
		fee = *rule.MonthlyFee * float64(req.Months)
	}

	var newEndDate time.Time
	if card.EndDate.After(time.Now()) {
		newEndDate = card.EndDate.AddDate(0, req.Months, 0)
	} else {
		newEndDate = time.Now().AddDate(0, req.Months, 0)
	}

	tx := h.DB.Begin()

	if err := tx.Model(&card).Updates(map[string]interface{}{
		"end_date":   newEndDate,
		"months":     card.Months + req.Months,
		"total_fee":  card.TotalFee + fee,
		"status":     1,
	}).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "续期失败")
		return
	}

	if err := tx.Model(&vehicle).Updates(map[string]interface{}{
		"card_type":        2,
		"card_expire_time": newEndDate,
	}).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "更新车辆信息失败")
		return
	}

	payMethod := req.PayMethod
	if payMethod == "" {
		payMethod = "现金"
	}

	now := time.Now()
	paymentNumber := fmt.Sprintf("PAY%s%s", now.Format("20060102150405"), uuid.New().String()[:8])
	payment := models.Payment{
		PaymentNumber: paymentNumber,
		CardID:        &card.ID,
		PaymentType:   2,
		Amount:        fee,
		PayMethod:     payMethod,
		PayStatus:     1,
		PayTime:       &now,
	}

	if err := tx.Create(&payment).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "创建支付记录失败")
		return
	}

	tx.Commit()
	utils.Success(c, gin.H{
		"new_end_date": newEndDate,
		"fee":          fee,
	})
}

func (h *MonthlyCardHandler) Refund(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var card models.MonthlyCard
	if err := h.DB.First(&card, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "月卡不存在")
		return
	}

	if card.Status != 1 {
		utils.Fail(c, http.StatusBadRequest, "该月卡状态不允许退卡")
		return
	}

	tx := h.DB.Begin()

	if err := tx.Model(&card).Update("status", 3).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "退卡失败")
		return
	}

	var vehicle models.Vehicle
	if err := tx.First(&vehicle, card.VehicleID).Error; err == nil {
		tx.Model(&vehicle).Updates(map[string]interface{}{
			"card_type":        1,
			"card_expire_time": nil,
		})
	}

	tx.Commit()
	utils.Success(c, nil)
}

func (h *MonthlyCardHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	plateNumber := c.Query("plate_number")
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	query := h.DB.Model(&models.MonthlyCard{})
	if plateNumber != "" {
		query = query.Where("plate_number LIKE ?", "%"+plateNumber+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var cards []models.MonthlyCard
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&cards)

	utils.Success(c, gin.H{
		"list":      cards,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *MonthlyCardHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var card models.MonthlyCard
	if err := h.DB.First(&card, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "月卡不存在")
		return
	}

	utils.Success(c, card)
}

func (h *MonthlyCardHandler) GetByVehicle(c *gin.Context) {
	vehicleID, _ := strconv.ParseUint(c.Param("vehicle_id"), 10, 64)

	var cards []models.MonthlyCard
	h.DB.Where("vehicle_id = ?", vehicleID).
		Order("id DESC").
		Find(&cards)

	utils.Success(c, cards)
}

func (h *MonthlyCardHandler) GetByPlate(c *gin.Context) {
	plateNumber := c.Param("plate")

	var cards []models.MonthlyCard
	h.DB.Where("plate_number = ?", plateNumber).
		Order("id DESC").
		Find(&cards)

	utils.Success(c, cards)
}

func (h *MonthlyCardHandler) Statistics(c *gin.Context) {
	var stats struct {
		Total     int64 `json:"total"`
		Active    int64 `json:"active"`
		Expired   int64 `json:"expired"`
		Refunded  int64 `json:"refunded"`
		Expiring  int64 `json:"expiring"`
	}

	h.DB.Model(&models.MonthlyCard{}).Count(&stats.Total)
	h.DB.Model(&models.MonthlyCard{}).Where("status = 1").Count(&stats.Active)
	h.DB.Model(&models.MonthlyCard{}).Where("status = 2").Count(&stats.Expired)
	h.DB.Model(&models.MonthlyCard{}).Where("status = 3").Count(&stats.Refunded)

	nextMonth := time.Now().AddDate(0, 1, 0)
	h.DB.Model(&models.MonthlyCard{}).
		Where("status = 1 AND end_date <= ?", nextMonth).
		Count(&stats.Expiring)

	utils.Success(c, stats)
}

func (h *MonthlyCardHandler) CheckExpired() {
	now := time.Now()
	h.DB.Model(&models.MonthlyCard{}).
		Where("status = 1 AND end_date < ?", now).
		Update("status", 2)
}

func (h *MonthlyCardHandler) ExpiringList(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "30"))
	if days < 1 || days > 90 {
		days = 30
	}

	expireDate := time.Now().AddDate(0, 0, days)

	var cards []models.MonthlyCard
	h.DB.Where("status = 1 AND end_date <= ?", expireDate).
		Order("end_date ASC").
		Find(&cards)

	utils.Success(c, cards)
}
