package controllers

import (
	"math/rand"
	"net/http"
	"time"

	"english-learning/database"

	"github.com/gin-gonic/gin"
)

func GetRandomDailySentence(c *gin.Context) {
	sentences := database.DB.GetAllDailySentences()

	if len(sentences) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "No sentences available"})
		return
	}

	rand.Seed(time.Now().UnixNano())
	randomIndex := rand.Intn(len(sentences))
	sentence := sentences[randomIndex]

	imageURL := "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US"
	sentence.ImageURL = imageURL

	c.JSON(http.StatusOK, sentence)
}

func GetDailySentences(c *gin.Context) {
	sentences := database.DB.GetAllDailySentences()

	for i := range sentences {
		for j := i + 1; j < len(sentences); j++ {
			if sentences[i].Date < sentences[j].Date {
				sentences[i], sentences[j] = sentences[j], sentences[i]
			}
		}
	}

	c.JSON(http.StatusOK, sentences)
}
