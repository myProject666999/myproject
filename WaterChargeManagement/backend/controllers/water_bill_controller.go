package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"
	"watercharge/utils"

	"github.com/gin-gonic/gin"
)

func GetWaterBills(c *gin.Context) {
	userNo := c.Query("user_no")
	var bills []models.WaterBill
	query := database.DB.Preload("User").Preload("User.Community").Preload("Meter").Preload("WaterPrice")

	if userNo != "" {
		query = query.Joins("JOIN users ON users.id = water_bills.user_id").Where("users.user_no LIKE ?", "%"+userNo+"%")
	}

	query.Order("id desc").Find(&bills)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bills})
}

func GetUserBills(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var bills []models.WaterBill
	database.DB.Preload("User").Preload("Meter").Preload("WaterPrice").Where("user_id = ?", userID).Order("id desc").Find(&bills)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bills})
}

func GetWaterBill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bill models.WaterBill
	if err := database.DB.Preload("User").Preload("User.Community").Preload("Meter").Preload("WaterPrice").First(&bill, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水费账单不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bill})
}

func CreateWaterBill(c *gin.Context) {
	var bill models.WaterBill
	if err := c.ShouldBindJSON(&bill); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	bill.BillNo = utils.GenerateBillNo()
	bill.WaterUsage = bill.CurrentReading - bill.PreviousReading
	bill.TotalAmount = bill.WaterUsage * bill.UnitPrice
	bill.Status = "unpaid"
	bill.BillingDate = utils.GetCurrentDate()

	if err := database.DB.Create(&bill).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "创建失败: " + err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": bill})
}

func UpdateWaterBill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bill models.WaterBill
	if err := database.DB.First(&bill, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水费账单不存在"})
		return
	}

	var input models.WaterBill
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if input.CurrentReading > 0 && input.CurrentReading >= input.PreviousReading {
		input.WaterUsage = input.CurrentReading - input.PreviousReading
		input.TotalAmount = input.WaterUsage * input.UnitPrice
	}

	database.DB.Model(&bill).Updates(input)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": bill})
}

func PayWaterBill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bill models.WaterBill
	if err := database.DB.First(&bill, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "水费账单不存在"})
		return
	}

	bill.Status = "paid"
	bill.PaidDate = utils.GetCurrentDate()
	database.DB.Save(&bill)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "缴费成功", "data": bill})
}

func DeleteWaterBill(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.WaterBill{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
