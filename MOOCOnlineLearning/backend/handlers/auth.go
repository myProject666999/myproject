package handlers

import (
	"net/http"
	"time"

	"mooc-platform/config"
	"mooc-platform/middleware"
	"mooc-platform/models"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userService *services.UserService
}

func NewAuthHandler(userService *services.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

type registerRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6,max=32"`
	Role     string `json:"role"`
}

type loginRequest struct {
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	existing, _ := h.userService.FindByEmail(req.Email)
	if existing != nil {
		utils.Response(c, http.StatusConflict, "邮箱已被注册", nil)
		return
	}

	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "密码加密失败", nil)
		return
	}

	user := &models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  hashed,
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if user.Role == "" {
		user.Role = "student"
	}

	if err := h.userService.Create(user); err != nil {
		utils.Response(c, http.StatusInternalServerError, "注册失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "注册成功", user.PublicInfo())
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	user, err := h.userService.Login(req.Account, req.Password)
	if err != nil || !utils.CheckPassword(user.Password, req.Password) {
		utils.Response(c, http.StatusUnauthorized, "账号或密码错误", nil)
		return
	}

	token, err := utils.GenerateToken(uint(user.ID), user.Role, config.Cfg.JWT.Secret, config.Cfg.JWT.Expire)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "生成Token失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "登录成功", gin.H{
		"token": token,
		"user":  user.PublicInfo(),
	})
}

func (h *AuthHandler) Profile(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	user, err := h.userService.GetByID(uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusNotFound, "用户不存在", nil)
		return
	}
	utils.Response(c, http.StatusOK, "获取成功", user.PublicInfo())
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	user, err := h.userService.GetByID(uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusNotFound, "用户不存在", nil)
		return
	}

	var req struct {
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Nickname string `json:"nickname"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	user.UpdatedAt = time.Now()

	if err := h.userService.Update(user); err != nil {
		utils.Response(c, http.StatusInternalServerError, "更新失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "更新成功", user.PublicInfo())
}
