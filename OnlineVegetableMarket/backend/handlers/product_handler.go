package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"

	"vegetable-market/config"
	"vegetable-market/models"
)

type ProductHandler struct{}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

func (h *ProductHandler) GetCategories(c *fiber.Ctx) error {
	var categories []models.Category
	if err := config.Cfg.DB.Order("sort ASC").Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch categories"})
	}
	return c.JSON(fiber.Map{"categories": categories})
}

func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	var query models.ProductListQuery
	if err := c.QueryParser(&query); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid query parameters"})
	}

	if query.Page <= 0 {
		query.Page = 1
	}
	if query.PageSize <= 0 {
		query.PageSize = 20
	}

	db := config.Cfg.DB.Model(&models.Product{}).Where("status = ?", "on_sale")

	if query.CategoryID > 0 {
		db = db.Where("category_id = ?", query.CategoryID)
	}
	if query.Keyword != "" {
		db = db.Where("name LIKE ?", "%"+query.Keyword+"%")
	}

	var total int64
	db.Count(&total)

	var products []models.Product
	offset := (query.Page - 1) * query.PageSize
	if err := db.Preload("Category").Order("sort ASC").Offset(offset).Limit(query.PageSize).Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch products"})
	}

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")

	for i := range products {
		cacheKey := fmt.Sprintf("inventory:%d:%s", products[i].ID, today)
		stockStr, err := config.Cfg.Redis.Get(ctx, cacheKey).Result()
		if err == redis.Nil {
			var inv models.DailyInventory
			if err := config.Cfg.DB.Where("product_id = ? AND inventory_date = ?", products[i].ID, today).First(&inv).Error; err == nil {
				products[i].TodayStock = inv.RemainingQuantity
				config.Cfg.Redis.Set(ctx, cacheKey, inv.RemainingQuantity, 24*time.Hour)
			} else {
				products[i].TodayStock = products[i].TodayStock
			}
		} else if err == nil {
			stock, _ := strconv.ParseFloat(stockStr, 64)
			products[i].TodayStock = stock
		}
	}

	return c.JSON(fiber.Map{
		"products": products,
		"total":    total,
		"page":     query.Page,
		"pageSize": query.PageSize,
	})
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	var product models.Product
	if err := config.Cfg.DB.Preload("Category").First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	ctx := context.Background()
	today := time.Now().Format("2006-01-02")
	cacheKey := fmt.Sprintf("inventory:%d:%s", product.ID, today)
	stockStr, err := config.Cfg.Redis.Get(ctx, cacheKey).Result()
	if err == redis.Nil {
		var inv models.DailyInventory
		if err := config.Cfg.DB.Where("product_id = ? AND inventory_date = ?", product.ID, today).First(&inv).Error; err == nil {
			product.TodayStock = inv.RemainingQuantity
			config.Cfg.Redis.Set(ctx, cacheKey, inv.RemainingQuantity, 24*time.Hour)
		}
	} else if err == nil {
		stock, _ := strconv.ParseFloat(stockStr, 64)
		product.TodayStock = stock
	}

	return c.JSON(fiber.Map{"product": product})
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var req models.ProductCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	product := models.Product{
		CategoryID:  req.CategoryID,
		Name:        req.Name,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		PriceUnit:   req.PriceUnit,
		Price:       req.Price,
		UnitWeight:  req.UnitWeight,
		Origin:      req.Origin,
		Status:      "on_sale",
		Sort:        req.Sort,
	}
	if req.Status != "" {
		product.Status = req.Status
	}

	if err := config.Cfg.DB.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create product"})
	}

	return c.JSON(fiber.Map{"product": product})
}

func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	var req models.ProductUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var product models.Product
	if err := config.Cfg.DB.First(&product, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	updates := map[string]interface{}{}
	if req.CategoryID > 0 {
		updates["category_id"] = req.CategoryID
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.PriceUnit != "" {
		updates["price_unit"] = req.PriceUnit
	}
	if req.Price > 0 {
		updates["price"] = req.Price
	}
	if req.Origin != "" {
		updates["origin"] = req.Origin
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.Sort > 0 {
		updates["sort"] = req.Sort
	}

	if err := config.Cfg.DB.Model(&product).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update product"})
	}

	config.Cfg.DB.First(&product, id)
	return c.JSON(fiber.Map{"product": product})
}

func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	if err := config.Cfg.DB.Delete(&models.Product{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete product"})
	}

	return c.JSON(fiber.Map{"message": "Product deleted successfully"})
}
