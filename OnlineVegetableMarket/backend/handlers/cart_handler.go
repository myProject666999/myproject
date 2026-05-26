package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"

	"vegetable-market/config"
	"vegetable-market/models"
)

type CartHandler struct{}

func NewCartHandler() *CartHandler {
	return &CartHandler{}
}

func (h *CartHandler) GetCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var items []models.CartItem
	if err := config.Cfg.DB.Preload("Product").Where("user_id = ?", userID).Find(&items).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch cart"})
	}

	var totalAmount float64
	var selectedCount int
	responses := make([]*models.CartItemResponse, 0, len(items))

	for _, item := range items {
		resp := item.ToResponse()
		responses = append(responses, resp)

		if item.Selected && item.Product != nil {
			selectedCount++
			totalAmount += item.Product.Price * item.Quantity
		}
	}

	return c.JSON(fiber.Map{
		"items":        responses,
		"total_amount": totalAmount,
		"selected_count": selectedCount,
		"total_count":  len(items),
	})
}

func (h *CartHandler) AddToCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var req models.CartAddRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var product models.Product
	if err := config.Cfg.DB.First(&product, req.ProductID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Product not found"})
	}

	var existing models.CartItem
	err := config.Cfg.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existing).Error
	if err == nil {
		existing.Quantity += req.Quantity
		if err := config.Cfg.DB.Save(&existing).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update cart"})
		}
		return c.JSON(fiber.Map{"item": existing.ToResponse()})
	}

	item := models.CartItem{
		UserID:    userID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
		Selected:  true,
	}

	if err := config.Cfg.DB.Create(&item).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add to cart"})
	}

	return c.JSON(fiber.Map{"item": item.ToResponse()})
}

func (h *CartHandler) UpdateCartItem(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid cart item ID"})
	}

	var req models.CartUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var item models.CartItem
	if err := config.Cfg.DB.Where("id = ? AND user_id = ?", id, userID).First(&item).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Cart item not found"})
	}

	updates := map[string]interface{}{}
	if req.Quantity > 0 {
		updates["quantity"] = req.Quantity
	}
	if req.Selected != nil {
		updates["selected"] = *req.Selected
	}

	if err := config.Cfg.DB.Model(&item).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update cart item"})
	}

	config.Cfg.DB.Preload("Product").First(&item, id)
	return c.JSON(fiber.Map{"item": item.ToResponse()})
}

func (h *CartHandler) RemoveFromCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid cart item ID"})
	}

	if err := config.Cfg.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.CartItem{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to remove from cart"})
	}

	return c.JSON(fiber.Map{"message": "Removed from cart"})
}

func (h *CartHandler) BatchUpdateSelect(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	var req models.CartBatchUpdateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Selected == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "selected is required"})
	}

	if err := config.Cfg.DB.Model(&models.CartItem{}).Where("user_id = ?", userID).Update("selected", *req.Selected).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update cart"})
	}

	return c.JSON(fiber.Map{"message": "Cart updated"})
}

func (h *CartHandler) ClearCart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint64)

	if err := config.Cfg.DB.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to clear cart"})
	}

	return c.JSON(fiber.Map{"message": "Cart cleared"})
}
