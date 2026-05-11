package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetPosts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	db := config.GetDB()
	query := db.Model(&models.Post{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int
	query.Count(&total)

	var posts []models.Post
	query.Preload("User").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&posts)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      posts,
	})
}

func GetPost(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var post models.Post
	db := config.GetDB()
	if err := db.Preload("User").First(&post, id).Error; err != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	db.Model(&post).UpdateColumn("views", post.Views+1)

	var comments []models.Comment
	db.Preload("User").Where("post_id = ? AND status = ?", id, 1).Order("created_at DESC").Find(&comments)

	utils.Success(c, gin.H{
		"post":     post,
		"comments": comments,
	})
}

func CreatePost(c *gin.Context) {
	userID := c.GetUint("user_id")

	var post models.Post
	if err := c.ShouldBindJSON(&post); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	post.UserID = userID

	db := config.GetDB()
	if err := db.Create(&post).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, post)
}

func UpdatePost(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var post models.Post
	db := config.GetDB()
	if err := db.First(&post, id).Error; err != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	if post.UserID != userID {
		utils.Forbidden(c, "无权修改")
		return
	}

	if err := c.ShouldBindJSON(&post); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&post)
	utils.Success(c, post)
}

func DeletePost(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var post models.Post
	if err := db.First(&post, id).Error; err != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	if post.UserID != userID {
		utils.Forbidden(c, "无权删除")
		return
	}

	db.Delete(&post)
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func CreateComment(c *gin.Context) {
	userID := c.GetUint("user_id")

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	comment.UserID = userID

	db := config.GetDB()
	if err := db.Create(&comment).Error; err != nil {
		utils.InternalServerError(c, "评论失败")
		return
	}

	utils.Success(c, comment)
}

func GetMyPosts(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	db := config.GetDB()
	var total int
	db.Model(&models.Post{}).Where("user_id = ?", userID).Count(&total)

	var posts []models.Post
	db.Where("user_id = ?", userID).Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&posts)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      posts,
	})
}
