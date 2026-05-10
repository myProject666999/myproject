package controllers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	userID := c.GetUint("user_id")

	var orders []models.Order
	var total int64

	query := config.DB.Model(&models.Order{}).Preload("User").Preload("Script").Preload("Room").Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&orders)

	utils.Success(c, gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var orders []models.Order
	var total int64

	query := config.DB.Model(&models.Order{}).Preload("User").Preload("Script").Preload("Room")
	if status != "" {
		query = query.Where("orders.status = ?", status)
	}
	if keyword != "" {
		query = query.Joins("LEFT JOIN users ON users.id = orders.user_id").
			Where("users.username LIKE ? OR orders.order_no LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("orders.id DESC").Find(&orders)

	utils.Success(c, gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ScriptID  uint    `json:"script_id" binding:"required"`
		RoomID    uint    `json:"room_id" binding:"required"`
		PlayDate  string  `json:"play_date" binding:"required"`
		PlayTime  string  `json:"play_time" binding:"required"`
		Players   int     `json:"players"`
		Remark    string  `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var script models.Script
	if err := config.DB.First(&script, req.ScriptID).Error; err != nil {
		utils.NotFound(c, "剧本不存在")
		return
	}

	var room models.Room
	if err := config.DB.First(&room, req.RoomID).Error; err != nil {
		utils.NotFound(c, "房间不存在")
		return
	}

	nano := time.Now().UnixNano()
	random := nano % 10000
	orderNo := fmt.Sprintf("ORD%s%04d", time.Now().Format("20060102150405"), random)

	order := models.Order{
		OrderNo:     orderNo,
		UserID:      userID,
		ScriptID:    req.ScriptID,
		RoomID:      req.RoomID,
		PlayDate:    req.PlayDate,
		PlayTime:    req.PlayTime,
		Players:     req.Players,
		TotalAmount: float64(req.Players) * script.Price,
		Remark:      req.Remark,
		Status:      0,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		utils.InternalError(c, "创建订单失败")
		return
	}

	utils.Success(c, order)
}

func GetOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var order models.Order
	if err := config.DB.Preload("User").Preload("Script").Preload("Room").First(&order, id).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	order.Status = req.Status

	if err := config.DB.Save(&order).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, order)
}

func DeleteOrder(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.Order{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
