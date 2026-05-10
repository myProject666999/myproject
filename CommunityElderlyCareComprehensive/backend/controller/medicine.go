package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetMedicines(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var medicines []model.Medicine
	var total int64

	query := config.DB.Model(&model.Medicine{})
	if keyword != "" {
		query = query.Where("name LIKE ? OR generic_name LIKE ? OR manufacturer LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Offset(offset).Limit(pageSize).Order("id desc").Find(&medicines)

	c.JSON(http.StatusOK, gin.H{
		"list":     medicines,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine model.Medicine
	if err := config.DB.First(&medicine, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药物信息不存在"})
		return
	}

	c.JSON(http.StatusOK, medicine)
}

func CreateMedicine(c *gin.Context) {
	var medicine model.Medicine
	if err := c.ShouldBindJSON(&medicine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&medicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建药物信息失败"})
		return
	}

	c.JSON(http.StatusOK, medicine)
}

func UpdateMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine model.Medicine
	if err := config.DB.First(&medicine, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药物信息不存在"})
		return
	}

	if err := c.ShouldBindJSON(&medicine); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&medicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新药物信息失败"})
		return
	}

	c.JSON(http.StatusOK, medicine)
}

func DeleteMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine model.Medicine
	if err := config.DB.First(&medicine, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "药物信息不存在"})
		return
	}

	if err := config.DB.Delete(&medicine).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除药物信息失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
