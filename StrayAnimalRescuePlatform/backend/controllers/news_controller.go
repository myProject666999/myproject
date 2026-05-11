package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetNewsList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	db := config.GetDB()
	var total int
	db.Model(&models.News{}).Where("status = ?", 1).Count(&total)

	var news []models.News
	db.Where("status = ?", 1).Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&news)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      news,
	})
}

func GetNews(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var news models.News
	db := config.GetDB()
	if err := db.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	db.Model(&news).UpdateColumn("views", news.Views+1)

	utils.Success(c, news)
}

func CreateNews(c *gin.Context) {
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&news).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, news)
}

func UpdateNews(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var news models.News
	db := config.GetDB()
	if err := db.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	if err := c.ShouldBindJSON(&news); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&news)
	utils.Success(c, news)
}

func DeleteNews(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.News{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
