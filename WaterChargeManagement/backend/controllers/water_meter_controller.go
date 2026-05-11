package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"

	"github.com/gin-gonic/gin"
)

func GetWaterMeters(c *gin.Context) {
	meterNo := c.Query("meter_no")
	var meters []models.WaterMeter
	query := database.DB.Preload("User").Preload("User.Community")

	if meterNo != "" {
		query = query.Where("meter_no LIKE ?", "%"+meterNo+"%")
	}

	query.Find(&meters)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": meters})
}

func GetWaterMeter(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var meter models.WaterMeter
	if err := database.DB.Preload("User").Preload("User.Community").First(&meter, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水表不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": meter})
}

func CreateWaterMeter(c *gin.Context) {
	var meter models.WaterMeter
	if err := c.ShouldBindJSON(&meter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if meter.Status == "" {
		meter.Status = "normal"
	}

	if err := database.DB.Create(&meter).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "水表编号已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": meter})
}

func UpdateWaterMeter(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var meter models.WaterMeter
	if err := database.DB.First(&meter, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水表不存在"})
		return
	}

	var input models.WaterMeter
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	database.DB.Model(&meter).Updates(input)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": meter})
}

func DeleteWaterMeter(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.WaterMeter{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
