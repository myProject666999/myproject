package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	RealName string `json:"real_name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Roles    []uint `json:"roles"`
}

type UpdateUserRequest struct {
	Password string `json:"password"`
	RealName string `json:"real_name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
	Status   *int   `json:"status"`
	Roles    []uint `json:"roles"`
}

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var users []model.User
	var total int64

	query := config.DB.Model(&model.User{})
	if keyword != "" {
		query = query.Where("username LIKE ? OR real_name LIKE ? OR phone LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Preload("Roles").Offset(offset).Limit(pageSize).Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"list":     users,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := config.DB.Preload("Roles").First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
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

	var count int64
	config.DB.Model(&model.User{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名已存在"})
		return
	}

	user := model.User{
		Username: req.Username,
		Password: req.Password,
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
		Status:   1,
	}

	tx := config.DB.Begin()
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户失败"})
		return
	}

	for _, roleID := range req.Roles {
		tx.Create(&model.UserRole{UserID: user.ID, RoleID: roleID})
	}

	tx.Commit()
	c.JSON(http.StatusOK, user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user model.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	tx := config.DB.Begin()

	if req.RealName != "" {
		user.RealName = req.RealName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Status != nil {
		user.Status = *req.Status
	}

	if req.Password != "" {
		user.Password = req.Password
	}

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新用户失败"})
		return
	}

	if req.Roles != nil {
		tx.Where("user_id = ?", user.ID).Delete(&model.UserRole{})
		for _, roleID := range req.Roles {
			tx.Create(&model.UserRole{UserID: user.ID, RoleID: roleID})
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user model.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	tx := config.DB.Begin()
	tx.Where("user_id = ?", id).Delete(&model.UserRole{})
	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除用户失败"})
		return
	}
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetDoctors(c *gin.Context) {
	var doctors []model.User

	var doctorRole model.Role
	config.DB.Where("name = ?", "doctor").First(&doctorRole)

	if doctorRole.ID > 0 {
		var userRoles []model.UserRole
		config.DB.Where("role_id = ?", doctorRole.ID).Find(&userRoles)

		userIDs := make([]uint, len(userRoles))
		for i, ur := range userRoles {
			userIDs[i] = ur.UserID
		}

		if len(userIDs) > 0 {
			config.DB.Where("id IN ?", userIDs).Find(&doctors)
		}
	}

	c.JSON(http.StatusOK, doctors)
}

func GetPatients(c *gin.Context) {
	var patients []model.User

	var patientRole model.Role
	config.DB.Where("name = ?", "patient").First(&patientRole)

	if patientRole.ID > 0 {
		var userRoles []model.UserRole
		config.DB.Where("role_id = ?", patientRole.ID).Find(&userRoles)

		userIDs := make([]uint, len(userRoles))
		for i, ur := range userRoles {
			userIDs[i] = ur.UserID
		}

		if len(userIDs) > 0 {
			config.DB.Where("id IN ?", userIDs).Find(&patients)
		}
	}

	c.JSON(http.StatusOK, patients)
}
