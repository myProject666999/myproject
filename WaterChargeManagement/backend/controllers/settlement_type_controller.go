package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"

	"github.com/gin-gonic/gin"
)

func GetSettlementTypes(c *gin.Context) {
	keyword := c.Query("keyword")
	var types []models.SettlementType
	query := database.DB

	if keyword != "" {
		query = query.Where("type_code LIKE ? OR type_name LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Find(&types)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": types})
}

func GetSettlementType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var settlementType models.SettlementType
	if err := database.DB.First(&settlementType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "结算类型不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": settlementType})
}

func CreateSettlementType(c *gin.Context) {
	var settlementType models.SettlementType
	if err := c.ShouldBindJSON(&settlementType); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := database.DB.Create(&settlementType).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "类型编码已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": settlementType})
}

func UpdateSettlementType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var settlementType models.SettlementType
	if err := database.DB.First(&settlementType, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "结算类型不存在"})
		return
	}

	var input models.SettlementType
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	database.DB.Model(&settlementType).Updates(input)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": settlementType})
}

func DeleteSettlementType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.SettlementType{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
