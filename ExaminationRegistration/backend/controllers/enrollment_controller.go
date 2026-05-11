package controllers

import (
	"strconv"
	"time"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func GetProjectList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")

	offset := (page - 1) * pageSize

	var projects []models.EnrollmentProject
	var total int64

	query := database.DB.Model(&models.EnrollmentProject{}).Where("status = ?", 1)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	query.Order("sort DESC, id DESC").Offset(offset).Limit(pageSize).Find(&projects)

	utils.Success(c, gin.H{
		"list":      projects,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetProjectDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var project models.EnrollmentProject
	if result := database.DB.First(&project, id); result.Error != nil {
		utils.NotFound(c, "报名项目不存在")
		return
	}

	database.DB.Model(&project).Update("view_count", project.ViewCount+1)

	utils.Success(c, project)
}

func AddToCart(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ProjectID uint `json:"project_id" binding:"required"`
		Quantity  int  `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var project models.EnrollmentProject
	if result := database.DB.First(&project, req.ProjectID); result.Error != nil {
		utils.NotFound(c, "报名项目不存在")
		return
	}

	var existingCart models.Cart
	result := database.DB.Where("user_id = ? AND project_id = ?", userID, req.ProjectID).First(&existingCart)

	if result.RowsAffected > 0 {
		quantity := existingCart.Quantity + 1
		if req.Quantity > 0 {
			quantity = existingCart.Quantity + req.Quantity
		}
		database.DB.Model(&existingCart).Update("quantity", quantity)
	} else {
		quantity := 1
		if req.Quantity > 0 {
			quantity = req.Quantity
		}
		cart := models.Cart{
			UserID:    userID,
			ProjectID: req.ProjectID,
			Quantity:  quantity,
		}
		database.DB.Create(&cart)
	}

	utils.SuccessWithMessage(c, "添加购物车成功", nil)
}

func GetCartList(c *gin.Context) {
	userID := c.GetUint("user_id")

	var cartItems []models.Cart
	database.DB.Where("user_id = ?", userID).Order("id DESC").Find(&cartItems)

	utils.Success(c, cartItems)
}

func UpdateCartItem(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var cartItem models.Cart
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&cartItem); result.Error != nil {
		utils.NotFound(c, "购物车项不存在")
		return
	}

	database.DB.Model(&cartItem).Update("quantity", req.Quantity)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func RemoveCartItem(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Cart{}); result.Error != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func CreateOrder(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		CartIDs []uint `json:"cart_ids"`
		AddressID uint   `json:"address_id"`
		Remark  string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var cartItems []models.Cart
	if len(req.CartIDs) > 0 {
		database.DB.Where("user_id = ? AND id IN ?", userID, req.CartIDs).Find(&cartItems)
	} else {
		database.DB.Where("user_id = ?", userID).Find(&cartItems)
	}

	if len(cartItems) == 0 {
		utils.BadRequest(c, "购物车为空")
		return
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		var project models.EnrollmentProject
		if result := database.DB.First(&project, item.ProjectID); result.Error != nil {
			continue
		}

		amount := project.Price * float64(item.Quantity)
		totalAmount += amount

		orderItems = append(orderItems, models.OrderItem{
			ProjectID:   project.ID,
			ProjectName: project.Name,
			Price:       project.Price,
			Quantity:    item.Quantity,
		})
	}

	orderNo := utils.GenerateOrderNo()
	order := models.Order{
		OrderNo:     orderNo,
		UserID:    userID,
		AddressID: req.AddressID,
		TotalAmount: totalAmount,
		Status:    "pending",
		Remark:    req.Remark,
	}

	database.DB.Create(&order)

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}
	database.DB.Create(&orderItems)

	database.DB.Where("user_id = ?", userID).Delete(&cartItems)

	utils.SuccessWithMessage(c, "订单创建成功", gin.H{
		"order_id": order.ID,
		"order_no": order.OrderNo,
	})
}

func GetOrderList(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")

	var orders []models.Order
	query := database.DB.Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("id DESC").Find(&orders)

	utils.Success(c, orders)
}

func GetOrderDetail(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var order models.Order
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	var orderItems []models.OrderItem
	database.DB.Where("order_id = ?", id).Find(&orderItems)

	utils.Success(c, gin.H{
		"order": order,
		"items": orderItems,
	})
}

func PayOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var order models.Order
	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&order); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "pending" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	database.DB.Model(&order).Updates(map[string]interface{}{
		"status":         "paid",
		"payment_time": &now,
	})

	utils.SuccessWithMessage(c, "支付成功", nil)
}

func AdminGetProjectList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var projects []models.EnrollmentProject
	var total int64

	query := database.DB.Model(&models.EnrollmentProject{})
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&projects)

	utils.Success(c, gin.H{
		"list":      projects,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminCreateProject(c *gin.Context) {
	var project models.EnrollmentProject
	if err := c.ShouldBindJSON(&project); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if result := database.DB.Create(&project); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "创建成功", project)
}

func AdminUpdateProject(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var project models.EnrollmentProject
	if result := database.DB.First(&project, id); result.Error != nil {
		utils.NotFound(c, "报名项目不存在")
		return
	}

	if err := c.ShouldBindJSON(&project); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	database.DB.Save(&project)
	utils.SuccessWithMessage(c, "更新成功", project)
}

func AdminDeleteProject(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.EnrollmentProject{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func AdminGetOrderList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var orders []models.Order
	var total int64

	query := database.DB.Model(&models.Order{})
	if keyword != "" {
		query = query.Where("order_no LIKE ?", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&orders)

	utils.Success(c, gin.H{
		"list":      orders,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminGetOrderDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var order models.Order
	if result := database.DB.First(&order, id); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	var orderItems []models.OrderItem
	database.DB.Where("order_id = ?", id).Find(&orderItems)

	utils.Success(c, gin.H{
		"order": order,
		"items": orderItems,
	})
}
