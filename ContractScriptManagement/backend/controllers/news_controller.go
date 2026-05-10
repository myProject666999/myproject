package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var news []models.News
	var total int64

	query := config.DB.Model(&models.News{}).Where("status = 1")

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&news)

	utils.Success(c, gin.H{
		"list":      news,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var news []models.News
	var total int64

	config.DB.Model(&models.News{}).Count(&total)
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&news)

	utils.Success(c, gin.H{
		"list":      news,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateNews(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
		Author  string `json:"author"`
		Cover   string `json:"cover"`
		Status  int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	news := models.News{
		Title:   req.Title,
		Content: req.Content,
		Author:  req.Author,
		Cover:   req.Cover,
		Status:  req.Status,
	}

	if err := config.DB.Create(&news).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, news)
}

func GetNewsDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	config.DB.Model(&news).UpdateColumn("views", news.Views+1)

	utils.Success(c, news)
}

func UpdateNews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	var req map[string]interface{}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if v, exists := req["title"]; exists && v != nil {
		news.Title = v.(string)
	}
	if v, exists := req["content"]; exists && v != nil {
		news.Content = v.(string)
	}
	if v, exists := req["author"]; exists && v != nil {
		news.Author = v.(string)
	}
	if v, exists := req["cover"]; exists && v != nil {
		news.Cover = v.(string)
	}
	if v, exists := req["status"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			news.Status = int(val)
		case int:
			news.Status = val
		case bool:
			if val {
				news.Status = 1
			} else {
				news.Status = 0
			}
		}
	}

	if err := config.DB.Save(&news).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, news)
}

func DeleteNews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.News{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
