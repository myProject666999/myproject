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

type DeliverySlotHandler struct{}

func NewDeliverySlotHandler() *DeliverySlotHandler {
	return &DeliverySlotHandler{}
}

func (h *DeliverySlotHandler) GetSlots(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))

	ctx := context.Background()

	var slots []models.DeliverySlot
	if err := config.Cfg.DB.Where("DATE(slot_date) = ? AND status != ?", date, "disabled").
		Order("start_time ASC").Find(&slots).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch delivery slots"})
	}

	for i := range slots {
		cacheKey := fmt.Sprintf("slot:%d", slots[i].ID)
		currentOrders, err := config.Cfg.Redis.Get(ctx, cacheKey).Int()
		if err == nil {
			slots[i].CurrentOrders = currentOrders
		}
	}

	return c.JSON(fiber.Map{"slots": slots})
}

func (h *DeliverySlotHandler) GetAvailableSlots(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))

	ctx := context.Background()

	var slots []models.DeliverySlot
	if err := config.Cfg.DB.Where("DATE(slot_date) = ? AND status = ? AND current_orders < max_orders", date, "available").
		Order("start_time ASC").Find(&slots).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch delivery slots"})
	}

	for i := range slots {
		cacheKey := fmt.Sprintf("slot:%d", slots[i].ID)
		currentOrders, err := config.Cfg.Redis.Get(ctx, cacheKey).Int()
		if err == nil {
			slots[i].CurrentOrders = currentOrders
		}
		slots[i].MaxOrders = slots[i].MaxOrders - slots[i].CurrentOrders
	}

	return c.JSON(fiber.Map{"slots": slots})
}

func (h *DeliverySlotHandler) CreateSlot(c *fiber.Ctx) error {
	var req models.SlotCreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	slotDate, err := time.Parse("2006-01-02", req.SlotDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid date format"})
	}

	slot := models.DeliverySlot{
		SlotDate:      slotDate,
		StartTime:     req.StartTime,
		EndTime:       req.EndTime,
		MaxOrders:     req.MaxOrders,
		CurrentOrders: 0,
		Status:        "available",
	}

	if err := config.Cfg.DB.Create(&slot).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create delivery slot"})
	}

	ctx := context.Background()
	cacheKey := fmt.Sprintf("slot:%d", slot.ID)
	config.Cfg.Redis.Set(ctx, cacheKey, 0, 24*time.Hour)

	return c.JSON(fiber.Map{"slot": slot})
}

func (h *DeliverySlotHandler) UpdateSlot(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid slot ID"})
	}

	var req struct {
		MaxOrders int    `json:"max_orders"`
		Status    string `json:"status"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var slot models.DeliverySlot
	if err := config.Cfg.DB.First(&slot, id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Slot not found"})
	}

	updates := map[string]interface{}{}
	if req.MaxOrders > 0 {
		updates["max_orders"] = req.MaxOrders
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	if err := config.Cfg.DB.Model(&slot).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update slot"})
	}

	config.Cfg.DB.First(&slot, id)
	return c.JSON(fiber.Map{"slot": slot})
}

func (h *DeliverySlotHandler) DeleteSlot(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid slot ID"})
	}

	if err := config.Cfg.DB.Delete(&models.DeliverySlot{}, id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete slot"})
	}

	ctx := context.Background()
	cacheKey := fmt.Sprintf("slot:%d", id)
	config.Cfg.Redis.Del(ctx, cacheKey)

	return c.JSON(fiber.Map{"message": "Slot deleted"})
}

func (h *DeliverySlotHandler) GenerateWeeklySlots(c *fiber.Ctx) error {
	var req struct {
		StartDate string `json:"start_date" validate:"required"`
		Days      int    `json:"days"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Days <= 0 {
		req.Days = 7
	}

	startDate, err := time.Parse("2006-01-02", req.StartDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid date format"})
	}

	timeSlots := []struct {
		Start string
		End   string
		Max   int
	}{
		{"08:00:00", "10:00:00", 20},
		{"10:00:00", "12:00:00", 20},
		{"14:00:00", "16:00:00", 20},
		{"16:00:00", "18:00:00", 20},
		{"18:00:00", "20:00:00", 20},
	}

	var createdSlots []models.DeliverySlot
	ctx := context.Background()

	for d := 0; d < req.Days; d++ {
		slotDate := startDate.AddDate(0, 0, d)
		for _, ts := range timeSlots {
			slot := models.DeliverySlot{
				SlotDate:      slotDate,
				StartTime:     ts.Start,
				EndTime:       ts.End,
				MaxOrders:     ts.Max,
				CurrentOrders: 0,
				Status:        "available",
			}
			if err := config.Cfg.DB.Create(&slot).Error; err == nil {
				createdSlots = append(createdSlots, slot)
				cacheKey := fmt.Sprintf("slot:%d", slot.ID)
				config.Cfg.Redis.Set(ctx, cacheKey, 0, 24*time.Hour*time.Duration(req.Days))
			}
		}
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Generated %d slots for %d days", len(createdSlots), req.Days),
		"count":   len(createdSlots),
	})
}
