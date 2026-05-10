package handlers

import (
	"net/http"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateMenuRequest struct {
	Name     string `json:"name" binding:"required"`
	Path     string `json:"path"`
	Icon     string `json:"icon"`
	ParentID *uint  `json:"parent_id"`
	Sort     int    `json:"sort"`
}

func GetMenus(c *gin.Context) {
	var menus []models.Menu
	database.DB.Preload("Children").Where("parent_id IS NULL").Order("sort").Find(&menus)
	c.JSON(http.StatusOK, menus)
}

func GetAllMenus(c *gin.Context) {
	var menus []models.Menu
	database.DB.Order("sort").Find(&menus)
	c.JSON(http.StatusOK, menus)
}

func GetMenu(c *gin.Context) {
	id := c.Param("id")

	var menu models.Menu
	if err := database.DB.Preload("Parent").Preload("Children").First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func CreateMenu(c *gin.Context) {
	var req CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	menu := models.Menu{
		Name:     req.Name,
		Path:     req.Path,
		Icon:     req.Icon,
		ParentID: req.ParentID,
		Sort:     req.Sort,
	}

	if err := database.DB.Create(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create menu"})
		return
	}

	c.JSON(http.StatusCreated, menu)
}

func UpdateMenu(c *gin.Context) {
	id := c.Param("id")

	var req CreateMenuRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found"})
		return
	}

	menu.Name = req.Name
	menu.Path = req.Path
	menu.Icon = req.Icon
	menu.ParentID = req.ParentID
	menu.Sort = req.Sort

	if err := database.DB.Save(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update menu"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func DeleteMenu(c *gin.Context) {
	id := c.Param("id")

	var menu models.Menu
	if err := database.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Menu not found"})
		return
	}

	var childCount int64
	database.DB.Model(&models.Menu{}).Where("parent_id = ?", id).Count(&childCount)
	if childCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete menu with children"})
		return
	}

	if err := database.DB.Delete(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete menu"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Menu deleted successfully"})
}
