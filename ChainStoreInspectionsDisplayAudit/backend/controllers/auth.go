package controllers

import (
	"net/http"
	"time"

	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "请求参数错误")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.UnauthorizedResponse(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.ForbiddenResponse(c, "账号已被禁用")
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		utils.UnauthorizedResponse(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalServerErrorResponse(c, "生成令牌失败")
		return
	}

	clientIP := c.ClientIP()
	database.DB.Model(&user).Updates(map[string]interface{}{
		"last_login_at": time.Now(),
		"last_login_ip": clientIP,
	})

	utils.SuccessResponse(c, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, models.Response{
		Code:    0,
		Message: "登出成功",
	})
}

func GetUserInfo(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		utils.UnauthorizedResponse(c, "未登录")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFoundResponse(c, "用户不存在")
		return
	}

	utils.SuccessResponse(c, user)
}
