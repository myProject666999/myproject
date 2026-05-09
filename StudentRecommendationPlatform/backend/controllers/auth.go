package controllers

import (
	"net/http"
	"strconv"

	"student-recommendation-platform/config"
	"student-recommendation-platform/middleware"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func AdminLogin(c *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var admin models.Admin
	if err := config.DB.Where("username = ?", loginData.Username).First(&admin).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if admin.Password != loginData.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	token, err := middleware.GenerateToken(admin.ID, admin.Username, "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"token": token,
			"user":  admin,
		},
	})
}

func AdminLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "退出成功"})
}

func GetAdminProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": admin})
}

func ChangeAdminPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var admin models.Admin
	if err := config.DB.First(&admin, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if admin.Password != data.OldPassword {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	admin.Password = data.NewPassword
	config.DB.Save(&admin)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}

func UserRegister(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var existing models.User
	if err := config.DB.Where("username = ?", user.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	user.Status = 1
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "注册失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "注册成功", "data": user})
}

func UserLogin(c *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var user models.User
	if err := config.DB.Where("username = ?", loginData.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if user.Password != loginData.Password {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if user.Status != 1 {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "账号未审核或已禁用"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username, "user")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"token": token,
			"user":  user,
		},
	})
}

func UserLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "退出成功"})
}

func GetUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": user})
}

func UpdateUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if data.Nickname != "" {
		user.Nickname = data.Nickname
	}
	if data.Email != "" {
		user.Email = data.Email
	}
	if data.Phone != "" {
		user.Phone = data.Phone
	}
	if data.Avatar != "" {
		user.Avatar = data.Avatar
	}

	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func ListAdminUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var total int64
	var admins []models.Admin

	config.DB.Model(&models.Admin{}).Count(&total)
	config.DB.Offset(offset).Limit(pageSize).Find(&admins)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      admins,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func CreateAdminUser(c *gin.Context) {
	var admin models.Admin
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var existing models.Admin
	if err := config.DB.Where("username = ?", admin.Username).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": admin})
}

func UpdateAdminUser(c *gin.Context) {
	id := c.Param("id")

	var data struct {
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var admin models.Admin
	if err := config.DB.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if data.Name != "" {
		admin.Name = data.Name
	}
	if data.Password != "" {
		admin.Password = data.Password
	}

	config.DB.Save(&admin)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": admin})
}

func DeleteAdminUser(c *gin.Context) {
	id := c.Param("id")

	if id == "1" {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "不能删除超级管理员"})
		return
	}

	if err := config.DB.Delete(&models.Admin{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
