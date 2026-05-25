package handlers

import (
	"context"
	"net/http"
	"strconv"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ParkingSpotHandler struct {
	DB *gorm.DB
}

func NewParkingSpotHandler(db *gorm.DB) *ParkingSpotHandler {
	return &ParkingSpotHandler{DB: db}
}

type SpotRequest struct {
	SpotNumber string `json:"spot_number" binding:"required"`
	SpotType   int    `json:"spot_type"`
	SpotArea   string `json:"spot_area"`
	Status     int    `json:"status"`
	Remark     string `json:"remark"`
}

func (h *ParkingSpotHandler) Create(c *gin.Context) {
	var req SpotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	var existing models.ParkingSpot
	if h.DB.Where("spot_number = ?", req.SpotNumber).First(&existing).Error == nil {
		utils.Fail(c, http.StatusConflict, "车位号已存在")
		return
	}

	spot := models.ParkingSpot{
		SpotNumber: req.SpotNumber,
		SpotType:   req.SpotType,
		SpotArea:   req.SpotArea,
		Status:     req.Status,
		Remark:     req.Remark,
	}

	if err := h.DB.Create(&spot).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "创建失败: "+err.Error())
		return
	}

	utils.Success(c, spot)
}

func (h *ParkingSpotHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req SpotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var spot models.ParkingSpot
	if err := h.DB.First(&spot, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车位不存在")
		return
	}

	spot.SpotType = req.SpotType
	spot.SpotArea = req.SpotArea
	spot.Remark = req.Remark

	if err := h.DB.Save(&spot).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, spot)
}

func (h *ParkingSpotHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	if err := h.DB.Delete(&models.ParkingSpot{}, id).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "删除失败")
		return
	}

	ctx := context.Background()
	utils.DeleteSpotStatus(ctx, uint(id))

	utils.Success(c, nil)
}

func (h *ParkingSpotHandler) List(c *gin.Context) {
	spotArea := c.Query("spot_area")
	status := c.Query("status")
	spotType := c.Query("spot_type")

	query := h.DB.Model(&models.ParkingSpot{})
	if spotArea != "" {
		query = query.Where("spot_area = ?", spotArea)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if spotType != "" {
		query = query.Where("spot_type = ?", spotType)
	}

	var total int64
	query.Count(&total)

	var spots []models.ParkingSpot
	query.Order("spot_number ASC").Find(&spots)

	utils.Success(c, gin.H{
		"list":  spots,
		"total": total,
	})
}

func (h *ParkingSpotHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var spot models.ParkingSpot
	if err := h.DB.First(&spot, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车位不存在")
		return
	}

	utils.Success(c, spot)
}

func (h *ParkingSpotHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	if err := h.DB.Model(&models.ParkingSpot{}).Where("id = ?", id).Update("status", req.Status).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func (h *ParkingSpotHandler) Statistics(c *gin.Context) {
	var stats struct {
		Total   int64 `json:"total"`
		Free    int64 `json:"free"`
		Occupied int64 `json:"occupied"`
		Reserved int64 `json:"reserved"`
		Repair  int64 `json:"repair"`
	}

	h.DB.Model(&models.ParkingSpot{}).Count(&stats.Total)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 0").Count(&stats.Free)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 1").Count(&stats.Occupied)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 2").Count(&stats.Reserved)
	h.DB.Model(&models.ParkingSpot{}).Where("status = 3").Count(&stats.Repair)

	utils.Success(c, stats)
}

func (h *ParkingSpotHandler) AreaList(c *gin.Context) {
	var areas []struct {
		SpotArea string `json:"spot_area"`
		Total    int64  `json:"total"`
		Free     int64  `json:"free"`
	}

	h.DB.Table("parking_spots").
		Select("spot_area, COUNT(*) as total, SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as free").
		Where("deleted_at IS NULL").
		Group("spot_area").
		Scan(&areas)

	utils.Success(c, areas)
}

func (h *ParkingSpotHandler) RealTimeStatus(c *gin.Context) {
	if utils.RedisClient == nil {
		h.List(c)
		return
	}

	ctx := context.Background()
	cachedSpots, _ := utils.GetAllSpotStatus(ctx)

	spotArea := c.Query("spot_area")

	var spots []models.ParkingSpot
	query := h.DB.Model(&models.ParkingSpot{})
	if spotArea != "" {
		query = query.Where("spot_area = ?", spotArea)
	}
	query.Order("spot_number ASC").Find(&spots)

	for i := range spots {
		key := utils.GetSpotStatusKey(spots[i].ID)
		if cached, ok := cachedSpots[key]; ok {
			spots[i].Status = cached.Status
			spots[i].CurrentPlateNumber = cached.PlateNumber
		}
	}

	utils.Success(c, spots)
}
