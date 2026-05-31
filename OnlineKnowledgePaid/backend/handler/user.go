package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"online-knowledge-paid/config"
	"online-knowledge-paid/middleware"
	"online-knowledge-paid/pkg/jwt"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var authService = &service.AuthService{}

func getDB(c *gin.Context) *gorm.DB {
	return c.MustGet("db").(*gorm.DB)
}

type UserHandler struct{}

func (h *UserHandler) Register(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     int8   `json:"role"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	db := getDB(c)
	user, err := authService.Register(db, req.Username, req.Email, req.Password, req.Role)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, user)
}

func (h *UserHandler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	db := getDB(c)
	user, err := authService.Login(db, req.Username, req.Password)
	if err != nil {
		response.Fail(c, http.StatusUnauthorized, err.Error())
		return
	}
	cfg := config.Load()
	token, err := jwt.GenerateToken(user.ID, user.Username, user.Role, cfg.JWT.Secret, cfg.JWT.ExpireHour)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "token generation failed")
		return
	}
	response.Success(c, gin.H{
		"token": token,
		"user":  user,
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	db := getDB(c)
	user, err := authService.GetUserByID(db, userID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "user not found")
		return
	}
	response.Success(c, user)
}

func (h *UserHandler) GetAuthorProfile(c *gin.Context) {
	authorIDStr := c.Query("author_id")
	authorID, err := strconv.ParseUint(authorIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid author_id")
		return
	}
	db := getDB(c)
	user, err := authService.GetUserByID(db, authorID)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "author not found")
		return
	}
	response.Success(c, user)
}