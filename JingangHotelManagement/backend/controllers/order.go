package controllers

import (
	"math"
	"net/http"
	"strconv"
	"time"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"
	"jingang-hotel-backend/utils"

	"github.com/gin-gonic/gin"
)

type OrderController struct{}

func (c *OrderController) CreateOrder(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")

	var req struct {
		RoomID     uint   `json:"roomId" binding:"required"`
		CheckIn    string `json:"checkIn" binding:"required"`
		CheckOut   string `json:"checkOut" binding:"required"`
		GuestName  string `json:"guestName" binding:"required"`
		GuestPhone string `json:"guestPhone" binding:"required"`
		Remark     string `json:"remark"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	checkIn, _ := time.Parse("2006-01-02", req.CheckIn)
	checkOut, _ := time.Parse("2006-01-02", req.CheckOut)

	var room models.Room
	config.DB.Preload("RoomType").First(&room, req.RoomID)
	if room.ID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "房间不存在"})
		return
	}

	var user models.User
	config.DB.First(&user, userId)

	days := int(math.Ceil(checkOut.Sub(checkIn).Hours() / 24))
	totalPrice := room.RoomType.Price * float64(days)

	if user.MemberLevel == 2 {
		totalPrice *= 0.95
	} else if user.MemberLevel == 3 {
		totalPrice *= 0.9
	} else if user.MemberLevel == 4 {
		totalPrice *= 0.85
	}

	order := models.Order{
		OrderNo:    utils.GenerateOrderNo("HO"),
		UserID:     userId.(uint),
		RoomID:     req.RoomID,
		CheckIn:    checkIn,
		CheckOut:   checkOut,
		TotalPrice: totalPrice,
		Status:     0,
		Remark:     req.Remark,
		GuestName:  req.GuestName,
		GuestPhone: req.GuestPhone,
	}

	config.DB.Create(&order)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "订单创建成功",
		"data": order,
	})
}

func (c *OrderController) GetOrders(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	status := ctx.Query("status")

	var orders []models.Order
	query := config.DB.Where("user_id = ?", userId)

	if status != "" {
		s, _ := strconv.Atoi(status)
		query = query.Where("status = ?", s)
	}

	query.Preload("Room").Preload("Room.RoomType").Order("created_at desc").Find(&orders)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": orders,
	})
}

func (c *OrderController) GetOrderDetail(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	id := ctx.Param("id")

	var order models.Order
	config.DB.Where("id = ? AND user_id = ?", id, userId).
		Preload("Room").Preload("Room.RoomType").
		First(&order)

	if order.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": order,
	})
}

func (c *OrderController) PayOrder(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	id := ctx.Param("id")

	var order models.Order
	config.DB.Where("id = ? AND user_id = ?", id, userId).First(&order)

	if order.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	if order.Status != 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "订单状态不正确"})
		return
	}

	order.Status = 1
	config.DB.Save(&order)

	var user models.User
	config.DB.First(&user, userId)
	points := int(order.TotalPrice)
	user.MemberPoints += points
	config.DB.Save(&user)

	config.DB.Create(&models.PointsRecord{
		UserID: userId.(uint),
		Type:   1,
		Points: points,
		Reason: "订单消费获得积分",
		OrderID: order.ID,
	})

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "支付成功"})
}

func (c *OrderController) CancelOrder(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	id := ctx.Param("id")

	var order models.Order
	config.DB.Where("id = ? AND user_id = ?", id, userId).First(&order)

	if order.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	if order.Status >= 2 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "订单已入住，无法取消"})
		return
	}

	order.Status = 5
	config.DB.Save(&order)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "取消成功"})
}

func (c *OrderController) ApplyCancelOrder(ctx *gin.Context) {
	userId, _ := ctx.Get("userId")
	id := ctx.Param("id")

	var order models.Order
	config.DB.Where("id = ? AND user_id = ?", id, userId).First(&order)

	if order.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	if order.Status < 1 {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "订单状态不正确"})
		return
	}

	order.Status = 6
	config.DB.Save(&order)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "申请取消成功"})
}

func (c *OrderController) GetAdminOrders(ctx *gin.Context) {
	var orders []models.Order
	config.DB.Preload("User").Preload("Room").Preload("Room.RoomType").Order("created_at desc").Find(&orders)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": orders,
	})
}

func (c *OrderController) UpdateOrderStatus(ctx *gin.Context) {
	id := ctx.Param("id")
	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var order models.Order
	config.DB.First(&order, id)
	if order.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "订单不存在"})
		return
	}

	order.Status = req.Status
	config.DB.Save(&order)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *OrderController) GetStatistics(ctx *gin.Context) {
	year := ctx.Query("year")
	roomTypeId := ctx.Query("roomTypeId")

	type StatResult struct {
		Month   int
		Count   int64
		Revenue float64
	}

	var results []StatResult
	query := config.DB.Model(&models.Order{}).
		Select("MONTH(created_at) as month, COUNT(*) as count, SUM(total_price) as revenue").
		Where("status IN ?", []int{1, 2, 3, 4}).
		Where("YEAR(created_at) = ?", year)

	if roomTypeId != "" {
		query = query.Joins("JOIN rooms ON orders.room_id = rooms.id").
			Where("rooms.room_type_id = ?", roomTypeId)
	}

	query.Group("MONTH(created_at)").Scan(&results)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": results,
	})
}
