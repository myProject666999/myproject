package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetProductCategories(c *gin.Context) {
	var categories []string
	utils.DB.Model(&models.Product{}).Distinct("pluck").Where("status = ?", 1).Pluck("category", &categories)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": categories})
}

func GetProductList(c *gin.Context) {
	category := c.Query("category")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Product{}).Where("status = ? AND stock > 0", 1)
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var products []models.Product
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&products)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": products, "total": total}})
}

func GetProductDetail(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	if err := utils.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": product})
}

func AdminGetProductList(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Product{})
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var products []models.Product
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&products)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": products, "total": total}})
}

func CreateProduct(c *gin.Context) {
	var product models.Product
	c.ShouldBindJSON(&product)
	utils.DB.Create(&product)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": product})
}

func UpdateProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var product models.Product
	utils.DB.First(&product, id)
	c.ShouldBindJSON(&product)
	utils.DB.Save(&product)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": product})
}

func DeleteProduct(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.Product{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ExchangeProduct(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	var req struct {
		ProductID uint `json:"product_id"`
		Quantity  int  `json:"quantity"`
	}
	c.ShouldBindJSON(&req)

	var product models.Product
	if err := utils.DB.First(&product, req.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "商品不存在"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "库存不足"})
		return
	}

	totalPoints := product.PointsPrice * req.Quantity
	if student.Points < totalPoints {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "积分不足"})
		return
	}

	record := models.ExchangeRecord{
		StudentID:   student.ID,
		ProductID:   product.ID,
		Quantity:    req.Quantity,
		TotalPoints: totalPoints,
		Status:      0,
	}
	utils.DB.Create(&record)

	utils.DB.Model(&product).Update("stock", product.Stock-req.Quantity)
	utils.DB.Model(&student).Update("points", student.Points-totalPoints)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "兑换成功", "data": record})
}

func GetMyExchanges(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.ExchangeRecord{}).Where("student_id = ?", student.ID).Count(&total)

	var records []models.ExchangeRecord
	utils.DB.Where("student_id = ?", student.ID).Preload("Product").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&records)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": records, "total": total}})
}

func AdminGetExchanges(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.ExchangeRecord{}).Count(&total)

	var records []models.ExchangeRecord
	utils.DB.Preload("Student").Preload("Product").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&records)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": records, "total": total}})
}
