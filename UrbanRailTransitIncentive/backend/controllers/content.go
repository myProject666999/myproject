package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetBannerList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var banners []models.Banner
	var total int64

	database.DB.Model(&models.Banner{}).Count(&total)
	offset := (page - 1) * pageSize
	database.DB.Offset(offset).Limit(pageSize).Order("sort_order ASC, id DESC").Find(&banners)

	utils.Success(c, gin.H{
		"list":      banners,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetBannerDetail(c *gin.Context) {
	id := c.Param("id")
	var banner models.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}
	utils.Success(c, banner)
}

type CreateBannerRequest struct {
	Title     string `json:"title" binding:"required"`
	ImageURL  string `json:"image_url" binding:"required"`
	Link      string `json:"link"`
	SortOrder int    `json:"sort_order"`
	Status    int    `json:"status"`
}

func CreateBanner(c *gin.Context) {
	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	banner := models.Banner{
		Title:     req.Title,
		ImageURL:  req.ImageURL,
		Link:      req.Link,
		SortOrder: req.SortOrder,
		Status:    req.Status,
	}

	if err := database.DB.Create(&banner).Error; err != nil {
		utils.InternalServerError(c, "创建轮播图失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", banner)
}

func UpdateBanner(c *gin.Context) {
	id := c.Param("id")
	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var banner models.Banner
	if err := database.DB.First(&banner, id).Error; err != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	if err := database.DB.Model(&banner).Updates(models.Banner{
		Title:     req.Title,
		ImageURL:  req.ImageURL,
		Link:      req.Link,
		SortOrder: req.SortOrder,
		Status:    req.Status,
	}).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", banner)
}

func DeleteBanner(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Banner{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetAnnouncementList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var announcements []models.Announcement
	var total int64

	database.DB.Model(&models.Announcement{}).Count(&total)
	offset := (page - 1) * pageSize
	database.DB.Offset(offset).Limit(pageSize).Order("is_top DESC, id DESC").Find(&announcements)

	utils.Success(c, gin.H{
		"list":      announcements,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAnnouncementDetail(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement
	if err := database.DB.First(&announcement, id).Error; err != nil {
		utils.NotFound(c, "公告不存在")
		return
	}
	utils.Success(c, announcement)
}

type CreateAnnouncementRequest struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
	Author  string `json:"author"`
	Status  int    `json:"status"`
	IsTop   int    `json:"is_top"`
}

func CreateAnnouncement(c *gin.Context) {
	var req CreateAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	announcement := models.Announcement{
		Title:   req.Title,
		Content: req.Content,
		Author:  req.Author,
		Status:  req.Status,
		IsTop:   req.IsTop,
	}

	if err := database.DB.Create(&announcement).Error; err != nil {
		utils.InternalServerError(c, "创建公告失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", announcement)
}

func UpdateAnnouncement(c *gin.Context) {
	id := c.Param("id")
	var req CreateAnnouncementRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var announcement models.Announcement
	if err := database.DB.First(&announcement, id).Error; err != nil {
		utils.NotFound(c, "公告不存在")
		return
	}

	if err := database.DB.Model(&announcement).Updates(models.Announcement{
		Title:   req.Title,
		Content: req.Content,
		Author:  req.Author,
		Status:  req.Status,
		IsTop:   req.IsTop,
	}).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", announcement)
}

func DeleteAnnouncement(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Announcement{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
