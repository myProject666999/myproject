package handler

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/internal/service"
	"carpooling/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{
		authService: service.NewAuthService(),
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	userResp, err := h.authService.Register(req.Phone, req.Password, req.Nickname)
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, userResp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "请求参数错误")
		return
	}

	userResp, err := h.authService.Login(req.Phone, req.Password)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	response.Success(c, userResp)
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		response.Unauthorized(c, "未获取到用户信息")
		return
	}

	userResp, err := h.authService.GetProfile(userID)
	if err != nil {
		response.InternalError(c, err.Error())
		return
	}

	response.Success(c, userResp)
}
