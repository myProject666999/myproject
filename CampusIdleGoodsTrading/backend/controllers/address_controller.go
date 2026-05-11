package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"

	"github.com/gin-gonic/gin"
)

type AddressRequest struct {
	Name      string `json:"name" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
	Province  string `json:"province"`
	City      string `json:"city"`
	District  string `json:"district"`
	Detail    string `json:"detail" binding:"required"`
	IsDefault int    `json:"is_default"`
}

func GetAddresses(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var addresses []models.Address
	if result := config.DB.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses); result.Error != nil {
		utils.ServerError(c, "查询失败")
		return
	}

	utils.Success(c, addresses)
}

func GetAddress(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var address models.Address
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	utils.Success(c, address)
}

func CreateAddress(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.IsDefault == 1 {
		config.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	address := models.Address{
		UserID:    userID.(uint),
		Name:      req.Name,
		Phone:     req.Phone,
		Province:  req.Province,
		City:      req.City,
		District:  req.District,
		Detail:    req.Detail,
		IsDefault: req.IsDefault,
	}

	if result := config.DB.Create(&address); result.Error != nil {
		utils.ServerError(c, "添加地址失败")
		return
	}

	utils.Success(c, address)
}

func UpdateAddress(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var address models.Address
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	if req.IsDefault == 1 {
		config.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	updates := map[string]interface{}{
		"name":       req.Name,
		"phone":      req.Phone,
		"province":   req.Province,
		"city":       req.City,
		"district":   req.District,
		"detail":     req.Detail,
		"is_default": req.IsDefault,
	}

	if result := config.DB.Model(&address).Updates(updates); result.Error != nil {
		utils.ServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteAddress(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var address models.Address
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	if result := config.DB.Delete(&address); result.Error != nil {
		utils.ServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func SetDefaultAddress(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var address models.Address
	if result := config.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	config.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)

	if result := config.DB.Model(&address).Update("is_default", 1); result.Error != nil {
		utils.ServerError(c, "设置失败")
		return
	}

	utils.SuccessWithMessage(c, "设置成功", nil)
}
