package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type RegisterReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	RealName string `json:"real_name"`
	Phone    string `json:"phone"`
	Email    string `json:"email"`
}

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var exist model.User
	if err := database.DB.Where("username = ?", req.Username).First(&exist).Error; err == nil {
		utils.Fail(c, 409, "username already exists")
		return
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.Fail(c, 500, "failed to hash password")
		return
	}
	user := model.User{
		Username: req.Username,
		Password: string(hashed),
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
		Role:     0,
		Status:   1,
	}
	if err := database.DB.Create(&user).Error; err != nil {
		utils.Fail(c, 500, "failed to create user")
		return
	}
	utils.Success(c, nil)
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var user model.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.FailWithStatus(c, http.StatusUnauthorized, 401, "invalid username or password")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.FailWithStatus(c, http.StatusUnauthorized, 401, "invalid username or password")
		return
	}
	if user.Status != 1 {
		utils.Fail(c, 403, "account is disabled")
		return
	}
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.Fail(c, 500, "failed to generate token")
		return
	}
	now := time.Now()
	database.DB.Model(&user).Update("last_login_at", now)
	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"real_name": user.RealName,
			"role":     user.Role,
		},
	})
}

func GetUserInfo(c *gin.Context) {
	userID := c.GetUint64("user_id")
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.Fail(c, 404, "user not found")
		return
	}
	utils.Success(c, gin.H{
		"id":           user.ID,
		"username":     user.Username,
		"real_name":    user.RealName,
		"phone":        user.Phone,
		"email":        user.Email,
		"role":         user.Role,
		"status":       user.Status,
		"last_login_at": user.LastLoginAt,
	})
}
