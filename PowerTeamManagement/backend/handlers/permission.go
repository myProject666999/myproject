package handlers

import (
	"net/http"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreatePermissionRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
	MenuID      *uint  `json:"menu_id"`
}

func GetPermissions(c *gin.Context) {
	var permissions []models.Permission
	database.DB.Preload("Menu").Find(&permissions)
	c.JSON(http.StatusOK, permissions)
}

func GetPermission(c *gin.Context) {
	id := c.Param("id")

	var permission models.Permission
	if err := database.DB.Preload("Menu").First(&permission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Permission not found"})
		return
	}

	c.JSON(http.StatusOK, permission)
}

func CreatePermission(c *gin.Context) {
	var req CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	permission := models.Permission{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		MenuID:      req.MenuID,
	}

	if err := database.DB.Create(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create permission"})
		return
	}

	c.JSON(http.StatusCreated, permission)
}

func UpdatePermission(c *gin.Context) {
	id := c.Param("id")

	var req CreatePermissionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var permission models.Permission
	if err := database.DB.First(&permission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Permission not found"})
		return
	}

	permission.Name = req.Name
	permission.Code = req.Code
	permission.Description = req.Description
	permission.MenuID = req.MenuID

	if err := database.DB.Save(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update permission"})
		return
	}

	c.JSON(http.StatusOK, permission)
}

func DeletePermission(c *gin.Context) {
	id := c.Param("id")

	var permission models.Permission
	if err := database.DB.First(&permission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Permission not found"})
		return
	}

	if err := database.DB.Delete(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete permission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permission deleted successfully"})
}
