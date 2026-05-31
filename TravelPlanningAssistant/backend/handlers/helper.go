package handlers

import (
	"strconv"
	"time"
	"travelplanner/database"
	"travelplanner/models"
)

func parseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

func parseUint(s string) uint {
	i, _ := strconv.ParseUint(s, 10, 64)
	return uint(i)
}

func generateDays(tripID uint, startDate, endDate time.Time) []models.Day {
	var days []models.Day
	index := 0
	for d := startDate; !d.After(endDate); d = d.AddDate(0, 0, 1) {
		days = append(days, models.Day{
			TripID:     tripID,
			Date:       d,
			OrderIndex: index,
		})
		index++
	}
	return days
}

func recalculateDayOrder(tripID uint) {
	var days []models.Day
	database.DB.Where("trip_id = ?", tripID).Order("date ASC").Find(&days)
	for i, day := range days {
		database.DB.Model(&day).Update("order_index", i)
	}
}
