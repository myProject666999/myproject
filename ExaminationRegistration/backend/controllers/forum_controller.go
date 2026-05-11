package controllers

import (
	"strconv"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func GetPostList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")

	offset := (page - 1) * pageSize

	var posts []models.ForumPost
	var total int64

	query := database.DB.Model(&models.ForumPost{}).Where("status = ?", 1)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&posts)

	utils.Success(c, gin.H{
		"list":      posts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetPostDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var post models.ForumPost
	if result := database.DB.First(&post, id); result.Error != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	database.DB.Model(&post).Update("view_count", post.ViewCount+1)

	utils.Success(c, post)
}

func CreatePost(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Title    string `json:"title" binding:"required"`
		Content  string `json:"content" binding:"required"`
		Category string `json:"category"`
		Image    string `json:"image"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	post := models.ForumPost{
		UserID:   userID,
		Title:    req.Title,
		Content:  req.Content,
		Category: req.Category,
		Image:    req.Image,
	}

	if result := database.DB.Create(&post); result.Error != nil {
		utils.InternalError(c, "发布失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "发布成功", post)
}

func GetMyPosts(c *gin.Context) {
	userID := c.GetUint("user_id")

	var posts []models.ForumPost
	database.DB.Where("user_id = ?", userID).Order("id DESC").Find(&posts)

	utils.Success(c, posts)
}

func AdminGetPostList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var posts []models.ForumPost
	var total int64

	query := database.DB.Model(&models.ForumPost{})
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&posts)

	utils.Success(c, gin.H{
		"list":      posts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminUpdatePost(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var post models.ForumPost
	if result := database.DB.First(&post, id); result.Error != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	if err := c.ShouldBindJSON(&post); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	database.DB.Save(&post)
	utils.SuccessWithMessage(c, "更新成功", post)
}

func AdminDeletePost(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.ForumPost{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
