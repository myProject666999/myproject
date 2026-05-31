package handler

import (
	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type AreaReq struct {
	Name            string  `json:"name" binding:"required"`
	AreaType        int8    `json:"area_type"`
	BoundaryPolygon string  `json:"boundary_polygon" binding:"required"`
	CenterLng       float64 `json:"center_lng" binding:"required"`
	CenterLat       float64 `json:"center_lat" binding:"required"`
	Description     string  `json:"description"`
}

func CreateArea(c *gin.Context) {
	var req AreaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	userID := c.GetUint64("user_id")
	area := model.InspectionArea{
		Name:            req.Name,
		AreaType:        req.AreaType,
		BoundaryPolygon: req.BoundaryPolygon,
		CenterLng:       req.CenterLng,
		CenterLat:       req.CenterLat,
		Description:     req.Description,
		CreatedBy:       userID,
	}
	if err := database.DB.Create(&area).Error; err != nil {
		utils.Fail(c, 500, "failed to create area")
		return
	}
	utils.Success(c, area)
}

func GetArea(c *gin.Context) {
	id := c.Param("id")
	var area model.InspectionArea
	if err := database.DB.First(&area, id).Error; err != nil {
		utils.Fail(c, 404, "area not found")
		return
	}
	utils.Success(c, area)
}

func UpdateArea(c *gin.Context) {
	id := c.Param("id")
	var area model.InspectionArea
	if err := database.DB.First(&area, id).Error; err != nil {
		utils.Fail(c, 404, "area not found")
		return
	}
	var req AreaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&area).Updates(map[string]interface{}{
		"name":             req.Name,
		"area_type":        req.AreaType,
		"boundary_polygon": req.BoundaryPolygon,
		"center_lng":       req.CenterLng,
		"center_lat":       req.CenterLat,
		"description":      req.Description,
	})
	utils.Success(c, area)
}

func DeleteArea(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.InspectionArea{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete area")
		return
	}
	utils.Success(c, nil)
}

func ListAreas(c *gin.Context) {
	var areas []model.InspectionArea
	query := database.DB.Model(&model.InspectionArea{})
	if areaType := c.Query("area_type"); areaType != "" {
		query = query.Where("area_type = ?", areaType)
	}
	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&areas)
	utils.Success(c, gin.H{"total": total, "list": areas})
}
