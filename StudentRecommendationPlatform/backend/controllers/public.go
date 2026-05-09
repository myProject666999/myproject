package controllers

import (
	"net/http"
	"strconv"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func ListCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Where("status = 1").Order("sort ASC").Find(&carousels)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": carousels})
}

func ListNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var total int64
	var news []models.News

	config.DB.Model(&models.News{}).Count(&total)
	config.DB.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&news)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      news,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "新闻不存在"})
		return
	}

	config.DB.Model(&news).UpdateColumn("views", news.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": news})
}

func ListNotices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var total int64
	var notices []models.Notice

	config.DB.Model(&models.Notice{}).Count(&total)
	config.DB.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&notices)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      notices,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetNotice(c *gin.Context) {
	id := c.Param("id")

	var notice models.Notice
	if err := config.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	config.DB.Model(&notice).UpdateColumn("views", notice.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": notice})
}

func ListCampusStories(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var total int64
	var stories []models.CampusStory

	config.DB.Model(&models.CampusStory{}).Count(&total)
	config.DB.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&stories)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      stories,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ListCategories(c *gin.Context) {
	var categories []models.Category
	config.DB.Find(&categories)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": categories})
}

func ListAdminNews(c *gin.Context) {
	ListNews(c)
}

func CreateNews(c *gin.Context) {
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": news})
}

func UpdateNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := config.DB.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "新闻不存在"})
		return
	}

	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&news)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": news})
}

func DeleteNews(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.News{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminNotices(c *gin.Context) {
	ListNotices(c)
}

func CreateNotice(c *gin.Context) {
	var notice models.Notice
	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&notice).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": notice})
}

func UpdateNotice(c *gin.Context) {
	id := c.Param("id")

	var notice models.Notice
	if err := config.DB.First(&notice, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&notice)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": notice})
}

func DeleteNotice(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Notice{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCampusStories(c *gin.Context) {
	ListCampusStories(c)
}

func CreateCampusStory(c *gin.Context) {
	var story models.CampusStory
	if err := c.ShouldBindJSON(&story); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&story).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": story})
}

func UpdateCampusStory(c *gin.Context) {
	id := c.Param("id")

	var story models.CampusStory
	if err := config.DB.First(&story, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "趣事不存在"})
		return
	}

	if err := c.ShouldBindJSON(&story); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&story)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": story})
}

func DeleteCampusStory(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.CampusStory{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCarousels(c *gin.Context) {
	var carousels []models.Carousel
	config.DB.Order("sort ASC").Find(&carousels)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": carousels})
}

func CreateCarousel(c *gin.Context) {
	var carousel models.Carousel
	if err := c.ShouldBindJSON(&carousel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&carousel).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": carousel})
}

func UpdateCarousel(c *gin.Context) {
	id := c.Param("id")

	var carousel models.Carousel
	if err := config.DB.First(&carousel, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "轮播图不存在"})
		return
	}

	if err := c.ShouldBindJSON(&carousel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&carousel)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": carousel})
}

func DeleteCarousel(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Carousel{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCategories(c *gin.Context) {
	ListCategories(c)
}

func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": category})
}

func UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	if err := config.DB.First(&category, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "分类不存在"})
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&category)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": category})
}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Category{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
