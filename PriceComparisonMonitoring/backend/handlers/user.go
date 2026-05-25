package handlers

import (
	"net/http"
	"price-monitor/database"
	"price-monitor/middleware"
	"price-monitor/models"
	"price-monitor/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct{}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6,max=100"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

type UpdateProfileRequest struct {
	Email  string `json:"email"`
	Phone  string `json:"phone"`
	Avatar string `json:"avatar"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6,max=100"`
}

func (h *UserHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.SendError(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.SendError(c, http.StatusUnauthorized, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.SendError(c, http.StatusForbidden, "账户已被禁用")
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "生成令牌失败")
		return
	}

	utils.SendSuccess(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"avatar":   user.Avatar,
		},
	})
}

func (h *UserHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	var existing models.User
	if database.DB.Where("username = ?", req.Username).First(&existing).Error == nil {
		utils.SendError(c, http.StatusConflict, "用户名已存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Email:    req.Email,
		Phone:    req.Phone,
		Status:   1,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "注册失败")
		return
	}

	defaultGroups := []models.ProductGroup{
		{UserID: user.ID, Name: "默认分组", Description: "默认商品分组", Icon: "📦", Sort: 0},
		{UserID: user.ID, Name: "电子产品", Description: "手机、电脑等", Icon: "💻", Sort: 1},
		{UserID: user.ID, Name: "服装配饰", Description: "衣服、鞋子等", Icon: "👔", Sort: 2},
	}
	database.DB.Create(&defaultGroups)

	token, err := middleware.GenerateToken(user.ID, user.Username)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "生成令牌失败")
		return
	}

	utils.SendSuccess(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
		},
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "用户不存在")
		return
	}

	utils.SendSuccess(c, gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"phone":      user.Phone,
		"avatar":     user.Avatar,
		"status":     user.Status,
		"created_at": user.CreatedAt,
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	if err := database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "更新成功"})
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "用户不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		utils.SendError(c, http.StatusBadRequest, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.SendError(c, http.StatusInternalServerError, "密码加密失败")
		return
	}

	database.DB.Model(&user).Update("password", string(hashedPassword))
	utils.SendSuccess(c, gin.H{"message": "密码修改成功"})
}
