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

type BorrowHandler struct {
	mu sync.Mutex
}

func NewBorrowHandler() *BorrowHandler {
	return &BorrowHandler{}
}

func (h *BorrowHandler) GetBorrows(c *fiber.Ctx) error {
	var borrows []models.Borrow
	status := c.Query("status")
	itemID := c.Query("item_id")
	borrowerID := c.Query("borrower_id")

	query := database.DB.Preload("Item")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if itemID != "" {
		query = query.Where("item_id = ?", itemID)
	}
	if borrowerID != "" {
		query = query.Where("borrower_id = ?", borrowerID)
	}

	if err := query.Order("id DESC").Find(&borrows).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "获取借用记录失败",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    borrows,
	})
}

func (h *BorrowHandler) GetBorrow(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var borrow models.Borrow
	if err := database.DB.Preload("Item").First(&borrow, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "借用记录不存在",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    borrow,
	})
}

func (h *BorrowHandler) CreateBorrow(c *fiber.Ctx) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	var borrow models.Borrow
	if err := c.BodyParser(&borrow); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的请求数据",
		})
	}

	if borrow.ItemID == 0 || borrow.BorrowerName == "" || borrow.BorrowerID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "物品ID、借用人姓名和学号不能为空",
		})
	}

	if borrow.BorrowDate.IsZero() {
		borrow.BorrowDate = time.Now()
	}
	if borrow.ExpectedReturnDate.IsZero() {
		borrow.ExpectedReturnDate = borrow.BorrowDate.AddDate(0, 0, 7)
	}
	if borrow.ExpectedReturnDate.Before(borrow.BorrowDate) {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "预计归还日期不能早于借出日期",
		})
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var item models.Item
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&item, borrow.ItemID).Error; err != nil {
			return errors.New("物品不存在")
		}

		if item.Quantity <= 0 {
			return errors.New("该物品已全部借出，库存不足")
		}

		if item.Status == models.ItemStatusDamaged {
			return errors.New("该物品已损坏，无法借出")
		}

		borrow.Status = models.BorrowStatusBorrowed
		if err := tx.Create(&borrow).Error; err != nil {
			return errors.New("创建借用记录失败")
		}

		item.Quantity--
		if item.Quantity == 0 {
			item.Status = models.ItemStatusBorrowed
		}
		if err := tx.Save(&item).Error; err != nil {
			return errors.New("更新物品库存失败")
		}

		var reservation models.Reservation
		result := tx.Where("item_id = ? AND reserver_id = ? AND status = ?", borrow.ItemID, borrow.BorrowerID, models.ReservationStatusActive).First(&reservation)
		if result.Error == nil {
			reservation.Status = models.ReservationStatusCompleted
			tx.Save(&reservation)
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
		"message": "借出成功",
		"data":    borrow,
	})
}

func (h *BorrowHandler) ReturnItem(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "无效的ID",
		})
	}

	var returnData struct {
		Remark string `json:"remark"`
	}
	if err := c.BodyParser(&returnData); err == nil {
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		var borrow models.Borrow
		if err := tx.First(&borrow, id).Error; err != nil {
			return errors.New("借用记录不存在")
		}

		if borrow.Status == models.BorrowStatusReturned {
			return errors.New("该物品已归还")
		}

		now := time.Now()
		borrow.ActualReturnDate = &now
		borrow.Status = models.BorrowStatusReturned
		if returnData.Remark != "" {
			borrow.Remark = returnData.Remark
		}
		if err := tx.Save(&borrow).Error; err != nil {
			return errors.New("更新借用记录失败")
		}

		var item models.Item
		if err := tx.First(&item, borrow.ItemID).Error; err != nil {
			return errors.New("物品不存在")
		}

		item.Quantity++
		if item.Quantity > 0 && item.Status == models.ItemStatusBorrowed {
			item.Status = models.ItemStatusAvailable
		}
		if err := tx.Save(&item).Error; err != nil {
			return errors.New("更新物品库存失败")
		}

		var waitingReservation models.Reservation
		result := tx.Where("item_id = ? AND status = ?", borrow.ItemID, models.ReservationStatusWaiting).
			Order("queue_position ASC").
			First(&waitingReservation)
		if result.Error == nil {
			waitingReservation.Status = models.ReservationStatusActive
			tx.Save(&waitingReservation)
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
		"message": "归还成功",
	})
}

func (h *BorrowHandler) GetBorrowStats(c *fiber.Ctx) error {
	var totalBorrows int64
	var activeBorrows int64
	var overdueBorrows int64
	var returnedBorrows int64

	database.DB.Model(&models.Borrow{}).Count(&totalBorrows)
	database.DB.Model(&models.Borrow{}).Where("status = ?", models.BorrowStatusBorrowed).Count(&activeBorrows)
	database.DB.Model(&models.Borrow{}).Where("status = ?", models.BorrowStatusOverdue).Count(&overdueBorrows)
	database.DB.Model(&models.Borrow{}).Where("status = ?", models.BorrowStatusReturned).Count(&returnedBorrows)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"total_borrows":    totalBorrows,
			"active_borrows":   activeBorrows,
			"overdue_borrows":  overdueBorrows,
			"returned_borrows": returnedBorrows,
		},
	})
}
