package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetAddresses(c *gin.Context) {
	userID := c.GetUint("user_id")
	var addresses []models.Address
	db := config.GetDB()
	db.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses)
	utils.Success(c, addresses)
}

func GetAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var address models.Address
	db := config.GetDB()
	if err := db.Where("id = ? AND user_id = ?", id, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}
	utils.Success(c, address)
}

func CreateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var address models.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	address.UserID = userID

	db := config.GetDB()
	if address.IsDefault {
		db.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", false)
	}

	if err := db.Create(&address).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, address)
}

func UpdateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var address models.Address
	db := config.GetDB()
	if err := db.First(&address, id).Error; err != nil {
		utils.NotFound(c, "地址不存在")
		return
	}

	if address.UserID != userID {
		utils.Forbidden(c, "无权修改")
		return
	}

	var updateData models.Address
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if updateData.IsDefault {
		db.Model(&models.Address{}).Where("user_id = ? AND id != ?", userID, id).Update("is_default", false)
	}

	address.Name = updateData.Name
	address.Phone = updateData.Phone
	address.Province = updateData.Province
	address.City = updateData.City
	address.District = updateData.District
	address.DetailAddress = updateData.DetailAddress
	address.IsDefault = updateData.IsDefault

	db.Save(&address)
	utils.Success(c, address)
}

func DeleteAddress(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	if err := db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Address{}).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
