package handlers

import (
	"net/http"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Description string `json:"description"`
}

func GetRoles(c *gin.Context) {
	var roles []models.RoleModel
	database.DB.Preload("Menus").Preload("Permissions").Find(&roles)
	c.JSON(http.StatusOK, roles)
}

func GetRole(c *gin.Context) {
	id := c.Param("id")

	var role models.RoleModel
	if err := database.DB.Preload("Menus").Preload("Permissions").First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	c.JSON(http.StatusOK, role)
}

func CreateRole(c *gin.Context) {
	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := models.RoleModel{
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
	}

	if err := database.DB.Create(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create role"})
		return
	}

	c.JSON(http.StatusCreated, role)
}

func UpdateRole(c *gin.Context) {
	id := c.Param("id")

	var req CreateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var role models.RoleModel
	if err := database.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	role.Name = req.Name
	role.Code = req.Code
	role.Description = req.Description

	if err := database.DB.Save(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role"})
		return
	}

	c.JSON(http.StatusOK, role)
}

func DeleteRole(c *gin.Context) {
	id := c.Param("id")

	var role models.RoleModel
	if err := database.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	var userCount int64
	database.DB.Model(&models.User{}).Where("role_id = ?", id).Count(&userCount)
	if userCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete role with assigned users"})
		return
	}

	if err := database.DB.Delete(&role).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete role"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Role deleted successfully"})
}

type AssignMenusRequest struct {
	MenuIDs []uint `json:"menu_ids"`
}

func AssignRoleMenus(c *gin.Context) {
	id := c.Param("id")

	var req AssignMenusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var role models.RoleModel
	if err := database.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	var menus []models.Menu
	if len(req.MenuIDs) > 0 {
		database.DB.Find(&menus, req.MenuIDs)
	}

	if err := database.DB.Model(&role).Association("Menus").Replace(&menus); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign menus"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Menus assigned successfully"})
}

type AssignPermissionsRequest struct {
	PermissionIDs []uint `json:"permission_ids"`
}

func AssignRolePermissions(c *gin.Context) {
	id := c.Param("id")

	var req AssignPermissionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var role models.RoleModel
	if err := database.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Role not found"})
		return
	}

	var permissions []models.Permission
	if len(req.PermissionIDs) > 0 {
		database.DB.Find(&permissions, req.PermissionIDs)
	}

	if err := database.DB.Model(&role).Association("Permissions").Replace(&permissions); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign permissions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Permissions assigned successfully"})
}
