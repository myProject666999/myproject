package handlers

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"

	"vegetable-market/config"
	"vegetable-market/models"
)

type InventoryHandler struct{}

func NewInventoryHandler() *InventoryHandler {
	return &InventoryHandler{}
}

func (h *InventoryHandler) GetInventory(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))
	productID := c.Query("product_id")

	db := config.Cfg.DB.Model(&models.DailyInventory{}).Where("inventory_date = ?", date)
	if productID != "" {
		db = db.Where("product_id = ?", productID)
	}

	var inventories []models.DailyInventory
	if err := db.Preload("Product").Order("product_id ASC").Find(&inventories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch inventory"})
	}

	return c.JSON(fiber.Map{"inventories": inventories})
}

func (h *InventoryHandler) UpdateInventory(c *fiber.Ctx) error {
	var req models.InventoryUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	inventoryDate, err := time.Parse("2006-01-02", req.InventoryDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid date format, use YYYY-MM-DD"})
	}

	var inv models.DailyInventory
	err = config.Cfg.DB.Where("product_id = ? AND inventory_date = ?", req.ProductID, inventoryDate).First(&inv).Error
	if err != nil {
		inv = models.DailyInventory{
			ProductID:         req.ProductID,
			InventoryDate:     inventoryDate,
			TotalQuantity:     req.TotalQuantity,
			RemainingQuantity: req.TotalQuantity,
		}
		if err := config.Cfg.DB.Create(&inv).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create inventory"})
		}
	} else {
		diff := req.TotalQuantity - inv.TotalQuantity
		inv.TotalQuantity = req.TotalQuantity
		inv.RemainingQuantity += diff
		if inv.RemainingQuantity < 0 {
			inv.RemainingQuantity = 0
		}
		if err := config.Cfg.DB.Save(&inv).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update inventory"})
		}
	}

	ctx := context.Background()
	cacheKey := fmt.Sprintf("inventory:%d:%s", req.ProductID, req.InventoryDate)
	config.Cfg.Redis.Set(ctx, cacheKey, inv.RemainingQuantity, 24*time.Hour)

	return c.JSON(fiber.Map{"inventory": inv})
}

func (h *InventoryHandler) GetInventoryByProduct(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid product ID"})
	}

	date := c.Query("date", time.Now().Format("2006-01-02"))

	var inv models.DailyInventory
	if err := config.Cfg.DB.Where("product_id = ? AND inventory_date = ?", id, date).First(&inv).Error; err != nil {
		return c.JSON(fiber.Map{"inventory": nil, "message": "No inventory record for this date"})
	}

	return c.JSON(fiber.Map{"inventory": inv})
}
