package controllers

import (
	"net/http"
	"strconv"
	"time"

	"moonsister/config"
	"moonsister/models"
	"moonsister/utils"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		NannyID     uint   `json:"nanny_id" binding:"required"`
		DemandID    uint   `json:"demand_id"`
		ServiceType string `json:"service_type" binding:"required"`
		StartDate   string `json:"start_date" binding:"required"`
		EndDate     string `json:"end_date" binding:"required"`
		Price       float64 `json:"price" binding:"required"`
		Address     string `json:"address"`
		Notes       string `json:"notes"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var customer models.Customer
	if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
		var user models.User
		if err := config.DB.First(&user, userID).Error; err != nil {
			utils.Error(c, http.StatusBadRequest, "用户不存在")
			return
		}
		customer = models.Customer{
			UserID: userID,
			Phone:  user.Phone,
		}
		config.DB.Create(&customer)
	}

	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)
	totalDays := int(endDate.Sub(startDate).Hours()/24) + 1

	order := models.Order{
		OrderNo:     utils.GenerateOrderNo(),
		CustomerID:  customer.ID,
		NannyID:     req.NannyID,
		DemandID:    req.DemandID,
		ServiceType: req.ServiceType,
		StartDate:   startDate,
		EndDate:     endDate,
		TotalDays:   totalDays,
		Price:       req.Price,
		Status:      "pending",
		Address:     req.Address,
		Notes:       req.Notes,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "创建订单失败")
		return
	}

	config.DB.Model(&models.Nanny{}).Where("id = ?", req.NannyID).Update("status", "booked")
	config.DB.Model(&models.Demand{}).Where("id = ?", req.DemandID).Update("status", "matched")

	utils.Success(c, order)
}

func GetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var orders []models.Order
	var total int64

	query := config.DB.Model(&models.Order{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at desc").Find(&orders)

	utils.Page(c, orders, total)
}

func GetMyOrders(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var orders []models.Order

	if role == "customer" {
		var customer models.Customer
		if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
			utils.Success(c, []interface{}{})
			return
		}
		config.DB.Where("customer_id = ?", customer.ID).Order("created_at desc").Find(&orders)
	} else if role == "nanny" {
		var nanny models.Nanny
		if err := config.DB.Where("user_id = ?", userID).First(&nanny).Error; err != nil {
			utils.Success(c, []interface{}{})
			return
		}
		config.DB.Where("nanny_id = ?", nanny.ID).Order("created_at desc").Find(&orders)
	} else {
		config.DB.Order("created_at desc").Find(&orders)
	}

	utils.Success(c, orders)
}

func GetOrderDetail(c *gin.Context) {
	id := c.Param("id")

	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "订单不存在")
		return
	}

	config.DB.Model(&order).Update("status", req.Status)

	if req.Status == "completed" {
		config.DB.Model(&models.Nanny{}).Where("id = ?", order.NannyID).Update("status", "available")
	}

	utils.Success(c, gin.H{"message": "状态更新成功"})
}

func CreateContract(c *gin.Context) {
	var req struct {
		OrderID uint   `json:"order_id" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	contract := models.Contract{
		OrderID:    req.OrderID,
		ContractNo: utils.GenerateContractNo(),
		Content:    req.Content,
		Status:     "pending",
	}

	config.DB.Create(&contract)
	utils.Success(c, contract)
}

func GetContract(c *gin.Context) {
	orderID := c.Param("order_id")

	var contract models.Contract
	if err := config.DB.Where("order_id = ?", orderID).First(&contract).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "合同不存在")
		return
	}

	utils.Success(c, contract)
}

func SignContract(c *gin.Context) {
	id := c.Param("id")
	role := c.GetString("role")

	var contract models.Contract
	if err := config.DB.First(&contract, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "合同不存在")
		return
	}

	now := time.Now()

	if role == "customer" {
		contract.CustomerSigned = true
		contract.CustomerSignAt = &now
	} else if role == "nanny" {
		contract.NannySigned = true
		contract.NannySignAt = &now
	}

	if contract.CustomerSigned && contract.NannySigned {
		contract.Status = "signed"
	}

	config.DB.Save(&contract)
	utils.Success(c, contract)
}
