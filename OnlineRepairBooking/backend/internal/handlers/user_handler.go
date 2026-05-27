package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"online-repair-booking/internal/middleware"
	"online-repair-booking/internal/models"
	"online-repair-booking/pkg/response"
	"online-repair-booking/pkg/utils"

	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	userModel *models.UserModel
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{
		userModel: models.NewUserModel(db),
	}
}

type RegisterRequest struct {
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required,min=6"`
	Username string `json:"username" validate:"required"`
}

func (h *UserHandler) Register(c echo.Context) error {
	req := new(RegisterRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.Phone == "" || req.Password == "" || req.Username == "" {
		return response.BadRequest(c, "手机号、密码和用户名不能为空")
	}

	if len(req.Password) < 6 {
		return response.BadRequest(c, "密码长度不能少于6位")
	}

	_, err := h.userModel.GetByPhone(req.Phone)
	if err == nil {
		return response.Error(c, http.StatusConflict, "该手机号已被注册")
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return response.InternalServerError(c, "密码加密失败")
	}

	user := &models.User{
		Username: req.Username,
		Phone:    req.Phone,
		Password: hashedPassword,
		Role:     models.RoleUser,
		Status:   models.UserStatusActive,
	}

	if err := h.userModel.Create(user); err != nil {
		return response.InternalServerError(c, "注册失败")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return response.InternalServerError(c, "生成令牌失败")
	}

	return response.Success(c, map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
			"role":     user.Role,
		},
	})
}

type LoginRequest struct {
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func (h *UserHandler) Login(c echo.Context) error {
	req := new(LoginRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.Phone == "" || req.Password == "" {
		return response.BadRequest(c, "手机号和密码不能为空")
	}

	user, err := h.userModel.GetByPhone(req.Phone)
	if err != nil {
		log.Printf("Login: GetByPhone failed for phone %s: %v", req.Phone, err)
		return response.Error(c, http.StatusUnauthorized, "手机号或密码错误")
	}

	log.Printf("Login: user found, phone=%s, stored_hash=%s", req.Phone, user.Password)
	if !utils.CheckPasswordHash(req.Password, user.Password) {
		log.Printf("Login: password check failed for phone %s", req.Phone)
		return response.Error(c, http.StatusUnauthorized, "手机号或密码错误")
	}

	if user.Status != models.UserStatusActive {
		return response.Error(c, http.StatusForbidden, "账号已被禁用")
	}

	token, err := utils.GenerateToken(user.ID, user.Role)
	if err != nil {
		return response.InternalServerError(c, "生成令牌失败")
	}

	return response.Success(c, map[string]interface{}{
		"token": token,
		"user": map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"phone":    user.Phone,
			"avatar":   user.Avatar,
			"role":     user.Role,
			"status":   user.Status,
		},
	})
}

func (h *UserHandler) GetProfile(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "用户未登录")
	}

	user, err := h.userModel.GetByID(userID)
	if err != nil {
		return response.NotFound(c, "用户不存在")
	}

	return response.Success(c, map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"phone":      user.Phone,
		"avatar":     user.Avatar,
		"role":       user.Role,
		"status":     user.Status,
		"created_at": user.CreatedAt,
	})
}

type UpdateProfileRequest struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
}

func (h *UserHandler) UpdateProfile(c echo.Context) error {
	userID := middleware.GetUserID(c)
	if userID == 0 {
		return response.Unauthorized(c, "用户未登录")
	}

	req := new(UpdateProfileRequest)
	if err := c.Bind(req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	user, err := h.userModel.GetByID(userID)
	if err != nil {
		return response.NotFound(c, "用户不存在")
	}

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := h.userModel.Update(user); err != nil {
		return response.InternalServerError(c, "更新失败")
	}

	return response.Success(c, map[string]interface{}{
		"id":       user.ID,
		"username": user.Username,
		"phone":    user.Phone,
		"avatar":   user.Avatar,
		"role":     user.Role,
	})
}
