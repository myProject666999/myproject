package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"portfolio/database"
	"portfolio/models"
)

func GetProjects(c *gin.Context) {
	category := c.Query("category")
	search := c.Query("search")
	featured := c.Query("featured")
	limit := c.DefaultQuery("limit", "0")
	offset := c.DefaultQuery("offset", "0")

	db := database.DB.Model(&models.Project{}).Preload("Category").Where("published = ?", true)

	if category != "" {
		db = db.Joins("JOIN categories ON categories.id = projects.category_id").
			Where("categories.slug = ?", category)
	}

	if search != "" {
		db = db.Where("title LIKE ? OR description LIKE ? OR tags LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if featured == "true" {
		db = db.Where("featured = ?", true)
	}

	var total int64
	db.Count(&total)

	limitInt, _ := strconv.Atoi(limit)
	offsetInt, _ := strconv.Atoi(offset)

	if limitInt > 0 {
		db = db.Limit(limitInt).Offset(offsetInt)
	}

	var projects []models.Project
	db.Order("created_at DESC").Find(&projects)

	c.JSON(http.StatusOK, gin.H{
		"data":  projects,
		"total": total,
	})
}

func GetAllProjects(c *gin.Context) {
	var projects []models.Project
	database.DB.Preload("Category").Order("created_at DESC").Find(&projects)
	c.JSON(http.StatusOK, projects)
}

func GetProject(c *gin.Context) {
	slug := c.Param("slug")

	var project models.Project
	if err := database.DB.Preload("Category").Where("slug = ?", slug).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	database.DB.Model(&project).Update("views", project.Views+1)

	c.JSON(http.StatusOK, project)
}

func CreateProject(c *gin.Context) {
	var project models.Project
	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if project.Slug == "" {
		project.Slug = generateSlug(project.Title)
	}

	if err := database.DB.Create(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, project)
}

func UpdateProject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var project models.Project
	if err := database.DB.First(&project, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
		return
	}

	if err := c.ShouldBindJSON(&project); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, project)
}

func DeleteProject(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := database.DB.Delete(&models.Project{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = strings.ReplaceAll(slug, "_", "-")
	slug = slug + "-" + uuid.New().String()[:8]
	return slug
}
