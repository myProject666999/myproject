package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetKnowledgeList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")
	onlyPublished := c.Query("only_published")

	var knowledge []models.Knowledge
	var total int64

	query := database.DB.Model(&models.Knowledge{})
	if keyword != "" {
		query = query.Where("title LIKE ? OR summary LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if onlyPublished == "1" {
		query = query.Where("status = 1")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&knowledge)

	utils.SuccessPage(c, knowledge, total, page, pageSize)
}

func GetKnowledgeDetail(c *gin.Context) {
	id := c.Param("id")

	var knowledge models.Knowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		utils.Error(c, 404, "知识不存在")
		return
	}

	knowledge.Views++
	database.DB.Save(&knowledge)

	utils.Success(c, knowledge)
}

func CreateKnowledge(c *gin.Context) {
	var req struct {
		Title          string `json:"title" binding:"required"`
		Category       string `json:"category"`
		Summary        string `json:"summary"`
		Content        string `json:"content"`
		Attachment     string `json:"attachment"`
		AttachmentName string `json:"attachment_name"`
		Author         string `json:"author"`
		Status         int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	knowledge := models.Knowledge{
		Title:          req.Title,
		Category:       req.Category,
		Summary:        req.Summary,
		Content:        req.Content,
		Attachment:     req.Attachment,
		AttachmentName: req.AttachmentName,
		Author:         req.Author,
		Status:         req.Status,
	}

	if err := database.DB.Create(&knowledge).Error; err != nil {
		utils.Error(c, 500, "创建失败")
		return
	}

	utils.Success(c, knowledge)
}

func UpdateKnowledge(c *gin.Context) {
	id := c.Param("id")

	var knowledge models.Knowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		utils.Error(c, 404, "知识不存在")
		return
	}

	var req struct {
		Title          string `json:"title"`
		Category       string `json:"category"`
		Summary        string `json:"summary"`
		Content        string `json:"content"`
		Attachment     string `json:"attachment"`
		AttachmentName string `json:"attachment_name"`
		Author         string `json:"author"`
		Status         int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	if req.Title != "" {
		knowledge.Title = req.Title
	}
	knowledge.Category = req.Category
	knowledge.Summary = req.Summary
	knowledge.Content = req.Content
	if req.Attachment != "" {
		knowledge.Attachment = req.Attachment
	}
	if req.AttachmentName != "" {
		knowledge.AttachmentName = req.AttachmentName
	}
	knowledge.Author = req.Author
	knowledge.Status = req.Status

	database.DB.Save(&knowledge)
	utils.Success(c, knowledge)
}

func DeleteKnowledge(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Knowledge{}, id).Error; err != nil {
		utils.Error(c, 500, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func DownloadAttachment(c *gin.Context) {
	id := c.Param("id")

	var knowledge models.Knowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		utils.Error(c, 404, "知识不存在")
		return
	}

	if knowledge.Attachment == "" {
		utils.Error(c, 400, "没有附件")
		return
	}

	filename := knowledge.Attachment
	if knowledge.AttachmentName != "" {
		filename = knowledge.AttachmentName
	}

	ext := filepath.Ext(filename)
	if ext == "" {
		ext = ".pdf"
	}

	if !strings.HasSuffix(filename, ext) {
		filename = filename + ext
	}

	c.FileAttachment(knowledge.Attachment, filename)
}

func GetKnowledgeCategories(c *gin.Context) {
	var categories []string
	database.DB.Model(&models.Knowledge{}).Distinct("category").Where("category != ''").Pluck("category", &categories)
	utils.Success(c, categories)
}
