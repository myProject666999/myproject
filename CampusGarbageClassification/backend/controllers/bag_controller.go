package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBagTypes(c *gin.Context) {
	var types []models.BagType
	utils.DB.Order("sort ASC").Find(&types)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": types})
}

func GetBagList(c *gin.Context) {
	typeID := c.Query("type_id")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.GarbageBag{}).Where("status = ?", 1)
	if typeID != "" {
		query = query.Where("type_id = ?", typeID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var bags []models.GarbageBag
	query.Preload("BagType").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&bags)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": bags, "total": total}})
}

func GetBagDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var bag models.GarbageBag
	if err := utils.DB.Preload("BagType").First(&bag, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bag})
}

func CreateBagType(c *gin.Context) {
	var t models.BagType
	c.ShouldBindJSON(&t)
	utils.DB.Create(&t)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": t})
}

func UpdateBagType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var t models.BagType
	utils.DB.First(&t, id)
	c.ShouldBindJSON(&t)
	utils.DB.Save(&t)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": t})
}

func DeleteBagType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.BagType{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AdminGetBagList(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.GarbageBag{})
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var bags []models.GarbageBag
	query.Preload("BagType").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&bags)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": bags, "total": total}})
}

func CreateBag(c *gin.Context) {
	var bag models.GarbageBag
	c.ShouldBindJSON(&bag)
	utils.DB.Create(&bag)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bag})
}

func UpdateBag(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bag models.GarbageBag
	utils.DB.First(&bag, id)
	c.ShouldBindJSON(&bag)
	utils.DB.Save(&bag)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bag})
}

func DeleteBag(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.GarbageBag{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func PurchaseBag(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	var req struct {
		BagID    uint `json:"bag_id"`
		Quantity int  `json:"quantity"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var bag models.GarbageBag
	if err := utils.DB.First(&bag, req.BagID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "垃圾袋不存在"})
		return
	}

	if bag.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "库存不足"})
		return
	}

	totalPrice := bag.Price * float64(req.Quantity)
	purchase := models.BagPurchase{
		StudentID:  student.ID,
		BagID:      bag.ID,
		Quantity:   req.Quantity,
		TotalPrice: totalPrice,
	}
	utils.DB.Create(&purchase)

	utils.DB.Model(&bag).Update("stock", bag.Stock-req.Quantity)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "购买成功", "data": purchase})
}

func GetMyPurchases(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.BagPurchase{}).Where("student_id = ?", student.ID).Count(&total)

	var purchases []models.BagPurchase
	utils.DB.Where("student_id = ?", student.ID).Preload("Bag").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&purchases)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": purchases, "total": total}})
}

func AdminGetPurchases(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.BagPurchase{}).Count(&total)

	var purchases []models.BagPurchase
	utils.DB.Preload("Student").Preload("Bag").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&purchases)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": purchases, "total": total}})
}
