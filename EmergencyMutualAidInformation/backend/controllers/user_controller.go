package controllers

import (
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/models"
	"emergency-mutual-aid/utils"
	"strconv"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		RealName string `json:"real_name"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.RealName != "" {
		user.RealName = req.RealName
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, nil)
}

func GetFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favorites []models.Favorite
	if err := database.DB.Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		utils.InternalServerError(c, "获取收藏列表失败")
		return
	}

	utils.Success(c, favorites)
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Type     string `json:"type" binding:"required"`
		TargetID uint   `json:"target_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existing models.Favorite
	if err := database.DB.Where("user_id = ? AND type = ? AND target_id = ?", userID, req.Type, req.TargetID).First(&existing).Error; err == nil {
		utils.BadRequest(c, "已收藏")
		return
	}

	favorite := models.Favorite{
		UserID:   userID,
		Type:     req.Type,
		TargetID: req.TargetID,
	}

	if err := database.DB.Create(&favorite).Error; err != nil {
		utils.InternalServerError(c, "收藏失败")
		return
	}

	utils.Success(c, nil)
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Favorite{}).Error; err != nil {
		utils.InternalServerError(c, "取消收藏失败")
		return
	}

	utils.Success(c, nil)
}

func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var users []models.User
	query := database.DB.Model(&models.User{})

	if keyword != "" {
		query = query.Where("username LIKE ? OR email LIKE ? OR real_name LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error; err != nil {
		utils.InternalServerError(c, "获取用户列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  users,
	})
}

func GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func CreateUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existing models.User
	if err := database.DB.Where("username = ?", user.Username).First(&existing).Error; err == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	if user.Password == "" {
		utils.BadRequest(c, "密码不能为空")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}
	user.Password = string(hashedPassword)
	user.Status = 1
	if user.Role == "" {
		user.Role = "user"
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "创建用户失败")
		return
	}

	user.Password = ""
	utils.Success(c, user)
}

func UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	var req struct {
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		RealName string `json:"real_name"`
		Avatar   string `json:"avatar"`
		Status   int    `json:"status"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.RealName != "" {
		user.RealName = req.RealName
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}
	if req.Status != 0 {
		user.Status = req.Status
	}
	if req.Role != "" {
		user.Role = req.Role
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "更新用户失败")
		return
	}

	utils.Success(c, user)
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除用户失败")
		return
	}

	utils.Success(c, nil)
}
