package controllers

import (
	"fmt"
	"net/http"
	"time"

	"ticketreservation/database"
	"ticketreservation/models"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	user, _ := c.Get("user")
	u := user.(models.User)

	var input struct {
		FlightID       uint    `json:"flight_id" binding:"required"`
		SeatClass      string  `json:"seat_class" binding:"required"`
		PassengerName  string  `json:"passenger_name" binding:"required"`
		PassengerPhone string  `json:"passenger_phone" binding:"required"`
		PassengerID    string  `json:"passenger_id" binding:"required"`
		ContactName    string  `json:"contact_name" binding:"required"`
		ContactPhone   string  `json:"contact_phone" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var flight models.Flight
	if err := database.DB.First(&flight, input.FlightID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Flight not found"})
		return
	}

	var price float64
	switch input.SeatClass {
	case "economy":
		price = flight.EconomyPrice
		if flight.EconomySeats <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No economy seats available"})
			return
		}
		flight.EconomySeats--
	case "business":
		price = flight.BusinessPrice
		if flight.BusinessSeats <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No business seats available"})
			return
		}
		flight.BusinessSeats--
	case "first_class":
		price = flight.FirstClassPrice
		if flight.FirstClassSeats <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No first class seats available"})
			return
		}
		flight.FirstClassSeats--
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid seat class"})
		return
	}

	if err := database.DB.Save(&flight).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update flight seats"})
		return
	}

	orderNumber := fmt.Sprintf("ORD%s", time.Now().Format("20060102150405"))

	order := models.Order{
		OrderNumber:    orderNumber,
		UserID:         u.ID,
		FlightID:       input.FlightID,
		SeatClass:      input.SeatClass,
		PassengerName:  input.PassengerName,
		PassengerPhone: input.PassengerPhone,
		PassengerID:    input.PassengerID,
		ContactName:    input.ContactName,
		ContactPhone:   input.ContactPhone,
		TotalPrice:     price,
		Status:         "confirmed",
	}

	if err := database.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	database.DB.Preload("Flight").First(&order, order.ID)
	c.JSON(http.StatusCreated, order)
}

func GetMyOrders(c *gin.Context) {
	user, _ := c.Get("user")
	u := user.(models.User)

	var orders []models.Order
	if err := database.DB.Preload("Flight").Where("user_id = ?", u.ID).Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")
	user, _ := c.Get("user")
	u := user.(models.User)

	var order models.Order
	query := database.DB.Preload("Flight").Preload("User")
	if u.Role != "admin" {
		query = query.Where("user_id = ?", u.ID)
	}

	if err := query.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func GetAllOrders(c *gin.Context) {
	var orders []models.Order
	if err := database.DB.Preload("Flight").Preload("User").Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}
