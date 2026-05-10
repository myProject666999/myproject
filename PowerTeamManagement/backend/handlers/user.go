package handlers

import (
	"net/http"
	"strconv"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	Username       string `json:"username" binding:"required"`
	Password       string `json:"password" binding:"required"`
	RealName       string `json:"real_name" binding:"required"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	RoleID         uint   `json:"role_id" binding:"required"`
	OrganizationID *uint  `json:"organization_id"`
}

type UpdateUserRequest struct {
	RealName       string `json:"real_name"`
	Email          string `json:"email"`
	Phone          string `json:"phone"`
	RoleID         uint   `json:"role_id"`
	OrganizationID *uint  `json:"organization_id"`
	Password       string `json:"password"`
}

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")

	offset := (page - 1) * pageSize

	var users []models.User
	var total int64

	query := database.DB.Preload("Role").Preload("Organization")

	if search != "" {
		query = query.Where("username LIKE ? OR real_name LIKE ? OR email LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	query.Model(&models.User{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.Preload("Role").Preload("Organization").First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existingUser models.User
	if err := database.DB.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Username:       req.Username,
		Password:       string(hashedPassword),
		RealName:       req.RealName,
		Email:          req.Email,
		Phone:          req.Phone,
		RoleID:         req.RoleID,
		OrganizationID: req.OrganizationID,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	updates := make(map[string]interface{})
	if req.RealName != "" {
		updates["real_name"] = req.RealName
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.RoleID != 0 {
		updates["role_id"] = req.RoleID
	}
	if req.OrganizationID != nil {
		updates["organization_id"] = req.OrganizationID
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		updates["password"] = string(hashedPassword)
	}

	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	database.DB.Preload("Role").Preload("Organization").First(&user, id)
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Username == "admin" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot delete admin user"})
		return
	}

	if err := database.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func GetAllUsers(c *gin.Context) {
	var users []models.User
	database.DB.Preload("Role").Preload("Organization").Find(&users)
	c.JSON(http.StatusOK, users)
}
