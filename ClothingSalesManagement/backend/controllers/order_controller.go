package controllers

import (
	"encoding/json"
	"fmt"
	"time"

	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderController struct{}

func NewOrderController() *OrderController {
	return &OrderController{}
}

type CreateOrderRequest struct {
	CartIDs   []uint `json:"cart_ids" binding:"required"`
	AddressID uint   `json:"address_id" binding:"required"`
	Remark    string `json:"remark"`
}

func (oc *OrderController) CreateOrder(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var address models.Address
	if err := database.DB.Where("id = ? AND user_id = ?", req.AddressID, userID).First(&address).Error; err != nil {
		utils.NotFound(c, "收货地址不存在")
		return
	}

	var cartItems []models.Cart
	database.DB.Where("id IN ? AND user_id = ?", req.CartIDs, userID).Preload("Product").Find(&cartItems)

	if len(cartItems) == 0 {
		utils.BadRequest(c, "购物车为空")
		return
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		product := item.Product
		if product.Stock < item.Quantity {
			utils.BadRequest(c, fmt.Sprintf("商品%s库存不足", product.Name))
			return
		}

		totalAmount += product.Price * float64(item.Quantity)

		orderItems = append(orderItems, models.OrderItem{
			ProductID:    product.ID,
			ProductName:  product.Name,
			ProductImage: product.Image,
			Price:        product.Price,
			Quantity:     item.Quantity,
		})
	}

	orderNo := fmt.Sprintf("SO%s%d", time.Now().Format("20060102150405"), userID)

	addressJSON, _ := json.Marshal(address)

	order := models.Order{
		OrderNo:     orderNo,
		UserID:      userID.(uint),
		TotalAmount: totalAmount,
		Status:      0,
		PayStatus:   0,
		AddressInfo: string(addressJSON),
		Remark:      req.Remark,
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建订单失败")
		return
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建订单详情失败")
		return
	}

	for _, item := range cartItems {
		tx.Model(&models.Product{}).Where("id = ?", item.ProductID).UpdateColumn("stock", gorm.Expr("stock - ?", item.Quantity))
		tx.Model(&models.Product{}).Where("id = ?", item.ProductID).UpdateColumn("sales", gorm.Expr("sales + ?", item.Quantity))
	}

	tx.Where("id IN ?", req.CartIDs).Delete(&models.Cart{})

	tx.Commit()

	utils.Success(c, order)
}

func (oc *OrderController) GetOrderList(c *gin.Context) {
	userID, _ := c.Get("userID")

	var orders []models.Order
	query := database.DB.Where("user_id = ?", userID)

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	page := 1
	pageSize := 10
	if p := c.Query("page"); p != "" {
		page = toInt(p)
	}
	if ps := c.Query("page_size"); ps != "" {
		pageSize = toInt(ps)
	}

	var total int64
	query.Model(&models.Order{}).Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("Items").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders)

	utils.Success(c, gin.H{
		"list":  orders,
		"total": total,
		"page":  page,
	})
}

func (oc *OrderController) GetOrderDetail(c *gin.Context) {
	userID, _ := c.Get("userID")
	id := c.Param("id")

	var order models.Order
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Items").First(&order).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func (oc *OrderController) AdminGetOrderList(c *gin.Context) {
	var orders []models.Order
	query := database.DB

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if orderNo := c.Query("order_no"); orderNo != "" {
		query = query.Where("order_no LIKE ?", "%"+orderNo+"%")
	}

	var total int64
	query.Model(&models.Order{}).Count(&total)

	page := 1
	pageSize := 10
	if p := c.Query("page"); p != "" {
		page = toInt(p)
	}
	if ps := c.Query("page_size"); ps != "" {
		pageSize = toInt(ps)
	}

	offset := (page - 1) * pageSize
	query.Preload("Items").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders)

	utils.Success(c, gin.H{
		"list":  orders,
		"total": total,
		"page":  page,
	})
}

func (oc *OrderController) ShipOrder(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Order{}).Where("id = ? AND status = 1", id).Update("status", 2).Error; err != nil {
		utils.InternalError(c, "配货失败")
		return
	}

	utils.SuccessWithMessage(c, "配货成功", nil)
}

func (oc *OrderController) DeliverOrder(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Order{}).Where("id = ? AND status = 2", id).Update("status", 3).Error; err != nil {
		utils.InternalError(c, "出库失败")
		return
	}

	utils.SuccessWithMessage(c, "出库成功", nil)
}

func (oc *OrderController) CloseOrder(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Model(&models.Order{}).Where("id = ?", id).Update("status", -1).Error; err != nil {
		utils.InternalError(c, "关闭失败")
		return
	}

	utils.SuccessWithMessage(c, "关闭成功", nil)
}
