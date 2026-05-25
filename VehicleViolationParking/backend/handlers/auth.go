package handlers

import (
	"net/http"
	"time"

	"vehicle-parking/backend/config"
	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthHandler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func NewAuthHandler(db *gorm.DB, cfg config.Config) *AuthHandler {
	return &AuthHandler{DB: db, Cfg: cfg}
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token    string `json:"token"`
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	RealName string `json:"real_name"`
	Role     int    `json:"role"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var user models.User
	if err := h.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.Fail(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.Fail(c, http.StatusForbidden, "账号已禁用")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.Fail(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, h.Cfg.JWT)
	if err != nil {
		utils.Fail(c, http.StatusInternalServerError, "生成Token失败")
		return
	}

	now := time.Now()
	h.DB.Model(&user).Update("last_login_time", now)

	utils.Success(c, LoginResponse{
		Token:    token,
		UserID:   user.ID,
		Username: user.Username,
		RealName: user.RealName,
		Role:     user.Role,
	})
}

func (h *AuthHandler) GetUserInfo(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	if err := h.DB.First(&user, userID).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "用户不存在")
		return
	}

	utils.Success(c, gin.H{
		"id":        user.ID,
		"username":  user.Username,
		"real_name": user.RealName,
		"phone":     user.Phone,
		"role":      user.Role,
		"status":    user.Status,
	})
}
