package controllers

import (
	"net/http"
	"strconv"

	"english-learning/database"
	"english-learning/models"

	"github.com/gin-gonic/gin"
)

func GetBooks(c *gin.Context) {
	level := c.Query("level")

	allBooks := database.DB.GetAllBooks()
	if level == "" {
		c.JSON(http.StatusOK, allBooks)
		return
	}

	var books []*models.Book
	for _, b := range allBooks {
		if b.Level == level {
			books = append(books, b)
		}
	}

	c.JSON(http.StatusOK, books)
}

func GetBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	userID := c.GetUint("userID")

	book, err := database.DB.GetBookByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	progress := database.DB.GetOrCreateUserBookProgress(userID, uint(id))

	c.JSON(http.StatusOK, gin.H{
		"book":          book,
		"current_page":  progress.CurrentPage,
		"is_completed":  progress.IsCompleted,
	})
}

func UpdateBookProgress(c *gin.Context) {
	bookIDStr := c.Param("id")
	bookID, _ := strconv.ParseUint(bookIDStr, 10, 64)
	userID := c.GetUint("userID")

	var req struct {
		CurrentPage int `json:"current_page"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	progress := database.DB.GetOrCreateUserBookProgress(userID, uint(bookID))
	progress.CurrentPage = req.CurrentPage
	database.DB.SaveUserBookProgress(progress)

	c.JSON(http.StatusOK, progress)
}

func GetReadingProgress(c *gin.Context) {
	userID := c.GetUint("userID")

	allBooks := database.DB.GetAllBooks()
	bookMap := make(map[uint]*models.Book)
	for _, b := range allBooks {
		bookMap[b.ID] = b
	}

	type BookProgress struct {
		BookID      uint   `json:"book_id"`
		Title       string `json:"title"`
		CurrentPage int    `json:"current_page"`
		IsCompleted bool   `json:"is_completed"`
	}

	var progressList []BookProgress

	progresses := database.DB.GetUserBookProgresses(userID)
	for _, progress := range progresses {
		if book, exists := bookMap[progress.BookID]; exists {
			progressList = append(progressList, BookProgress{
				BookID:      progress.BookID,
				Title:       book.Title,
				CurrentPage: progress.CurrentPage,
				IsCompleted: progress.IsCompleted,
			})
		}
	}

	c.JSON(http.StatusOK, progressList)
}
