package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"

	"github.com/gin-gonic/gin"
)

func GetStations(c *gin.Context) {
	var stations []models.Station
	database.DB.Find(&stations)
	utils.Success(c, stations)
}

func GetStation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var station models.Station
	if err := database.DB.First(&station, id).Error; err != nil {
		utils.NotFound(c, "站点不存在")
		return
	}
	utils.Success(c, station)
}

func CreateStation(c *gin.Context) {
	var station models.Station
	if err := c.ShouldBindJSON(&station); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	if err := database.DB.Create(&station).Error; err != nil {
		utils.InternalError(c, "创建站点失败")
		return
	}
	utils.Success(c, station)
}

func UpdateStation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var station models.Station
	if err := database.DB.First(&station, id).Error; err != nil {
		utils.NotFound(c, "站点不存在")
		return
	}
	if err := c.ShouldBindJSON(&station); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	database.DB.Save(&station)
	utils.Success(c, station)
}

func DeleteStation(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	if err := database.DB.Delete(&models.Station{}, id).Error; err != nil {
		utils.InternalError(c, "删除站点失败")
		return
	}
	utils.Success(c, nil)
}
