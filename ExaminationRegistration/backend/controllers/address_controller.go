package controllers

import (
	"strconv"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func GetAddressList(c *gin.Context) {
	userID := c.GetUint("user_id")

	var addresses []models.Address
	database.DB.Where("user_id = ?", userID).Order("is_default DESC, id DESC").Find(&addresses)

	utils.Success(c, addresses)
}

func CreateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var address models.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	address.UserID = userID

	if address.IsDefault == 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	if result := database.DB.Create(&address); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "创建成功", address)
}

func UpdateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var address models.Address
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	if err := c.ShouldBindJSON(&address); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if address.IsDefault == 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ? AND id != ?", userID, id).Update("is_default", 0)
	}

	database.DB.Save(&address)
	utils.SuccessWithMessage(c, "更新成功", address)
}

func DeleteAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Address{}); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func SetDefaultAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var address models.Address
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&address); result.Error != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	database.DB.Model(&address).Update("is_default", 1)

	utils.SuccessWithMessage(c, "设置成功", nil)
}
