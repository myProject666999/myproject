package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"

	"github.com/gin-gonic/gin"
)

func GetCommunities(c *gin.Context) {
	communityNo := c.Query("community_no")
	var communities []models.Community
	query := database.DB

	if communityNo != "" {
		query = query.Where("community_no LIKE ?", "%"+communityNo+"%")
	}

	query.Find(&communities)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": communities})
}

func GetCommunity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var community models.Community
	if err := database.DB.First(&community, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "社区区域不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": community})
}

func CreateCommunity(c *gin.Context) {
	var community models.Community
	if err := c.ShouldBindJSON(&community); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	if err := database.DB.Create(&community).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "社区区域编号已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": community})
}

func UpdateCommunity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var community models.Community
	if err := database.DB.First(&community, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "社区区域不存在"})
		return
	}

	var input models.Community
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	database.DB.Model(&community).Updates(input)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": community})
}

func DeleteCommunity(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.Community{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
