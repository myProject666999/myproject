package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Password  string `json:"password" binding:"required,min=6"`
	RealName  string `json:"real_name"`
	StudentNo string `json:"student_no"`
	Class     string `json:"class"`
	Phone     string `json:"phone"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var user models.User
	if err := utils.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
		return
	}

	response := gin.H{
		"code": 200,
		"message": "登录成功",
		"data": gin.H{
			"token": token,
			"user": gin.H{
				"id":       user.ID,
				"username": user.Username,
				"role":     user.Role,
			},
		},
	}

	if user.Role == "student" {
		var student models.Student
		utils.DB.Where("user_id = ?", user.ID).First(&student)
		response["data"].(gin.H)["student"] = student
	} else if user.Role == "admin" {
		var admin models.Admin
		utils.DB.Where("user_id = ?", user.ID).First(&admin)
		response["data"].(gin.H)["admin"] = admin
	}

	c.JSON(http.StatusOK, response)
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var existingUser models.User
	if utils.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "密码加密失败"})
		return
	}

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     "student",
	}
	if err := utils.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "注册失败"})
		return
	}

	student := models.Student{
		UserID:    user.ID,
		RealName:  req.RealName,
		StudentNo: req.StudentNo,
		Class:     req.Class,
		Phone:     req.Phone,
		Points:    0,
	}
	utils.DB.Create(&student)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "注册成功",
		"data":    gin.H{"user_id": user.ID},
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var user models.User
	utils.DB.First(&user, userID)

	response := gin.H{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
	}

	if role == "student" {
		var student models.Student
		utils.DB.Where("user_id = ?", userID).First(&student)
		response["student"] = student
	} else if role == "admin" {
		var admin models.Admin
		utils.DB.Where("user_id = ?", userID).First(&admin)
		response["admin"] = admin
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": response,
	})
}
