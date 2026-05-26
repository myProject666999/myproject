package handlers

import (
	"math/rand"
	"net/http"
	"time"

	"barrage_interaction/models"

	"github.com/gin-gonic/gin"
)

type CreateLotteryRequest struct {
	ActivityName string `json:"activity_name" binding:"required"`
	PrizeName    string `json:"prize_name" binding:"required"`
	WinnerCount  int    `json:"winner_count" binding:"required"`
}

func CreateLottery(c *gin.Context) {
	var req CreateLotteryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	lottery := models.Lottery{
		ActivityName: req.ActivityName,
		PrizeName:    req.PrizeName,
		WinnerCount:  req.WinnerCount,
		Status:       0,
	}

	if err := models.DB.Create(&lottery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lottery"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Lottery created successfully",
		"data":    lottery,
	})
}

func GetLotteries(c *gin.Context) {
	var lotteries []models.Lottery
	if err := models.DB.Order("created_at DESC").Find(&lotteries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch lotteries"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"lotteries": lotteries})
}

func GetLottery(c *gin.Context) {
	id := c.Param("id")

	var lottery models.Lottery
	if err := models.DB.Where("id = ?", id).First(&lottery).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lottery not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"lottery": lottery})
}

func DrawWinners(c *gin.Context) {
	id := c.Param("id")

	var lottery models.Lottery
	if err := models.DB.Where("id = ?", id).First(&lottery).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Lottery not found"})
		return
	}

	if lottery.Status == 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lottery already completed"})
		return
	}

	var users []models.User
	if err := models.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	if len(users) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No users available for drawing"})
		return
	}

	winnerCount := lottery.WinnerCount
	if winnerCount > len(users) {
		winnerCount = len(users)
	}

	rand.Seed(time.Now().UnixNano())
	shuffledUsers := make([]models.User, len(users))
	copy(shuffledUsers, users)
	rand.Shuffle(len(shuffledUsers), func(i, j int) {
		shuffledUsers[i], shuffledUsers[j] = shuffledUsers[j], shuffledUsers[i]
	})

	winners := shuffledUsers[:winnerCount]

	var lotteryWinners []models.LotteryWinner
	for _, user := range winners {
		lotteryWinners = append(lotteryWinners, models.LotteryWinner{
			LotteryID: lottery.ID,
			UserID:    user.ID,
			Nickname:  user.Nickname,
		})
	}

	if err := models.DB.Create(&lotteryWinners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save winners"})
		return
	}

	lottery.Status = 2
	models.DB.Save(&lottery)

	c.JSON(http.StatusOK, gin.H{
		"message": "Winners drawn successfully",
		"winners": lotteryWinners,
	})
}

func GetWinners(c *gin.Context) {
	lotteryID := c.Param("id")

	var winners []models.LotteryWinner
	if err := models.DB.Where("lottery_id = ?", lotteryID).Find(&winners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch winners"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"winners": winners})
}
