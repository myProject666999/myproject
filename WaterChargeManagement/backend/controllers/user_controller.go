package controllers

import (
	"net/http"
	"strconv"
	"watercharge/database"
	"watercharge/models"
	"watercharge/utils"

	"github.com/gin-gonic/gin"
)

func GetUsers(c *gin.Context) {
	userNo := c.Query("user_no")
	var users []models.User
	query := database.DB.Preload("Community")

	if userNo != "" {
		query = query.Where("user_no LIKE ?", "%"+userNo+"%")
	}

	query.Find(&users)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": users})
}

func GetUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var user models.User
	if err := database.DB.Preload("Community").First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": user})
}

func CreateUser(c *gin.Context) {
	var req models.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "密码加密失败"})
		return
	}

	user := models.User{
		UserNo:      req.UserNo,
		Username:    req.Username,
		Password:    hashedPassword,
		RealName:    req.RealName,
		Phone:       req.Phone,
		Address:     req.Address,
		CommunityID: req.CommunityID,
		Status:      req.Status,
	}
	if user.Status == "" {
		user.Status = "active"
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户编号或用户名已存在"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": user})
}

func UpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var user models.User
	if err := database.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"RealName":    req.RealName,
		"Phone":       req.Phone,
		"Address":     req.Address,
		"CommunityID": req.CommunityID,
	}

	if req.Status != "" {
		updates["Status"] = req.Status
	}
	if req.Username != "" {
		updates["Username"] = req.Username
	}
	if req.Password != "" {
		hashedPassword, _ := utils.HashPassword(req.Password)
		updates["Password"] = hashedPassword
	}

	database.DB.Model(&user).Updates(updates)
	database.DB.First(&user, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	database.DB.Delete(&models.User{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ChangeUserPassword(c *gin.Context) {
	userID, _ := c.Get("user_id")
	var req models.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": err.Error()})
		return
	}

	var user models.User
	database.DB.First(&user, userID)

	if !utils.CheckPasswordHash(req.OldPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	hashedPassword, _ := utils.HashPassword(req.NewPassword)
	database.DB.Model(&user).Update("Password", hashedPassword)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}
