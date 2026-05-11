package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetAllPermissions(c *gin.Context) {
	var permissions []models.Permission
	config.DB.Order("role, module").Find(&permissions)
	
	result := make(map[string][]models.Permission)
	for _, p := range permissions {
		result[p.Role] = append(result[p.Role], p)
	}
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": result,
	})
}

func GetRolePermissions(c *gin.Context) {
	role := c.Param("role")
	
	var permissions []models.Permission
	config.DB.Where("role = ?", role).Find(&permissions)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": permissions,
	})
}

func UpdatePermission(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var permission models.Permission
	if err := config.DB.First(&permission, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "权限记录不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&permission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if err := config.DB.Save(&permission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": permission})
}

func BatchUpdatePermissions(c *gin.Context) {
	var req struct {
		Role        string `json:"role"`
		Permissions []struct {
			Module    string `json:"module"`
			CanView   bool   `json:"can_view"`
			CanCreate bool   `json:"can_create"`
			CanUpdate bool   `json:"can_update"`
			CanDelete bool   `json:"can_delete"`
		} `json:"permissions"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	for _, p := range req.Permissions {
		config.DB.Where("role = ? AND module = ?", req.Role, p.Module).
			Assign(models.Permission{
				CanView:   p.CanView,
				CanCreate: p.CanCreate,
				CanUpdate: p.CanUpdate,
				CanDelete: p.CanDelete,
			}).
			FirstOrCreate(&models.Permission{})
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "批量更新成功"})
}
