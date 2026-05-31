package handlers

import (
	"errors"
	"online-borrowing-returning/database"
	"online-borrowing-returning/models"
	"strconv"
	"sync"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type ReservationHandler struct {
	mu sync.Mutex
}

func NewReservationHandler() *ReservationHandler {
	return &ReservationHandler{}
}

func (h *ReservationHandler) GetReservations(c *fiber.Ctx) error {
	var reservations []models.Reservation
	status := c.Query("status")
	itemID := c.Query("item_id")
	reserverID := c.Query("reserver_id")

	query := database.DB.Preload("Item")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if itemID != "" {
		query = query.Where("item_id = ?", itemID)
	}
	if reserverID != "" {
		query = query.Where("reserver_id = ?", reserverID)
	}

	if err := query.Order("queue_position ASC").Find(&reservations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "获取预约列表失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reservations,
	})
}

func (h *ReservationHandler) GetReservation(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var reservation models.Reservation
	if err := database.DB.Preload("Item").First(&reservation, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "预约记录不存在",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reservation,
	})
}

func (h *ReservationHandler) CreateReservation(c *fiber.Ctx) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	var reservation models.Reservation
	if err := c.BodyParser(&reservation); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的请求数据",
		})
	}

	if reservation.ItemID == 0 || reservation.ReserverName == "" || reservation.ReserverID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "物品ID、预约人姓名和学号不能为空",
		})
	}

	if reservation.ReserveDate.IsZero() {
		reservation.ReserveDate = time.Now()
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var item models.Item
		if err := tx.First(&item, reservation.ItemID).Error; err != nil {
			return errors.New("物品不存在")
		}

		if item.Status == models.ItemStatusDamaged {
			return errors.New("该物品已损坏，无法预约")
		}

		var existingReservation models.Reservation
		result := tx.Where("item_id = ? AND reserver_id = ? AND status IN ?",
			reservation.ItemID, reservation.ReserverID,
			[]string{string(models.ReservationStatusWaiting), string(models.ReservationStatusActive)}).
			First(&existingReservation)
		if result.Error == nil {
			return errors.New("您已预约过该物品")
		}

		var activeBorrow models.Borrow
		result = tx.Where("item_id = ? AND borrower_id = ? AND status = ?",
			reservation.ItemID, reservation.ReserverID, models.BorrowStatusBorrowed).
			First(&activeBorrow)
		if result.Error == nil {
			return errors.New("您已借有该物品，无需预约")
		}

		var waitingCount int64
		tx.Model(&models.Reservation{}).Where("item_id = ? AND status = ?", reservation.ItemID, models.ReservationStatusWaiting).Count(&waitingCount)

		var activeCount int64
		tx.Model(&models.Reservation{}).Where("item_id = ? AND status = ?", reservation.ItemID, models.ReservationStatusActive).Count(&activeCount)

		reservation.QueuePosition = int(waitingCount + activeCount + 1)

		if item.Quantity > 0 && activeCount == 0 {
			reservation.Status = models.ReservationStatusActive
			reservation.ExpiryDate = time.Now().AddDate(0, 0, 1)
		} else {
			reservation.Status = models.ReservationStatusWaiting
		}

		if err := tx.Create(&reservation).Error; err != nil {
			return errors.New("创建预约失败")
		}

		return nil
	})

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "预约成功",
		"data":    reservation,
	})
}

func (h *ReservationHandler) CancelReservation(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		var reservation models.Reservation
		if err := tx.First(&reservation, id).Error; err != nil {
			return errors.New("预约记录不存在")
		}

		if reservation.Status == models.ReservationStatusCompleted || reservation.Status == models.ReservationStatusCancelled {
			return errors.New("预约已完成或已取消")
		}

		reservation.Status = models.ReservationStatusCancelled
		if err := tx.Save(&reservation).Error; err != nil {
			return errors.New("取消预约失败")
		}

		if reservation.Status == models.ReservationStatusActive {
			var nextReservation models.Reservation
			result := tx.Where("item_id = ? AND status = ? AND queue_position > ?",
				reservation.ItemID, models.ReservationStatusWaiting, reservation.QueuePosition).
				Order("queue_position ASC").
				First(&nextReservation)
			if result.Error == nil {
				nextReservation.Status = models.ReservationStatusActive
				nextReservation.ExpiryDate = time.Now().AddDate(0, 0, 1)
				tx.Save(&nextReservation)
			}
		}

		return nil
	})

	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "取消预约成功",
	})
}

func (h *ReservationHandler) GetItemReservationQueue(c *fiber.Ctx) error {
	itemID, err := strconv.ParseUint(c.Params("itemId"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的物品ID",
		})
	}

	var reservations []models.Reservation
	if err := database.DB.Preload("Item").
		Where("item_id = ? AND status IN ?", itemID, []string{string(models.ReservationStatusWaiting), string(models.ReservationStatusActive)}).
		Order("queue_position ASC").
		Find(&reservations).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "获取预约队列失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reservations,
	})
}
