package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAdvocateCategories(c *gin.Context) {
	var categories []models.AdvocateCategory
	utils.DB.Order("sort ASC").Find(&categories)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": categories})
}

func GetAdvocateList(c *gin.Context) {
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Advocate{}).Where("status = ?", 1)
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var advocates []models.Advocate
	query.Preload("Category").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&advocates)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{"list": advocates, "total": total, "page": page},
	})
}

func GetAdvocateDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var advocate models.Advocate
	if err := utils.DB.Preload("Category").First(&advocate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "不存在"})
		return
	}

	utils.DB.Model(&advocate).Update("views", advocate.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": advocate})
}

func CreateAdvocateCategory(c *gin.Context) {
	var cat models.AdvocateCategory
	if err := c.ShouldBindJSON(&cat); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}
	utils.DB.Create(&cat)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": cat})
}

func UpdateAdvocateCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var cat models.AdvocateCategory
	if err := utils.DB.First(&cat, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "不存在"})
		return
	}
	c.ShouldBindJSON(&cat)
	utils.DB.Save(&cat)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": cat})
}

func DeleteAdvocateCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.AdvocateCategory{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AdminGetAdvocateList(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Advocate{})
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var advocates []models.Advocate
	query.Preload("Category").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&advocates)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": advocates, "total": total}})
}

func CreateAdvocate(c *gin.Context) {
	var advocate models.Advocate
	if err := c.ShouldBindJSON(&advocate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}
	advocate.CreatedBy = c.GetUint("user_id")
	utils.DB.Create(&advocate)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": advocate})
}

func UpdateAdvocate(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var advocate models.Advocate
	if err := utils.DB.First(&advocate, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "不存在"})
		return
	}
	c.ShouldBindJSON(&advocate)
	utils.DB.Save(&advocate)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": advocate})
}

func DeleteAdvocate(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.Advocate{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
