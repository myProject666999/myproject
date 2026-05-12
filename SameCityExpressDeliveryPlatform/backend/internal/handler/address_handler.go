package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"samecity-express/internal/model"
	"samecity-express/internal/service"
	"samecity-express/pkg/utils"
)

type AddressHandler struct {
	service *service.AddressService
}

func NewAddressHandler() *AddressHandler {
	return &AddressHandler{
		service: service.NewAddressService(),
	}
}

func (h *AddressHandler) CreateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var address model.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	result, err := h.service.CreateAddress(userID, &address)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, result)
}

func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var address model.Address
	if err := c.ShouldBindJSON(&address); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	result, err := h.service.UpdateAddress(userID, &address)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, result)
}

func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "地址ID无效")
		return
	}

	if err := h.service.DeleteAddress(userID, uint(id)); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func (h *AddressHandler) GetAddresses(c *gin.Context) {
	userID := c.GetUint("user_id")

	addresses, err := h.service.GetUserAddresses(userID)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, addresses)
}

func (h *AddressHandler) GetDefaultAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	address, err := h.service.GetDefaultAddress(userID)
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	utils.Success(c, address)
}

type SetDefaultAddressRequest struct {
	AddressID uint `json:"address_id" binding:"required"`
}

func (h *AddressHandler) SetDefaultAddress(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req SetDefaultAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := h.service.SetDefaultAddress(userID, req.AddressID); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "设置成功", nil)
}
