package controllers

import (
	"strconv"
	"time"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Email    string `json:"email"`
		Nickname string `json:"nickname"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var existingUser models.User
	if result := database.DB.Where("username = ?", req.Username).First(&existingUser); result.RowsAffected > 0 {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Email:    req.Email,
		Nickname: req.Nickname,
		Role:     "user",
		Status:   1,
	}

	if result := database.DB.Create(&user); result.Error != nil {
		utils.InternalError(c, "注册失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "注册成功", nil)
}

func Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var user models.User
	if result := database.DB.Where("username = ?", req.Username).First(&user); result.Error != nil {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	if user.Status != 1 {
		utils.Unauthorized(c, "账号已被禁用")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		utils.Unauthorized(c, "用户名或密码错误")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		utils.InternalError(c, "生成token失败")
		return
	}

	utils.Success(c, gin.H{
		"token":    token,
		"user":     user,
		"is_admin": user.Role == "admin",
	})
}

func GetCurrentUser(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user models.User
	if result := database.DB.First(&user, userID); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		Nickname string    `json:"nickname"`
		Email    string    `json:"email"`
		Phone    string    `json:"phone"`
		Gender   int       `json:"gender"`
		Avatar   string    `json:"avatar"`
		Birthday *time.Time `json:"birthday"`
		Address  string    `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var user models.User
	if result := database.DB.First(&user, userID); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Gender != 0 {
		updates["gender"] = req.Gender
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}
	if req.Birthday != nil {
		updates["birthday"] = req.Birthday
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}

	if len(updates) > 0 {
		database.DB.Model(&user).Updates(updates)
	}

	utils.SuccessWithMessage(c, "更新成功", user)
}

func UpdatePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var user models.User
	if result := database.DB.First(&user, userID); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	database.DB.Model(&user).Update("password", string(hashedPassword))
	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func GetUserList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	role := c.Query("role")

	offset := (page - 1) * pageSize

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{})
	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ? OR email LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&users)

	utils.Success(c, gin.H{
		"list":      users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetUserDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var user models.User
	if result := database.DB.First(&user, id); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	utils.Success(c, user)
}

func CreateUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Email    string `json:"email"`
		Nickname string `json:"nickname"`
		Role     string `json:"role"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var existingUser models.User
	if result := database.DB.Where("username = ?", req.Username).First(&existingUser); result.RowsAffected > 0 {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalError(c, "密码加密失败")
		return
	}

	user := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		Email:    req.Email,
		Nickname: req.Nickname,
		Role:     req.Role,
		Status:   req.Status,
	}

	if result := database.DB.Create(&user); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "创建成功", user)
}

func UpdateUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req struct {
		Email    string `json:"email"`
		Nickname string `json:"nickname"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var user models.User
	if result := database.DB.First(&user, id); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Nickname != "" {
		updates["nickname"] = req.Nickname
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.Status != 0 {
		updates["status"] = req.Status
	}

	if len(updates) > 0 {
		database.DB.Model(&user).Updates(updates)
	}

	utils.SuccessWithMessage(c, "更新成功", user)
}

func DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.User{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func BatchDeleteUser(c *gin.Context) {
	var req struct {
		IDs []uint `json:"ids" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if result := database.DB.Delete(&models.User{}, req.IDs); result.Error != nil {
		utils.InternalError(c, "批量删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "批量删除成功", nil)
}
