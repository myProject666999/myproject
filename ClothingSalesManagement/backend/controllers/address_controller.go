package controllers

import (
	"log"

	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type AddressController struct{}

func NewAddressController() *AddressController {
	return &AddressController{}
}

type AddressRequest struct {
	Name      string `json:"name" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
	Province  string `json:"province"`
	City      string `json:"city"`
	District  string `json:"district"`
	Detail    string `json:"detail" binding:"required"`
	IsDefault int    `json:"is_default"`
}

func (ac *AddressController) GetAddresses(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Unauthorized(c, "用户ID类型错误")
		return
	}

	var addresses []models.Address
	database.DB.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses)

	utils.Success(c, addresses)
}

func (ac *AddressController) CreateAddress(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	log.Printf("[DEBUG] userIDVal type: %T, value: %v", userIDVal, userIDVal)

	userID, ok := userIDVal.(uint)
	if !ok {
		log.Printf("[ERROR] UserID type assertion failed")
		utils.Unauthorized(c, "用户ID类型错误")
		return
	}

	log.Printf("[DEBUG] Creating address for userID: %d", userID)

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("[ERROR] Bind JSON error: %v", err)
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	log.Printf("[DEBUG] Request data: Name=%s, Phone=%s, Detail=%s, IsDefault=%d", req.Name, req.Phone, req.Detail, req.IsDefault)

	if req.IsDefault == 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ?", userID).Update("is_default", 0)
	}

	address := models.Address{
		UserID:    userID,
		Name:      req.Name,
		Phone:     req.Phone,
		Province:  req.Province,
		City:      req.City,
		District:  req.District,
		Detail:    req.Detail,
		IsDefault: req.IsDefault,
	}

	if err := database.DB.Create(&address).Error; err != nil {
		log.Printf("[ERROR] Create address error: %v", err)
		utils.InternalError(c, "创建失败: "+err.Error())
		return
	}

	log.Printf("[DEBUG] Address created successfully: ID=%d", address.ID)
	utils.Success(c, address)
}

func (ac *AddressController) UpdateAddress(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Unauthorized(c, "用户ID类型错误")
		return
	}
	id := c.Param("id")

	var req AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if req.IsDefault == 1 {
		database.DB.Model(&models.Address{}).Where("user_id = ? AND id != ?", userID, id).Update("is_default", 0)
	}

	if err := database.DB.Model(&models.Address{}).Where("id = ? AND user_id = ?", id, userID).Updates(map[string]interface{}{
		"name":       req.Name,
		"phone":      req.Phone,
		"province":   req.Province,
		"city":       req.City,
		"district":   req.District,
		"detail":     req.Detail,
		"is_default": req.IsDefault,
	}).Error; err != nil {
		utils.InternalError(c, "更新失败: "+err.Error())
		return
	}

	var address models.Address
	database.DB.First(&address, id)
	utils.Success(c, address)
}

func (ac *AddressController) DeleteAddress(c *gin.Context) {
	userIDVal, _ := c.Get("userID")
	userID, ok := userIDVal.(uint)
	if !ok {
		utils.Unauthorized(c, "用户ID类型错误")
		return
	}
	id := c.Param("id")

	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Address{}).Error; err != nil {
		utils.InternalError(c, "删除失败: "+err.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
