package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"display_name"`
	Description string `json:"description"`
	Menus       []uint `json:"menus"`
}

type UpdateRoleRequest struct {
	DisplayName string `json:"display_name"`
	Description string `json:"description"`
	Menus       []uint `json:"menus"`
}

func GetRoles(c *gin.Context) {
	var roles []model.Role
	config.DB.Preload("Menus").Find(&roles)
	c.JSON(http.StatusOK, roles)
}

func GetRole(c *gin.Context) {
	id := c.Param("id")

	var role model.Role
	if err := config.DB.Preload("Menus").First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "角色不存在"})
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

	var count int64
	config.DB.Model(&model.Role{}).Where("name = ?", req.Name).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "角色名已存在"})
		return
	}

	role := model.Role{
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Description: req.Description,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&role).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建角色失败"})
		return
	}

	for _, menuID := range req.Menus {
		tx.Create(&model.RoleMenu{RoleID: role.ID, MenuID: menuID})
	}

	tx.Commit()
	c.JSON(http.StatusOK, role)
}

func UpdateRole(c *gin.Context) {
	id := c.Param("id")

	var req UpdateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var role model.Role
	if err := config.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "角色不存在"})
		return
	}

	tx := config.DB.Begin()

	if req.DisplayName != "" {
		role.DisplayName = req.DisplayName
	}
	if req.Description != "" {
		role.Description = req.Description
	}

	if err := tx.Save(&role).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新角色失败"})
		return
	}

	if req.Menus != nil {
		tx.Where("role_id = ?", role.ID).Delete(&model.RoleMenu{})
		for _, menuID := range req.Menus {
			tx.Create(&model.RoleMenu{RoleID: role.ID, MenuID: menuID})
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, role)
}

func DeleteRole(c *gin.Context) {
	id := c.Param("id")

	var role model.Role
	if err := config.DB.First(&role, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "角色不存在"})
		return
	}

	tx := config.DB.Begin()
	tx.Where("role_id = ?", id).Delete(&model.UserRole{})
	tx.Where("role_id = ?", id).Delete(&model.RoleMenu{})
	if err := tx.Delete(&role).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除角色失败"})
		return
	}
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
