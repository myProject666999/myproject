package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"

	"github.com/gin-gonic/gin"
)

func GetWaterPrices(c *gin.Context) {
	var prices []models.WaterPrice
	database.DB.Preload("SettlementType").Find(&prices)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": prices})
}

func GetWaterPrice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var price models.WaterPrice
	if err := database.DB.Preload("SettlementType").First(&price, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水费价格不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": price})
}

func CreateWaterPrice(c *gin.Context) {
	var price models.WaterPrice
	if err := c.ShouldBindJSON(&price); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := database.DB.Create(&price).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "价格编码已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": price})
}

func UpdateWaterPrice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var price models.WaterPrice
	if err := database.DB.First(&price, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水费价格不存在"})
		return
	}

	var input models.WaterPrice
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	database.DB.Model(&price).Updates(input)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": price})
}

func DeleteWaterPrice(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.WaterPrice{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
