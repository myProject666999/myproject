package handler

import (
	"github.com/gin-gonic/gin"

	"samecity-express/internal/service"
	"samecity-express/pkg/utils"
)

type RiderHandler struct {
	service *service.RiderService
}

func NewRiderHandler() *RiderHandler {
	return &RiderHandler{
		service: service.NewRiderService(),
	}
}

type RiderRegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	RealName string `json:"real_name" binding:"required"`
	IDCard   string `json:"id_card" binding:"required"`
}

func (h *RiderHandler) Register(c *gin.Context) {
	var req RiderRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	rider, err := h.service.Register(req.Username, req.Password, req.Phone, req.RealName, req.IDCard)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, rider)
}

type RiderLoginRequest struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *RiderHandler) Login(c *gin.Context) {
	var req RiderLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	rider, token, err := h.service.Login(req.Login, req.Password)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"rider": rider,
		"token": token,
	})
}

func (h *RiderHandler) GetProfile(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	rider, err := h.service.GetRiderByID(riderID)
	if err != nil {
		utils.NotFound(c, "骑手不存在")
		return
	}

	utils.Success(c, rider)
}

type UpdateLocationRequest struct {
	Longitude float64 `json:"longitude" binding:"required"`
	Latitude  float64 `json:"latitude" binding:"required"`
}

func (h *RiderHandler) UpdateLocation(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	var req UpdateLocationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := h.service.UpdateLocation(riderID, req.Longitude, req.Latitude); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "位置更新成功", nil)
}

type UpdateOnlineStatusRequest struct {
	Status int `json:"status" binding:"required"`
}

func (h *RiderHandler) UpdateOnlineStatus(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	var req UpdateOnlineStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Status != 0 && req.Status != 1 {
		utils.BadRequest(c, "状态值无效")
		return
	}

	if err := h.service.UpdateOnlineStatus(riderID, req.Status); err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "状态更新成功", nil)
}
