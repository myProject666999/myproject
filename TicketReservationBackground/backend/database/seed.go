package database

import (
	"log"
	"ticketreservation/models"
	"time"

	"gorm.io/gorm"
)

func SeedDatabase(db *gorm.DB) {
	var count int64
	db.Model(&models.Flight{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding database with sample data...")

	flights := []models.Flight{
		{
			FlightNumber:    "CA1234",
			Airline:         "中国国航",
			DepartureCity:   "北京",
			ArrivalCity:     "上海",
			DepartureTime:   time.Now().AddDate(0, 0, 1).Add(time.Hour * 8),
			ArrivalTime:     time.Now().AddDate(0, 0, 1).Add(time.Hour * 10),
			EconomyPrice:    680,
			BusinessPrice:   1680,
			FirstClassPrice: 2680,
			EconomySeats:    150,
			BusinessSeats:   50,
			FirstClassSeats: 20,
			Status:          "available",
			Aircraft:        "波音737-800",
		},
		{
			FlightNumber:    "MU5678",
			Airline:         "东方航空",
			DepartureCity:   "上海",
			ArrivalCity:     "广州",
			DepartureTime:   time.Now().AddDate(0, 0, 1).Add(time.Hour * 10),
			ArrivalTime:     time.Now().AddDate(0, 0, 1).Add(time.Hour * 12),
			EconomyPrice:    520,
			BusinessPrice:   1520,
			FirstClassPrice: 2520,
			EconomySeats:    180,
			BusinessSeats:   40,
			FirstClassSeats: 15,
			Status:          "available",
			Aircraft:        "空客A320",
		},
		{
			FlightNumber:    "CZ9012",
			Airline:         "南方航空",
			DepartureCity:   "广州",
			ArrivalCity:     "北京",
			DepartureTime:   time.Now().AddDate(0, 0, 2).Add(time.Hour * 7),
			ArrivalTime:     time.Now().AddDate(0, 0, 2).Add(time.Hour * 10),
			EconomyPrice:    890,
			BusinessPrice:   1890,
			FirstClassPrice: 2890,
			EconomySeats:    150,
			BusinessSeats:   50,
			FirstClassSeats: 20,
			Status:          "available",
			Aircraft:        "波音787",
		},
		{
			FlightNumber:    "HU3456",
			Airline:         "海南航空",
			DepartureCity:   "北京",
			ArrivalCity:     "成都",
			DepartureTime:   time.Now().AddDate(0, 0, 1).Add(time.Hour * 9),
			ArrivalTime:     time.Now().AddDate(0, 0, 1).Add(time.Hour * 12),
			EconomyPrice:    750,
			BusinessPrice:   1750,
			FirstClassPrice: 2750,
			EconomySeats:    160,
			BusinessSeats:   45,
			FirstClassSeats: 18,
			Status:          "available",
			Aircraft:        "空客A330",
		},
		{
			FlightNumber:    "MU2345",
			Airline:         "东方航空",
			DepartureCity:   "上海",
			ArrivalCity:     "成都",
			DepartureTime:   time.Now().AddDate(0, 0, 2).Add(time.Hour * 8),
			ArrivalTime:     time.Now().AddDate(0, 0, 2).Add(time.Hour * 11),
			EconomyPrice:    620,
			BusinessPrice:   1620,
			FirstClassPrice: 2620,
			EconomySeats:    150,
			BusinessSeats:   50,
			FirstClassSeats: 20,
			Status:          "available",
			Aircraft:        "波音737-800",
		},
		{
			FlightNumber:    "CA5678",
			Airline:         "中国国航",
			DepartureCity:   "成都",
			ArrivalCity:     "广州",
			DepartureTime:   time.Now().AddDate(0, 0, 3).Add(time.Hour * 6),
			ArrivalTime:     time.Now().AddDate(0, 0, 3).Add(time.Hour * 8),
			EconomyPrice:    480,
			BusinessPrice:   1480,
			FirstClassPrice: 2480,
			EconomySeats:    170,
			BusinessSeats:   40,
			FirstClassSeats: 16,
			Status:          "available",
			Aircraft:        "空客A321",
		},
		{
			FlightNumber:    "CZ1234",
			Airline:         "南方航空",
			DepartureCity:   "广州",
			ArrivalCity:     "上海",
			DepartureTime:   time.Now().AddDate(0, 0, 1).Add(time.Hour * 14),
			ArrivalTime:     time.Now().AddDate(0, 0, 1).Add(time.Hour * 16),
			EconomyPrice:    580,
			BusinessPrice:   1580,
			FirstClassPrice: 2580,
			EconomySeats:    150,
			BusinessSeats:   50,
			FirstClassSeats: 20,
			Status:          "available",
			Aircraft:        "波音737-MAX",
		},
		{
			FlightNumber:    "HU7890",
			Airline:         "海南航空",
			DepartureCity:   "上海",
			ArrivalCity:     "北京",
			DepartureTime:   time.Now().AddDate(0, 0, 2).Add(time.Hour * 12),
			ArrivalTime:     time.Now().AddDate(0, 0, 2).Add(time.Hour * 14),
			EconomyPrice:    650,
			BusinessPrice:   1650,
			FirstClassPrice: 2650,
			EconomySeats:    180,
			BusinessSeats:   45,
			FirstClassSeats: 18,
			Status:          "available",
			Aircraft:        "空客A330",
		},
	}

	for _, flight := range flights {
		db.Create(&flight)
	}

	comments := []models.Comment{
		{
			UserID:  1,
			Content: "服务非常好，订票流程很顺畅！",
			Type:    "service",
			Rating:  5,
		},
		{
			UserID:  1,
			Content: "机票价格实惠，会继续支持！",
			Type:    "general",
			Rating:  4,
		},
	}

	for _, comment := range comments {
		db.Create(&comment)
	}

	log.Println("Database seeded successfully!")
}
