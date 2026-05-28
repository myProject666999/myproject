package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/cache"
	"team-virtual-office/config"
	"team-virtual-office/model"
	"team-virtual-office/ws"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	db            *gorm.DB
	cacheManager  *cache.StatusManager
	hub           *ws.Hub
	configInstance *config.Config
)

func InitHandler(d *gorm.DB, cm *cache.StatusManager, h *ws.Hub, cfg *config.Config) {
	db = d
	cacheManager = cm
	hub = h
	configInstance = cfg
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Nickname string `json:"nickname"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	var user model.User
	if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, model.Response{Code: 401, Message: "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, model.Response{Code: 401, Message: "invalid credentials"})
		return
	}

	claims := jwt.RegisteredClaims{
		Subject:   strconv.FormatUint(uint64(user.ID), 10),
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(configInstance.JWT.Secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to generate token"})
		return
	}

	var userStatus model.UserStatus
	db.Where("user_id = ?", user.ID).First(&userStatus)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: gin.H{
			"token": tokenString,
			"user": gin.H{
				"id":         user.ID,
				"username":   user.Username,
				"nickname":   user.Nickname,
				"email":      user.Email,
				"avatar_url": user.AvatarURL,
				"status":     user.Status,
				"user_status": userStatus,
			},
		},
	})
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	var count int64
	db.Model(&model.User{}).Where("username = ? OR email = ?", req.Username, req.Email).Count(&count)
	if count > 0 {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "username or email already exists"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to hash password"})
		return
	}

	user := model.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Nickname:     req.Nickname,
		Status:       1,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to create user"})
		return
	}

	userStatus := model.UserStatus{
		UserID:       user.ID,
		OnlineStatus: 0,
		BusyMode:     0,
	}

	if err := db.Create(&userStatus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to create user status"})
		return
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data:    gin.H{"user_id": user.ID},
	})
}

func GetInfo(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var user model.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "user not found"})
		return
	}

	var userStatus model.UserStatus
	db.Where("user_id = ?", userID).First(&userStatus)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"nickname":    user.Nickname,
			"email":       user.Email,
			"avatar_url":  user.AvatarURL,
			"status":      user.Status,
			"user_status": userStatus,
		},
	})
}

func ListUsers(c *gin.Context) {
	var users []model.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to query users"})
		return
	}

	userIDs := make([]uint, len(users))
	for i, u := range users {
		userIDs[i] = u.ID
	}

	var statuses []model.UserStatus
	db.Where("user_id IN ?", userIDs).Find(&statuses)

	statusMap := make(map[uint]model.UserStatus)
	for _, s := range statuses {
		statusMap[s.UserID] = s
	}

	result := make([]map[string]interface{}, len(users))
	for i, u := range users {
		status := statusMap[u.ID]
		result[i] = map[string]interface{}{
			"id":            u.ID,
			"username":      u.Username,
			"nickname":      u.Nickname,
			"avatar_url":    u.AvatarURL,
			"online_status": status.OnlineStatus,
			"busy_mode":     status.BusyMode,
			"text_status":   status.TextStatus,
			"current_room_id": status.CurrentRoomID,
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data:    result,
	})
}
