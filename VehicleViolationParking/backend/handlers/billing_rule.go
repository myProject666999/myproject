package handlers

import (
	"net/http"
	"strconv"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BillingRuleHandler struct {
	DB *gorm.DB
}

func NewBillingRuleHandler(db *gorm.DB) *BillingRuleHandler {
	return &BillingRuleHandler{DB: db}
}

type BillingRuleRequest struct {
	RuleName     string  `json:"rule_name" binding:"required"`
	VehicleType  int     `json:"vehicle_type"`
	BaseFee      float64 `json:"base_fee"`
	BaseDuration int     `json:"base_duration"`
	UnitFee      float64 `json:"unit_fee"`
	UnitDuration int     `json:"unit_duration"`
	MaxFee       float64 `json:"max_fee"`
	FreeDuration int     `json:"free_duration"`
	MonthlyFee   *float64 `json:"monthly_fee"`
	Priority     int     `json:"priority"`
	Status       int     `json:"status"`
}

func (h *BillingRuleHandler) Create(c *gin.Context) {
	var req BillingRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	rule := models.BillingRule{
		RuleName:     req.RuleName,
		VehicleType:  req.VehicleType,
		BaseFee:      req.BaseFee,
		BaseDuration: req.BaseDuration,
		UnitFee:      req.UnitFee,
		UnitDuration: req.UnitDuration,
		MaxFee:       req.MaxFee,
		FreeDuration: req.FreeDuration,
		MonthlyFee:   req.MonthlyFee,
		Priority:     req.Priority,
		Status:       req.Status,
	}

	if err := h.DB.Create(&rule).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "创建失败")
		return
	}

	utils.Success(c, rule)
}

func (h *BillingRuleHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req BillingRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var rule models.BillingRule
	if err := h.DB.First(&rule, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "计费规则不存在")
		return
	}

	rule.RuleName = req.RuleName
	rule.VehicleType = req.VehicleType
	rule.BaseFee = req.BaseFee
	rule.BaseDuration = req.BaseDuration
	rule.UnitFee = req.UnitFee
	rule.UnitDuration = req.UnitDuration
	rule.MaxFee = req.MaxFee
	rule.FreeDuration = req.FreeDuration
	rule.MonthlyFee = req.MonthlyFee
	rule.Priority = req.Priority
	rule.Status = req.Status

	if err := h.DB.Save(&rule).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, rule)
}

func (h *BillingRuleHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := h.DB.Delete(&models.BillingRule{}, id).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func (h *BillingRuleHandler) List(c *gin.Context) {
	vehicleType := c.Query("vehicle_type")
	status := c.Query("status")

	query := h.DB.Model(&models.BillingRule{})
	if vehicleType != "" {
		query = query.Where("vehicle_type = ?", vehicleType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var rules []models.BillingRule
	query.Order("priority DESC, id DESC").Find(&rules)

	utils.Success(c, rules)
}

func (h *BillingRuleHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var rule models.BillingRule
	if err := h.DB.First(&rule, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "计费规则不存在")
		return
	}

	utils.Success(c, rule)
}

func (h *BillingRuleHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	if err := h.DB.Model(&models.BillingRule{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, nil)
}
