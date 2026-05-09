package controllers

import (
	"online-job-recruitment/database"
	"online-job-recruitment/models"
	"online-job-recruitment/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Admin CRUD
func GetAdmins(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var admins []models.User
	var total int64

	query := database.DB.Model(&models.User{}).Where("role = ?", "admin")
	query.Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&admins)

	utils.Success(c, gin.H{
		"list":      admins,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateAdmin(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	user.Role = "admin"
	user.Status = 1

	var existingUser models.User
	if database.DB.Where("username = ?", user.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	if err := user.SetPassword(user.Password); err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, user)
}

func UpdateAdmin(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "管理员不存在")
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, user)
}

func DeleteAdmin(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

// Recruiter CRUD
func GetRecruiters(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var recruiters []models.User
	var total int64

	query := database.DB.Model(&models.User{}).Where("role = ?", "recruiter")
	if keyword != "" {
		query = query.Where("name LIKE ? OR username LIKE ? OR company LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&recruiters)

	utils.Success(c, gin.H{
		"list":      recruiters,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateRecruiter(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	user.Role = "recruiter"
	user.Status = 1

	var existingUser models.User
	if database.DB.Where("username = ?", user.Username).First(&existingUser).Error == nil {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	if err := user.SetPassword(user.Password); err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, user)
}

func UpdateRecruiter(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "招聘人员不存在")
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, user)
}

func DeleteRecruiter(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

// Users (Job Seekers)
func GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{}).Where("role = ?", "user")
	if keyword != "" {
		query = query.Where("name LIKE ? OR username LIKE ? OR phone LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&users)

	utils.Success(c, gin.H{
		"list":      users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func DeleteUser(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func ResetPassword(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	var req struct {
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := user.SetPassword(req.NewPassword); err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "重置密码失败")
		return
	}

	utils.SuccessWithMessage(c, "密码重置成功", nil)
}
