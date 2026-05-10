package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

type UpdateProfileRequest struct {
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Nickname string `json:"nickname"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

func UpdateAdminProfile(c *gin.Context) {
	adminID := c.GetUint("user_id")
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	updates := map[string]interface{}{}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}

	if len(updates) > 0 {
		if err := database.DB.Model(&admin).Updates(updates).Error; err != nil {
			utils.InternalServerError(c, "更新失败")
			return
		}
	}

	utils.SuccessWithMessage(c, "更新成功", gin.H{
		"id":       admin.ID,
		"username": admin.Username,
		"email":    admin.Email,
		"phone":    admin.Phone,
		"nickname": admin.Nickname,
	})
}

func ChangeAdminPassword(c *gin.Context) {
	adminID := c.GetUint("user_id")
	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var admin models.Admin
	if err := database.DB.First(&admin, adminID).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	if !utils.CheckPassword(req.OldPassword, admin.Password) {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Model(&admin).Update("password", hashedPassword).Error; err != nil {
		utils.InternalServerError(c, "密码修改失败")
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func GetUserList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{})
	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ? OR email LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&users)

	utils.Success(c, gin.H{
		"list":     users,
		"total":    total,
		"page":     page,
		"page_size": pageSize,
	})
}

func GetUserDetail(c *gin.Context) {
	id := c.Param("id")
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}
	utils.Success(c, user)
}

type CreateUserRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Nickname string `json:"nickname"`
	Status   int    `json:"status"`
}

func CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var existingUser models.User
	if database.DB.Where("username = ?", req.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Email:    req.Email,
		Phone:    req.Phone,
		Nickname: req.Nickname,
		Status:   req.Status,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "创建用户失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	updates := map[string]interface{}{
		"email":    req.Email,
		"phone":    req.Phone,
		"nickname": req.Nickname,
		"status":   req.Status,
	}

	if req.Password != "" {
		hashedPassword, err := utils.HashPassword(req.Password)
		if err != nil {
			utils.InternalServerError(c, "密码加密失败")
			return
		}
		updates["password"] = hashedPassword
	}

	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
