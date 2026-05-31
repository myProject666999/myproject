package handler

import (
	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type DroneReq struct {
	Name          string  `json:"name" binding:"required"`
	SN            string  `json:"sn" binding:"required"`
	Model         string  `json:"model"`
	MaxFlightTime int     `json:"max_flight_time"`
	MaxAltitude   float64 `json:"max_altitude"`
	MaxSpeed      float64 `json:"max_speed"`
	CameraType    string  `json:"camera_type"`
}

func CreateDrone(c *gin.Context) {
	var req DroneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	drone := model.Drone{
		Name:          req.Name,
		SN:            req.SN,
		Model:         req.Model,
		MaxFlightTime: req.MaxFlightTime,
		MaxAltitude:   req.MaxAltitude,
		MaxSpeed:      req.MaxSpeed,
		CameraType:    req.CameraType,
		Status:        0,
	}
	if err := database.DB.Create(&drone).Error; err != nil {
		utils.Fail(c, 500, "failed to create drone")
		return
	}
	utils.Success(c, drone)
}

func GetDrone(c *gin.Context) {
	id := c.Param("id")
	var drone model.Drone
	if err := database.DB.First(&drone, id).Error; err != nil {
		utils.Fail(c, 404, "drone not found")
		return
	}
	utils.Success(c, drone)
}

func UpdateDrone(c *gin.Context) {
	id := c.Param("id")
	var drone model.Drone
	if err := database.DB.First(&drone, id).Error; err != nil {
		utils.Fail(c, 404, "drone not found")
		return
	}
	var req DroneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&drone).Updates(map[string]interface{}{
		"name":            req.Name,
		"sn":              req.SN,
		"model":           req.Model,
		"max_flight_time": req.MaxFlightTime,
		"max_altitude":    req.MaxAltitude,
		"max_speed":       req.MaxSpeed,
		"camera_type":     req.CameraType,
	})
	utils.Success(c, drone)
}

func DeleteDrone(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Drone{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete drone")
		return
	}
	utils.Success(c, nil)
}

func ListDrones(c *gin.Context) {
	var drones []model.Drone
	query := database.DB.Model(&model.Drone{})
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&drones)
	utils.Success(c, gin.H{"total": total, "list": drones})
}
