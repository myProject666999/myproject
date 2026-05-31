package api

import (
	"net/http"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

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
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	if req.Username == "" || req.Password == "" {
		response.Error(c, "用户名和密码不能为空")
		return
	}

	result, err := ctrl.authService.Login(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *AuthController) Logout(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	err := ctrl.authService.Logout(c.Request.Context(), userID.(uint64), username.(string))
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AuthController) GetInfo(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	user, err := ctrl.authService.GetUserInfo(c.Request.Context(), userID.(uint64))
	if err != nil {
		response.ErrorWithCode(c, http.StatusUnauthorized, err.Error())
		return
	}

	response.Success(c, user)
}
