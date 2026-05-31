package handlers

import (
	"online-borrowing-returning/database"
	"online-borrowing-returning/models"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type ItemHandler struct{}

func NewItemHandler() *ItemHandler {
	return &ItemHandler{}
}

func (h *ItemHandler) GetItems(c *fiber.Ctx) error {
	var items []models.Item
	category := c.Query("category")
	keyword := c.Query("keyword")

	query := database.DB.Model(&models.Item{})

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Order("id DESC").Find(&items).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "获取物品列表失败",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    items,
	})
}

func (h *ItemHandler) GetItem(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var item models.Item
	if err := database.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "物品不存在",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    item,
	})
}

func (h *ItemHandler) CreateItem(c *fiber.Ctx) error {
	var item models.Item
	if err := c.BodyParser(&item); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的请求数据",
		})
	}

	if item.Name == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "物品名称不能为空",
		})
	}

	if item.TotalQuantity <= 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "物品总数必须大于0",
		})
	}

	item.Quantity = item.TotalQuantity
	if item.Status == "" {
		item.Status = models.ItemStatusAvailable
	}

	if err := database.DB.Create(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "创建物品失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "创建物品成功",
		"data":    item,
	})
}

func (h *ItemHandler) UpdateItem(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var item models.Item
	if err := database.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "物品不存在",
		})
	}

	var updateData models.Item
	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的请求数据",
		})
	}

	borrowedCount := item.TotalQuantity - item.Quantity
	if updateData.TotalQuantity < borrowedCount {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "物品总数不能小于已借出数量",
		})
	}

	item.Name = updateData.Name
	item.Description = updateData.Description
	item.Category = updateData.Category
	item.TotalQuantity = updateData.TotalQuantity
	item.Quantity = updateData.TotalQuantity - borrowedCount
	item.Status = updateData.Status
	item.Location = updateData.Location
	item.ImageURL = updateData.ImageURL

	if err := database.DB.Save(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "更新物品失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "更新物品成功",
		"data":    item,
	})
}

func (h *ItemHandler) DeleteItem(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var item models.Item
	if err := database.DB.First(&item, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "物品不存在",
		})
	}

	var activeBorrows int64
	database.DB.Model(&models.Borrow{}).Where("item_id = ? AND status = ?", id, models.BorrowStatusBorrowed).Count(&activeBorrows)
	if activeBorrows > 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "该物品还有未归还的借出记录，无法删除",
		})
	}

	if err := database.DB.Delete(&item).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "删除物品失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "删除物品成功",
	})
}

func (h *ItemHandler) GetItemStats(c *fiber.Ctx) error {
	var totalItems int64
	var availableItems int64
	var borrowedItems int64
	var damagedItems int64

	database.DB.Model(&models.Item{}).Count(&totalItems)
	database.DB.Model(&models.Item{}).Where("status = ?", models.ItemStatusAvailable).Count(&availableItems)
	database.DB.Model(&models.Borrow{}).Where("status = ?", models.BorrowStatusBorrowed).Count(&borrowedItems)
	database.DB.Model(&models.Item{}).Where("status = ?", models.ItemStatusDamaged).Count(&damagedItems)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_items":     totalItems,
			"available_items": availableItems,
			"borrowed_items":  borrowedItems,
			"damaged_items":   damagedItems,
		},
	})
}
