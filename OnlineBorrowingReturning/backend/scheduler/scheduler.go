package scheduler

import (
	"log"
	"online-borrowing-returning/database"
	"online-borrowing-returning/models"
	"time"
)

func StartScheduler() {
	log.Println("Scheduler started - checking for overdue borrows...")

	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	checkOverdue()

	for range ticker.C {
		checkOverdue()
	}
}

func checkOverdue() {
	now := time.Now()

	result := database.DB.Model(&models.Borrow{}).
		Where("status = ? AND expected_return_date < ?", models.BorrowStatusBorrowed, now).
		Update("status", models.BorrowStatusOverdue)

	if result.Error != nil {
		log.Printf("Error updating overdue borrows: %v", result.Error)
		return
	}

	if result.RowsAffected > 0 {
		log.Printf("Updated %d overdue borrow records", result.RowsAffected)
	}

	var expiredReservations []models.Reservation
	database.DB.Where("status = ? AND expiry_date < ?", models.ReservationStatusActive, now).
		Find(&expiredReservations)

	for _, r := range expiredReservations {
		database.DB.Model(&r).Update("status", models.ReservationStatusCancelled)
	}

	if len(expiredReservations) > 0 {
		log.Printf("Cancelled %d expired reservations", len(expiredReservations))
	}
}

func GetOverdueItems() []models.Borrow {
	var overdue []models.Borrow
	database.DB.Preload("Item").
		Where("status = ?", models.BorrowStatusOverdue).
		Order("expected_return_date ASC").
		Find(&overdue)
	return overdue
}
