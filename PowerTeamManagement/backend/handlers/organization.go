package handlers

import (
	"net/http"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateOrganizationRequest struct {
	Name     string `json:"name" binding:"required"`
	ParentID *uint  `json:"parent_id"`
}

type AssignUsersRequest struct {
	UserIDs []uint `json:"user_ids"`
}

func GetOrganizations(c *gin.Context) {
	var orgs []models.Organization
	database.DB.Where("parent_id IS NULL").Preload("Children.Children").Preload("Users").Find(&orgs)
	c.JSON(http.StatusOK, orgs)
}

func GetOrganization(c *gin.Context) {
	id := c.Param("id")

	var org models.Organization
	if err := database.DB.Preload("Parent").Preload("Children.Children").Preload("Users.Role").First(&org, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	c.JSON(http.StatusOK, org)
}

func CreateOrganization(c *gin.Context) {
	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org := models.Organization{
		Name:     req.Name,
		ParentID: req.ParentID,
	}

	if err := database.DB.Create(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
		return
	}

	c.JSON(http.StatusCreated, org)
}

func UpdateOrganization(c *gin.Context) {
	id := c.Param("id")

	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	if req.ParentID != nil && *req.ParentID == org.ID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot set parent to self"})
		return
	}

	org.Name = req.Name
	org.ParentID = req.ParentID

	if err := database.DB.Save(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update organization"})
		return
	}

	c.JSON(http.StatusOK, org)
}

func DeleteOrganization(c *gin.Context) {
	id := c.Param("id")

	var org models.Organization
	if err := database.DB.First(&org, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	var childCount int64
	database.DB.Model(&models.Organization{}).Where("parent_id = ?", id).Count(&childCount)
	if childCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete organization with children"})
		return
	}

	var userCount int64
	database.DB.Model(&models.User{}).Where("organization_id = ?", id).Count(&userCount)
	if userCount > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete organization with assigned users"})
		return
	}

	if err := database.DB.Delete(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete organization"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Organization deleted successfully"})
}

func AssignUsersToOrganization(c *gin.Context) {
	id := c.Param("id")

	var req AssignUsersRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var org models.Organization
	if err := database.DB.First(&org, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		return
	}

	orgID := org.ID
	if err := database.DB.Model(&models.User{}).Where("id IN ?", req.UserIDs).Update("organization_id", orgID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Users assigned successfully"})
}

func GetOrganizationUsers(c *gin.Context) {
	id := c.Param("id")

	var users []models.User
	database.DB.Preload("Role").Where("organization_id = ?", id).Find(&users)

	c.JSON(http.StatusOK, users)
}
