package controllers

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAdminUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.User{}).Where("role = ?", "user")

	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ? OR email LIKE ?", 
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var users []models.User
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&users)

	utils.Success(c, utils.PageResult{
		List:     users,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func DeleteAdminUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if result := config.DB.Where("id = ? AND role = ?", id, "user").First(&user); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	config.DB.Delete(&user)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func UpdateUserStatus(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if result := config.DB.First(&user, id); result.Error != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	config.DB.Model(&user).Update("status", req.Status)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func GetAdminCategories(c *gin.Context) {
	var categories []models.Category
	config.DB.Order("sort ASC, id ASC").Find(&categories)

	utils.Success(c, categories)
}

func CreateCategory(c *gin.Context) {
	var req models.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if result := config.DB.Create(&req); result.Error != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, req)
}

func UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var req models.Category
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var category models.Category
	if result := config.DB.First(&category, id); result.Error != nil {
		utils.NotFound(c, "分类不存在")
		return
	}

	config.DB.Model(&category).Updates(req)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	var category models.Category
	if result := config.DB.First(&category, id); result.Error != nil {
		utils.NotFound(c, "分类不存在")
		return
	}

	var count int64
	config.DB.Model(&models.Product{}).Where("category_id = ?", id).Count(&count)
	if count > 0 {
		utils.BadRequest(c, "该分类下有商品，无法删除")
		return
	}

	config.DB.Delete(&category)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetAdminProducts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	categoryID := c.Query("category_id")
	status := c.Query("status")

	query := config.DB.Model(&models.Product{}).Preload("Category")

	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var products []models.Product
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&products)

	utils.Success(c, utils.PageResult{
		List:     products,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func CreateProduct(c *gin.Context) {
	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if result := config.DB.Create(&req); result.Error != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, req)
}

func UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	var req models.Product
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var product models.Product
	if result := config.DB.First(&product, id); result.Error != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	config.DB.Model(&product).Updates(req)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	var product models.Product
	if result := config.DB.First(&product, id); result.Error != nil {
		utils.NotFound(c, "商品不存在")
		return
	}

	config.DB.Delete(&product)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetProductCommentsAdmin(c *gin.Context) {
	productID := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := config.DB.Model(&models.Comment{}).Where("product_id = ?", productID).Preload("User")

	var total int64
	query.Count(&total)

	var comments []models.Comment
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&comments)

	utils.Success(c, utils.PageResult{
		List:     comments,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")

	var comment models.Comment
	if result := config.DB.First(&comment, id); result.Error != nil {
		utils.NotFound(c, "评论不存在")
		return
	}

	config.DB.Delete(&comment)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetBanners(c *gin.Context) {
	var banners []models.Banner
	config.DB.Order("sort ASC, created_at DESC").Find(&banners)

	utils.Success(c, banners)
}

func CreateBanner(c *gin.Context) {
	var req models.Banner
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if result := config.DB.Create(&req); result.Error != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, req)
}

func UpdateBanner(c *gin.Context) {
	id := c.Param("id")

	var req models.Banner
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var banner models.Banner
	if result := config.DB.First(&banner, id); result.Error != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	config.DB.Model(&banner).Updates(req)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteBanner(c *gin.Context) {
	id := c.Param("id")

	var banner models.Banner
	if result := config.DB.First(&banner, id); result.Error != nil {
		utils.NotFound(c, "轮播图不存在")
		return
	}

	config.DB.Delete(&banner)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetPublicBanners(c *gin.Context) {
	var banners []models.Banner
	config.DB.Where("status = 1").Order("sort ASC, created_at DESC").Find(&banners)

	utils.Success(c, banners)
}

func GetAdminNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.News{})

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var news []models.News
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&news)

	utils.Success(c, utils.PageResult{
		List:     news,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func GetPublicNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.News{}).Where("status = 1")

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var news []models.News
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&news)

	utils.Success(c, utils.PageResult{
		List:     news,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func GetNewsDetail(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if result := config.DB.Where("id = ? AND status = 1", id).First(&news); result.Error != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	config.DB.Model(&news).Update("views", news.Views+1)

	utils.Success(c, news)
}

func CreateNews(c *gin.Context) {
	var req models.News
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if result := config.DB.Create(&req); result.Error != nil {
		utils.ServerError(c, "创建失败")
		return
	}

	utils.Success(c, req)
}

func UpdateNews(c *gin.Context) {
	id := c.Param("id")

	var req models.News
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var news models.News
	if result := config.DB.First(&news, id); result.Error != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	config.DB.Model(&news).Updates(req)

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func DeleteNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if result := config.DB.First(&news, id); result.Error != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	config.DB.Delete(&news)

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetAdminOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	orderNo := c.Query("order_no")
	status := c.Query("status")

	query := config.DB.Model(&models.Order{}).Preload("Items").Preload("User")

	if orderNo != "" {
		query = query.Where("order_no LIKE ?", "%"+orderNo+"%")
	}
	if status != "" {
		statusInt, _ := strconv.Atoi(status)
		query = query.Where("status = ?", statusInt)
	}

	var total int64
	query.Count(&total)

	var orders []models.Order
	offset := (page - 1) * pageSize
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&orders)

	utils.Success(c, utils.PageResult{
		List:     orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	})
}

func GetAdminOrder(c *gin.Context) {
	id := c.Param("id")

	var order models.Order
	if result := config.DB.Preload("Items").Preload("User").First(&order, id); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	utils.Success(c, order)
}

func ShipOrder(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		TrackingNumber string `json:"tracking_number"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var order models.Order
	if result := config.DB.First(&order, id); result.Error != nil {
		utils.NotFound(c, "订单不存在")
		return
	}

	if order.Status != OrderStatusPaid {
		utils.BadRequest(c, "订单状态不允许发货")
		return
	}

	now := time.Now()
	config.DB.Model(&order).Updates(map[string]interface{}{
		"status":          OrderStatusShipped,
		"tracking_number": req.TrackingNumber,
		"shipping_time":   &now,
	})

	utils.SuccessWithMessage(c, "发货成功", nil)
}

func DashboardStats(c *gin.Context) {
	var userCount, productCount, orderCount int64
	var todayRevenue float64

	config.DB.Model(&models.User{}).Where("role = ?", "user").Count(&userCount)
	config.DB.Model(&models.Product{}).Where("status = 1").Count(&productCount)
	config.DB.Model(&models.Order{}).Count(&orderCount)

	today := time.Now().Format("2006-01-02")
	var todayOrderItems []struct {
		TotalPrice float64
	}
	config.DB.Model(&models.Order{}).Select("total_price").
		Where("DATE(created_at) = ? AND status >= ?", today, OrderStatusPaid).
		Scan(&todayOrderItems)

	for _, item := range todayOrderItems {
		todayRevenue += item.TotalPrice
	}

	utils.Success(c, gin.H{
		"user_count":     userCount,
		"product_count":  productCount,
		"order_count":    orderCount,
		"today_revenue":  todayRevenue,
	})
}
