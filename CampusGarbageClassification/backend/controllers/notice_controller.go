package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetNoticeList(c *gin.Context) {
	category := c.Query("category")
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Notice{}).Where("status = ?", 1)
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var notices []models.Notice
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&notices)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  notices,
			"total": total,
			"page":  page,
			"page_size": pageSize,
		},
	})
}

func GetNoticeDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var notice models.Notice
	if err := utils.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": notice})
}

func AdminGetNoticeList(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Notice{})
	if keyword != "" {
		query = query.Where("title LIKE ? OR category LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var notices []models.Notice
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&notices)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":  notices,
			"total": total,
		},
	})
}

func CreateNotice(c *gin.Context) {
	var notice models.Notice
	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	notice.CreatedBy = c.GetUint("user_id")
	if err := utils.DB.Create(&notice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": notice})
}

func UpdateNotice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var notice models.Notice
	if err := utils.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	utils.DB.Save(&notice)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": notice})
}

func DeleteNotice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := utils.DB.Delete(&models.Notice{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
