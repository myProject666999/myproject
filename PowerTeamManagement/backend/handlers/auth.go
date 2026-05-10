package handlers

import (
	"net/http"

	"power-team-management/config"
	"power-team-management/database"
	"power-team-management/models"
	"power-team-management/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username       string `json:"username" binding:"required"`
	Password       string `json:"password" binding:"required"`
	RealName       string `json:"real_name" binding:"required"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	RoleID         uint   `json:"role_id" binding:"required"`
	OrganizationID *uint  `json:"organization_id"`
}

func Login(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
			return
		}

		var user models.User
		if err := database.DB.Preload("Role").Where("username = ?", req.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
			return
		}

		token, err := utils.GenerateToken(user.ID, user.Username, user.Role.Code, cfg)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user": gin.H{
				"id":        user.ID,
				"username":  user.Username,
				"real_name": user.RealName,
				"email":     user.Email,
				"phone":     user.Phone,
				"role":      user.Role,
			},
		})
	}
}

func GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var user models.User
	if err := database.DB.Preload("Role").Preload("Organization").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":               user.ID,
		"username":         user.Username,
		"real_name":        user.RealName,
		"email":            user.Email,
		"phone":            user.Phone,
		"role_id":          user.RoleID,
		"role":             user.Role,
		"organization_id":  user.OrganizationID,
		"organization":     user.Organization,
	})
}

func GetUserMenus(c *gin.Context) {
	var menus []models.Menu
	database.DB.Where("parent_id IS NULL OR parent_id = 0").Order("sort").Find(&menus)

	for i := range menus {
		var children []models.Menu
		database.DB.Where("parent_id = ?", menus[i].ID).Order("sort").Find(&children)
		menus[i].Children = children
	}

	c.JSON(http.StatusOK, menus)
}

func buildMenuTree(menus []models.Menu) []models.Menu {
	menuMap := make(map[uint]*models.Menu)
	var roots []models.Menu

	for i := range menus {
		menuMap[menus[i].ID] = &menus[i]
	}

	for i := range menus {
		if menus[i].ParentID == nil {
			roots = append(roots, menus[i])
		} else {
			if parent, exists := menuMap[*menus[i].ParentID]; exists {
				parent.Children = append(parent.Children, menus[i])
			}
		}
	}

	return roots
}
