package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type VehicleHandler struct {
	DB *gorm.DB
}

func NewVehicleHandler(db *gorm.DB) *VehicleHandler {
	return &VehicleHandler{DB: db}
}

type VehicleRequest struct {
	PlateNumber    string `json:"plate_number" binding:"required"`
	VehicleType    int    `json:"vehicle_type"`
	OwnerName      string `json:"owner_name"`
	OwnerPhone     string `json:"owner_phone"`
	CardType       int    `json:"card_type"`
	CardExpireTime string `json:"card_expire_time"`
	Remark         string `json:"remark"`
}

func parseDate(s string) (*time.Time, error) {
	if s == "" {
		return nil, nil
	}
	layouts := []string{
		"2006-01-02",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		time.RFC3339,
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, s); err == nil {
			return &t, nil
		}
	}
	return nil, fmt.Errorf("日期格式错误: %s", s)
}

func (h *VehicleHandler) Create(c *gin.Context) {
	var req VehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	var existing models.Vehicle
	if h.DB.Where("plate_number = ?", req.PlateNumber).First(&existing).Error == nil {
		utils.Fail(c, http.StatusConflict, "车牌号已存在")
		return
	}

	expireTime, err := parseDate(req.CardExpireTime)
	if err != nil {
		utils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}

	vehicle := models.Vehicle{
		PlateNumber:    req.PlateNumber,
		VehicleType:    req.VehicleType,
		OwnerName:      req.OwnerName,
		OwnerPhone:     req.OwnerPhone,
		CardType:       req.CardType,
		CardExpireTime: expireTime,
		Status:         1,
		Remark:         req.Remark,
	}

	if err := h.DB.Create(&vehicle).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "创建失败: "+err.Error())
		return
	}

	utils.Success(c, vehicle)
}

func (h *VehicleHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req VehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var vehicle models.Vehicle
	if err := h.DB.First(&vehicle, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车辆不存在")
		return
	}

	vehicle.VehicleType = req.VehicleType
	vehicle.OwnerName = req.OwnerName
	vehicle.OwnerPhone = req.OwnerPhone
	vehicle.CardType = req.CardType

	expireTime, err := parseDate(req.CardExpireTime)
	if err != nil {
		utils.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	vehicle.CardExpireTime = expireTime
	vehicle.Remark = req.Remark

	if err := h.DB.Save(&vehicle).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, vehicle)
}

func (h *VehicleHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := h.DB.Delete(&models.Vehicle{}, id).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func (h *VehicleHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	plateNumber := c.Query("plate_number")
	cardType := c.Query("card_type")
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	query := h.DB.Model(&models.Vehicle{})
	if plateNumber != "" {
		query = query.Where("plate_number LIKE ?", "%"+plateNumber+"%")
	}
	if cardType != "" {
		query = query.Where("card_type = ?", cardType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var vehicles []models.Vehicle
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&vehicles)

	utils.Success(c, gin.H{
		"list":       vehicles,
		"total":      total,
		"page":       page,
		"page_size":  pageSize,
	})
}

func (h *VehicleHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var vehicle models.Vehicle
	if err := h.DB.First(&vehicle, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车辆不存在")
		return
	}

	utils.Success(c, vehicle)
}

func (h *VehicleHandler) GetByPlate(c *gin.Context) {
	plateNumber := c.Param("plate")

	var vehicle models.Vehicle
	if err := h.DB.Where("plate_number = ?", plateNumber).First(&vehicle).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车辆不存在")
		return
	}

	utils.Success(c, vehicle)
}

func (h *VehicleHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	if err := h.DB.Model(&models.Vehicle{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, nil)
}
