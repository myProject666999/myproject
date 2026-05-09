package controllers

import (
	"net/http"
	"strconv"
	"time"

	"english-learning/database"
	"english-learning/models"

	"github.com/gin-gonic/gin"
)

type UpdateWordStatusRequest struct {
	Action string `json:"action" binding:"required"`
}

func GetWordsByLevel(c *gin.Context) {
	level := c.Param("level")
	userID := c.GetUint("userID")

	words := database.DB.GetWordsByLevel(level)

	var result []map[string]interface{}
	for _, word := range words {
		userWord := database.DB.GetUserWord(userID, word.ID)

		result = append(result, map[string]interface{}{
			"word":          word,
			"is_learned":    userWord.IsLearned,
			"is_favorited":  userWord.IsFavorited,
			"correct_count": userWord.CorrectCount,
			"wrong_count":   userWord.WrongCount,
		})
	}

	c.JSON(http.StatusOK, result)
}

func GetRandomWord(c *gin.Context) {
	level := c.Param("level")
	userID := c.GetUint("userID")

	learnedWordIDs := database.DB.GetLearnedWordIDs(userID)
	learnedSet := make(map[uint]bool)
	for _, id := range learnedWordIDs {
		learnedSet[id] = true
	}

	allWords := database.DB.GetWordsByLevel(level)
	var availableWords []*models.Word
	for _, w := range allWords {
		if !learnedSet[w.ID] {
			availableWords = append(availableWords, w)
		}
	}

	if len(availableWords) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "All words learned!"})
		return
	}

	randomIndex := int(time.Now().Unix()) % len(availableWords)
	word := availableWords[randomIndex]

	userWord := database.DB.GetUserWord(userID, word.ID)

	totalLevelWords := database.DB.CountWordsByLevel(level)
	learnedCount := database.DB.CountLearnedWordsByLevel(userID, level)

	c.JSON(http.StatusOK, gin.H{
		"word":          word,
		"is_learned":    userWord.IsLearned,
		"is_favorited":  userWord.IsFavorited,
		"correct_count": userWord.CorrectCount,
		"wrong_count":   userWord.WrongCount,
		"progress": gin.H{
			"learned": learnedCount,
			"total":   totalLevelWords,
			"percent": float64(learnedCount) / float64(totalLevelWords) * 100,
		},
	})
}

func UpdateWordStatus(c *gin.Context) {
	wordIDStr := c.Param("id")
	wordID, _ := strconv.ParseUint(wordIDStr, 10, 64)
	userID := c.GetUint("userID")

	var req UpdateWordStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	userWord := database.DB.GetOrCreateUserWord(userID, uint(wordID))

	switch req.Action {
	case "know":
		userWord.IsLearned = true
		userWord.CorrectCount++
	case "dont_know":
		userWord.WrongCount++
	case "favorite":
		userWord.IsFavorited = !userWord.IsFavorited
	case "next":
	}

	database.DB.SaveUserWord(userWord)

	c.JSON(http.StatusOK, userWord)
}

func GetFavoriteWords(c *gin.Context) {
	userID := c.GetUint("userID")
	words := database.DB.GetFavoriteWords(userID)
	c.JSON(http.StatusOK, words)
}

func GetLearningProgress(c *gin.Context) {
	userID := c.GetUint("userID")

	levels := []string{"cet4", "cet6"}
	progress := make(map[string]interface{})

	for _, level := range levels {
		total := database.DB.CountWordsByLevel(level)
		learned := database.DB.CountLearnedWordsByLevel(userID, level)

		var percent float64
		if total > 0 {
			percent = float64(learned) / float64(total) * 100
		}

		progress[level] = gin.H{
			"learned": learned,
			"total":   total,
			"percent": percent,
		}
	}

	c.JSON(http.StatusOK, progress)
}
