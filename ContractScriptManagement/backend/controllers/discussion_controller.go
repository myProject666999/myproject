package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetDiscussions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	scriptID := c.Query("script_id")

	var discussions []models.Discussion
	var total int64

	query := config.DB.Model(&models.Discussion{}).Preload("User").Preload("Script")
	if scriptID != "" {
		query = query.Where("script_id = ?", scriptID)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&discussions)

	utils.Success(c, gin.H{
		"list":      discussions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetMyDiscussions(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var discussions []models.Discussion
	var total int64

	query := config.DB.Model(&models.Discussion{}).Preload("User").Preload("Script").Where("user_id = ?", userID)

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&discussions)

	utils.Success(c, gin.H{
		"list":      discussions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateDiscussion(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Title    string `json:"title" binding:"required"`
		Content  string `json:"content" binding:"required"`
		ScriptID uint   `json:"script_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	discussion := models.Discussion{
		Title:    req.Title,
		Content:  req.Content,
		UserID:   userID,
		ScriptID: req.ScriptID,
	}

	if err := config.DB.Create(&discussion).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, discussion)
}

func GetDiscussion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var discussion models.Discussion
	if err := config.DB.Preload("User").Preload("Script").First(&discussion, id).Error; err != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	config.DB.Model(&discussion).UpdateColumn("views", discussion.Views+1)

	utils.Success(c, discussion)
}

func UpdateDiscussion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var discussion models.Discussion
	if err := config.DB.First(&discussion, id).Error; err != nil {
		utils.NotFound(c, "帖子不存在")
		return
	}

	var req struct {
		Title    string `json:"title"`
		Content  string `json:"content"`
		ScriptID uint   `json:"script_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Title != "" {
		discussion.Title = req.Title
	}
	if req.Content != "" {
		discussion.Content = req.Content
	}
	discussion.ScriptID = req.ScriptID

	if err := config.DB.Save(&discussion).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, discussion)
}

func DeleteDiscussion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.Discussion{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
