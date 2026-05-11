package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetRewards(c *gin.Context) {
	var pageInfo PageInfo
	if err := c.ShouldBindQuery(&pageInfo); err != nil {
		pageInfo.Page = 1
		pageInfo.PageSize = 10
	}
	
	if pageInfo.Page <= 0 {
		pageInfo.Page = 1
	}
	if pageInfo.PageSize <= 0 {
		pageInfo.PageSize = 10
	}
	
	query := config.DB.Model(&models.RewardPunishment{})
	
	if studentNo := c.Query("student_no"); studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if studentName := c.Query("student_name"); studentName != "" {
		query = query.Where("student_name LIKE ?", "%"+studentName+"%")
	}
	if rewardType := c.Query("type"); rewardType != "" {
		query = query.Where("type = ?", rewardType)
	}
	if title := c.Query("title"); title != "" {
		query = query.Where("title LIKE ?", "%"+title+"%")
	}
	if level := c.Query("level"); level != "" {
		query = query.Where("level = ?", level)
	}
	
	var total int64
	query.Count(&total)
	
	var rewards []models.RewardPunishment
	query.Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&rewards)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": rewards,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetReward(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var reward models.RewardPunishment
	if err := config.DB.First(&reward, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "奖惩记录不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": reward})
}

func CreateReward(c *gin.Context) {
	var reward models.RewardPunishment
	if err := c.ShouldBindJSON(&reward); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Create(&reward).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": reward})
}

func UpdateReward(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var reward models.RewardPunishment
	if err := config.DB.First(&reward, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "奖惩记录不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&reward); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&reward).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": reward})
}

func DeleteReward(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.RewardPunishment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
