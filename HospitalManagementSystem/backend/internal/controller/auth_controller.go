package controller

import (
	"hospital-management-system/internal/model"
	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService *service.AuthService
}

func NewAuthController() *AuthController {
	return &AuthController{
		authService: service.NewAuthService(),
	}
}

func (ctrl *AuthController) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	result, err := ctrl.authService.Login(&req)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *AuthController) GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	user, err := ctrl.authService.GetUserByID(userID.(uint))
	if err != nil {
		response.NotFound(c, "用户不存在")
		return
	}

	response.Success(c, user)
}
