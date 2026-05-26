package handlers

import (
	"log"
	"time"

	"simple-webhook-reception/database"
	"simple-webhook-reception/models"
)

func CleanupExpiredRequests() {
	for {
		time.Sleep(1 * time.Hour)

		var endpoints []models.Endpoint
		database.DB.Find(&endpoints)

		for _, endpoint := range endpoints {
			cutoffTime := time.Now().AddDate(0, 0, -endpoint.Retention)

			result := database.DB.Where(
				"endpoint_id = ? AND received_at < ?",
				endpoint.ID,
				cutoffTime,
			).Delete(&models.WebhookRequest{})

			if result.Error != nil {
				log.Printf("Error cleaning up requests for endpoint %s: %v", endpoint.ID, result.Error)
			} else if result.RowsAffected > 0 {
				log.Printf("Cleaned up %d expired requests for endpoint %s", result.RowsAffected, endpoint.Name)
			}
		}
	}
}
