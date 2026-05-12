package handler

import (
	"github.com/gin-gonic/gin"

	"samecity-express/internal/service"
	"samecity-express/pkg/utils"
)

type UserHandler struct {
	service *service.UserService
}

func NewUserHandler() *UserHandler {
	return &UserHandler{
		service: service.NewUserService(),
	}
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Nickname string `json:"nickname"`
}

type LoginRequest struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *UserHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	user, err := h.service.Register(req.Username, req.Password, req.Phone, req.Nickname)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, user)
}

func (h *UserHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	user, token, err := h.service.Login(req.Login, req.Password)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"user":  user,
		"token": token,
	})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	user, err := h.service.GetUserByID(userID)
	if err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data map[string]interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	allowedFields := map[string]bool{
		"nickname": true,
		"phone":    true,
		"avatar":   true,
	}

	filteredData := make(map[string]interface{})
	for key, value := range data {
		if allowedFields[key] {
			filteredData[key] = value
		}
	}

	user, err := h.service.UpdateProfile(userID, filteredData)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, user)
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func (h *UserHandler) ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := h.service.ChangePassword(userID, req.OldPassword, req.NewPassword); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}
