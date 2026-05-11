package controllers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func AdminGetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	db := config.GetDB()
	query := db.Model(&models.User{})

	if keyword != "" {
		query = query.Where("username LIKE ? OR email LIKE ? OR nickname LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int
	query.Count(&total)

	var users []models.User
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&users)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      users,
	})
}

func AdminCreateUser(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Role     string `json:"role"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()

	var existingUser models.User
	if db.Where("username = ?", req.Username).First(&existingUser).RecordNotFound() == false {
		utils.BadRequest(c, "用户名已存在")
		return
	}

	role := "user"
	if req.Role == "admin" {
		role = "admin"
	}

	user := models.User{
		Username: req.Username,
		Password: req.Password,
		Nickname: req.Nickname,
		Email:    req.Email,
		Phone:    req.Phone,
		Role:     role,
	}

	if err := db.Create(&user).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, user)
}

func AdminUpdateUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var updateData map[string]interface{}
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	delete(updateData, "password")
	delete(updateData, "id")

	db := config.GetDB()
	if err := db.Model(&models.User{}).Where("id = ?", id).Updates(updateData).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	var user models.User
	db.First(&user, id)
	utils.Success(c, user)
}

func AdminDeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.User{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func AdminGetAllOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	db := config.GetDB()
	query := db.Model(&models.Order{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int
	query.Count(&total)

	var orders []models.Order
	query.Preload("User").Preload("OrderItems").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&orders)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      orders,
	})
}

func AdminShipOrder(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "paid" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	order.Status = "shipped"
	order.ShippedAt = &now
	db.Save(&order)

	utils.SuccessWithMessage(c, "发货成功", nil)
}

func AdminRefundOrder(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var order models.Order
	if err := db.First(&order, id).Error; err != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != "paid" && order.Status != "shipped" {
		utils.BadRequest(c, "订单状态不正确")
		return
	}

	now := time.Now()
	order.Status = "refunded"
	order.CanceledAt = &now
	db.Save(&order)

	utils.SuccessWithMessage(c, "退款成功", nil)
}

func AdminGetAllAdoptions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	db := config.GetDB()
	query := db.Model(&models.Adoption{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int
	query.Count(&total)

	var adoptions []models.Adoption
	query.Preload("User").Preload("Pet").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&adoptions)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      adoptions,
	})
}

func AdminUpdateAdoptionStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status string `json:"status" binding:"required"`
		Remark string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	var adoption models.Adoption
	if err := db.First(&adoption, id).Error; err != nil {
		utils.NotFound(c, "领养申请不存在")
		return
	}

	adoption.Status = req.Status
	adoption.Remark = req.Remark
	db.Save(&adoption)

	if req.Status == "approved" {
		db.Model(&models.Pet{}).Where("id = ?", adoption.PetID).Update("adopted", true)
	}

	utils.Success(c, adoption)
}

func AdminGetAllBoardings(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	db := config.GetDB()
	query := db.Model(&models.Boarding{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int
	query.Count(&total)

	var boardings []models.Boarding
	query.Preload("User").Preload("Shop").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&boardings)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      boardings,
	})
}

func AdminUpdateBoardingStatus(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req struct {
		Status string `json:"status" binding:"required"`
		Remark string `json:"remark"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	var boarding models.Boarding
	if err := db.First(&boarding, id).Error; err != nil {
		utils.NotFound(c, "寄存申请不存在")
		return
	}

	boarding.Status = req.Status
	boarding.Remark = req.Remark
	db.Save(&boarding)

	utils.Success(c, boarding)
}

func AdminApproveBoarding(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var boarding models.Boarding
	if err := db.First(&boarding, id).Error; err != nil {
		utils.NotFound(c, "寄存申请不存在")
		return
	}

	boarding.Status = "approved"
	db.Save(&boarding)

	utils.SuccessWithMessage(c, "已通过", nil)
}

func AdminRejectBoarding(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var boarding models.Boarding
	if err := db.First(&boarding, id).Error; err != nil {
		utils.NotFound(c, "寄存申请不存在")
		return
	}

	boarding.Status = "rejected"
	db.Save(&boarding)

	utils.SuccessWithMessage(c, "已拒绝", nil)
}

func AdminGetDashboardStats(c *gin.Context) {
	db := config.GetDB()

	var userCount int
	db.Model(&models.User{}).Where("role = ?", "user").Count(&userCount)

	var productCount int
	db.Model(&models.Product{}).Count(&productCount)

	var petCount int
	db.Model(&models.Pet{}).Where("adopted = ?", false).Count(&petCount)

	var orderCount int
	db.Model(&models.Order{}).Count(&orderCount)

	var totalSales float64
	db.Model(&models.Order{}).Where("status IN ?", []string{"paid", "shipped", "completed"}).Select("COALESCE(SUM(total_amount), 0)").Scan(&totalSales)

	var pendingAdoptions int
	db.Model(&models.Adoption{}).Where("status = ?", "pending").Count(&pendingAdoptions)

	var pendingBoardings int
	db.Model(&models.Boarding{}).Where("status = ?", "pending").Count(&pendingBoardings)

	utils.Success(c, gin.H{
		"user_count":        userCount,
		"product_count":     productCount,
		"pet_count":         petCount,
		"order_count":       orderCount,
		"total_sales":       totalSales,
		"pending_adoptions": pendingAdoptions,
		"pending_boardings": pendingBoardings,
	})
}
