package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type UserController struct{}

func NewUserController() *UserController {
	return &UserController{}
}

type UpdateProfileRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Avatar   string `json:"avatar"`
}

func (uc *UserController) UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
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
		utils.InternalError(c, "更新失败")
		return
	}

	var user models.User
	database.DB.First(&user, userID)
	utils.Success(c, user)
}

func (uc *UserController) GetUserList(c *gin.Context) {
	var users []models.User
	query := database.DB.Where("role = ?", "member")

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("username LIKE ? OR email LIKE ? OR phone LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Model(&models.User{}).Count(&total)

	page := 1
	pageSize := 10
	if p := c.Query("page"); p != "" {
		page = toInt(p)
	}
	if ps := c.Query("page_size"); ps != "" {
		pageSize = toInt(ps)
	}

	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&users)

	utils.Success(c, gin.H{
		"list":  users,
		"total": total,
		"page":  page,
	})
}

func (uc *UserController) DisableUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.User{}).Where("id = ?", id).Update("status", 0).Error; err != nil {
		utils.InternalError(c, "禁用失败")
		return
	}

	utils.SuccessWithMessage(c, "禁用成功", nil)
}

func (uc *UserController) EnableUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.User{}).Where("id = ?", id).Update("status", 1).Error; err != nil {
		utils.InternalError(c, "解禁失败")
		return
	}

	utils.SuccessWithMessage(c, "解禁成功", nil)
}

func toInt(s string) int {
	var result int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			result = result*10 + int(c-'0')
		}
	}
	return result
}
