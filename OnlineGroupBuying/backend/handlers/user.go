package handlers

import (
	"net/http"
	"time"

	"group-buying/config"
	"group-buying/models"
	"group-buying/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
	Nickname string `json:"nickname"`
	Phone    string `json:"phone"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID        uint      `json:"id"`
	Username  string    `json:"username"`
	Nickname  string    `json:"nickname"`
	Avatar    string    `json:"avatar"`
	Phone     string    `json:"phone"`
	Balance   float64   `json:"balance"`
	Role      int       `json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误: "+err.Error())
		return
	}
	var existing models.User
	if config.DB.Where("username = ?", req.Username).First(&existing).Error == nil {
		utils.Fail(c, 400, "用户名已存在")
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.Fail(c, 500, "密码加密失败")
		return
	}
	nickname := req.Nickname
	if nickname == "" {
		nickname = req.Username
	}
	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Nickname: nickname,
		Phone:    req.Phone,
		Balance:  100.00,
		Role:     0,
		Status:   1,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		utils.Fail(c, 500, "注册失败")
		return
	}
	utils.Success(c, UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Nickname:  user.Nickname,
		Balance:   user.Balance,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	var user models.User
	if err := config.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		utils.Fail(c, 400, "用户名或密码错误")
		return
	}
	if user.Status != 1 {
		utils.Fail(c, 400, "账号已被禁用")
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.Fail(c, 400, "用户名或密码错误")
		return
	}
	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.Fail(c, 500, "生成token失败")
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"message": "success",
		"data": gin.H{
			"token": token,
			"user": UserResponse{
				ID:        user.ID,
				Username:  user.Username,
				Nickname:  user.Nickname,
				Avatar:    user.Avatar,
				Phone:     user.Phone,
				Balance:   user.Balance,
				Role:      user.Role,
				CreatedAt: user.CreatedAt,
			},
		},
	})
}

func GetUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.Fail(c, 404, "用户不存在")
		return
	}
	utils.Success(c, UserResponse{
		ID:        user.ID,
		Username:  user.Username,
		Nickname:  user.Nickname,
		Avatar:    user.Avatar,
		Phone:     user.Phone,
		Balance:   user.Balance,
		Role:      user.Role,
		CreatedAt: user.CreatedAt,
	})
}

func UpdateUserInfo(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		utils.Fail(c, 404, "用户不存在")
		return
	}
	var req struct {
		Nickname string `json:"nickname"`
		Avatar   string `json:"avatar"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if err := config.DB.Save(&user).Error; err != nil {
		utils.Fail(c, 500, "更新失败")
		return
	}
	utils.SuccessMsg(c, "更新成功")
}

func GetUserBalance(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := config.DB.Select("balance").First(&user, userID).Error; err != nil {
		utils.Fail(c, 404, "用户不存在")
		return
	}
	utils.Success(c, gin.H{"balance": user.Balance})
}

func AdminGetUsers(c *gin.Context) {
	var users []models.User
	config.DB.Find(&users)
	var resp []UserResponse
	for _, u := range users {
		resp = append(resp, UserResponse{
			ID:        u.ID,
			Username:  u.Username,
			Nickname:  u.Nickname,
			Avatar:    u.Avatar,
			Phone:     u.Phone,
			Balance:   u.Balance,
			Role:      u.Role,
			CreatedAt: u.CreatedAt,
		})
	}
	utils.Success(c, resp)
}

func AdminUpdateUserStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, "参数错误")
		return
	}
	result := config.DB.Model(&models.User{}).Where("id = ?", id).Update("status", req.Status)
	if result.Error != nil {
		utils.Fail(c, 500, "更新失败")
		return
	}
	utils.SuccessMsg(c, "更新成功")
}
