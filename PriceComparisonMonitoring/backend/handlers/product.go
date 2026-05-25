package handlers

import (
	"net/http"
	"price-monitor/database"
	"price-monitor/middleware"
	"price-monitor/models"
	"price-monitor/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct{}

type CreateProductRequest struct {
	Title         string  `json:"title" binding:"required,max=255"`
	ProductURL    string  `json:"product_url" binding:"required,max=500"`
	Platform      string  `json:"platform"`
	ImageURL      string  `json:"image_url"`
	CurrentPrice  float64 `json:"current_price"`
	OriginalPrice float64 `json:"original_price"`
	GroupID       *uint64 `json:"group_id"`
	Currency      string  `json:"currency"`
	CrawlInterval int     `json:"crawl_interval"`
	Remark        string  `json:"remark"`
}

type UpdateProductRequest struct {
	Title         string  `json:"title"`
	ProductURL    string  `json:"product_url"`
	Platform      string  `json:"platform"`
	ImageURL      string  `json:"image_url"`
	CurrentPrice  *float64 `json:"current_price"`
	OriginalPrice *float64 `json:"original_price"`
	GroupID       *uint64 `json:"group_id"`
	Currency      string  `json:"currency"`
	Status        *int8    `json:"status"`
	IsFavorite    *int8    `json:"is_favorite"`
	CrawlInterval int     `json:"crawl_interval"`
	Remark        string  `json:"remark"`
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	product := models.Product{
		UserID:        userID,
		Title:         req.Title,
		ProductURL:    req.ProductURL,
		Platform:      req.Platform,
		ImageURL:      req.ImageURL,
		GroupID:       req.GroupID,
		Currency:      req.Currency,
		Remark:        req.Remark,
		Status:        1,
		CrawlInterval: req.CrawlInterval,
	}

	if req.CurrentPrice > 0 {
		product.CurrentPrice = &req.CurrentPrice
		product.LowestPrice = &req.CurrentPrice
		product.HighestPrice = &req.CurrentPrice
	}
	if req.OriginalPrice > 0 {
		product.OriginalPrice = &req.OriginalPrice
	}
	if product.Currency == "" {
		product.Currency = "CNY"
	}
	if product.CrawlInterval == 0 {
		product.CrawlInterval = 3600
	}

	now := time.Now()
	product.LastCrawlAt = &now
	nextCrawl := now.Add(time.Duration(product.CrawlInterval) * time.Second)
	product.NextCrawlAt = &nextCrawl

	if err := database.DB.Create(&product).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "创建失败")
		return
	}

	if req.CurrentPrice > 0 {
		history := models.PriceHistory{
			ProductID:    product.ID,
			Price:        req.CurrentPrice,
			OriginalPrice: product.OriginalPrice,
			Source:       "manual",
		}
		if req.OriginalPrice > 0 {
			discount := (req.CurrentPrice / req.OriginalPrice) * 100
			product.CurrentPrice = &req.CurrentPrice
			history.Discount = &discount
		}
		database.DB.Create(&history)
	}

	utils.SendSuccess(c, product)
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	userID := middleware.GetUserID(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	groupID := c.Query("group_id")
	status := c.Query("status")
	isFavorite := c.Query("is_favorite")
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	db := database.DB.Model(&models.Product{}).Where("user_id = ?", userID)

	if groupID != "" {
		db = db.Where("group_id = ?", groupID)
	}
	if status != "" {
		db = db.Where("status = ?", status)
	}
	if isFavorite != "" {
		db = db.Where("is_favorite = ?", isFavorite)
	}
	if keyword != "" {
		db = db.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	db.Count(&total)

	var products []models.Product
	offset := (page - 1) * pageSize
	db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&products)

	utils.SendPage(c, products, total, page, pageSize)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	var histories []models.PriceHistory
	database.DB.Where("product_id = ?", product.ID).Order("crawled_at DESC").Limit(30).Find(&histories)
	product.PriceHistories = histories

	utils.SendSuccess(c, product)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	var req UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.ProductURL != "" {
		updates["product_url"] = req.ProductURL
	}
	if req.Platform != "" {
		updates["platform"] = req.Platform
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.CurrentPrice != nil {
		updates["current_price"] = *req.CurrentPrice
	}
	if req.OriginalPrice != nil {
		updates["original_price"] = *req.OriginalPrice
	}
	if req.GroupID != nil {
		updates["group_id"] = *req.GroupID
	}
	if req.Currency != "" {
		updates["currency"] = req.Currency
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	if req.IsFavorite != nil {
		updates["is_favorite"] = *req.IsFavorite
	}
	if req.CrawlInterval > 0 {
		updates["crawl_interval"] = req.CrawlInterval
	}
	if req.Remark != "" {
		updates["remark"] = req.Remark
	}

	if err := database.DB.Model(&product).Updates(updates).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "更新成功"})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	database.DB.Where("product_id = ?", product.ID).Delete(&models.PriceHistory{})
	database.DB.Where("product_id = ?", product.ID).Delete(&models.AlertSetting{})
	database.DB.Where("product_id = ?", product.ID).Delete(&models.AlertLog{})
	database.DB.Where("product_id = ?", product.ID).Delete(&models.CrawlLog{})
	database.DB.Delete(&product)

	utils.SendSuccess(c, gin.H{"message": "删除成功"})
}

func (h *ProductHandler) ToggleFavorite(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	newStatus := int8(1)
	if product.IsFavorite == 1 {
		newStatus = 0
	}

	database.DB.Model(&product).Update("is_favorite", newStatus)
	utils.SendSuccess(c, gin.H{"is_favorite": newStatus})
}

func (h *ProductHandler) GetPriceHistory(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "30"))
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 30
	}

	db := database.DB.Model(&models.PriceHistory{}).Where("product_id = ?", product.ID)

	if startDate != "" {
		db = db.Where("crawled_at >= ?", startDate)
	}
	if endDate != "" {
		db = db.Where("crawled_at <= ?", endDate)
	}

	var total int64
	db.Count(&total)

	var histories []models.PriceHistory
	offset := (page - 1) * pageSize
	db.Order("crawled_at DESC").Offset(offset).Limit(pageSize).Find(&histories)

	utils.SendPage(c, histories, total, page, pageSize)
}

func (h *ProductHandler) GetPriceTrend(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))
	if days < 1 {
		days = 7
	}
	if days > 365 {
		days = 365
	}

	startDate := time.Now().AddDate(0, 0, -days)

	var histories []models.PriceHistory
	database.DB.Where("product_id = ? AND crawled_at >= ?", product.ID, startDate).
		Order("crawled_at ASC").Find(&histories)

	type TrendPoint struct {
		Date  string  `json:"date"`
		Price float64 `json:"price"`
	}

	trend := make([]TrendPoint, 0)
	for _, h := range histories {
		trend = append(trend, TrendPoint{
			Date:  h.CrawledAt.Format("2006-01-02 15:04"),
			Price: h.Price,
		})
	}

	utils.SendSuccess(c, gin.H{
		"product": product,
		"trend":   trend,
	})
}
