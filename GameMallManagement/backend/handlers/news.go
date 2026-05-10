package handlers

import (
	"gamemall/database"
	"gamemall/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetNews(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, title, content, created_at FROM news ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	var news []models.News
	for rows.Next() {
		var n models.News
		if err := rows.Scan(&n.ID, &n.Title, &n.Content, &n.CreatedAt); err != nil {
			continue
		}
		news = append(news, n)
	}

	c.JSON(http.StatusOK, news)
}

func GetNewsDetail(c *gin.Context) {
	id := c.Param("id")
	var news models.News

	err := database.DB.QueryRow("SELECT id, title, content, created_at FROM news WHERE id = ?", id).Scan(
		&news.ID, &news.Title, &news.Content, &news.CreatedAt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "资讯不存在"})
		return
	}

	c.JSON(http.StatusOK, news)
}

func CreateNews(c *gin.Context) {
	var input struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "标题不能为空"})
		return
	}

	result, err := database.DB.Exec("INSERT INTO news (title, content) VALUES (?, ?)", input.Title, input.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	id, _ := result.LastInsertId()

	var news models.News
	database.DB.QueryRow("SELECT id, title, content, created_at FROM news WHERE id = ?", id).Scan(
		&news.ID, &news.Title, &news.Content, &news.CreatedAt)

	c.JSON(http.StatusOK, news)
}

func UpdateNews(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM news WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "资讯不存在"})
		return
	}

	var input struct {
		Title   string `json:"title"`
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Title != "" {
		database.DB.Exec("UPDATE news SET title = ? WHERE id = ?", input.Title, id)
	}
	if input.Content != "" {
		database.DB.Exec("UPDATE news SET content = ? WHERE id = ?", input.Content, id)
	}

	var news models.News
	database.DB.QueryRow("SELECT id, title, content, created_at FROM news WHERE id = ?", id).Scan(
		&news.ID, &news.Title, &news.Content, &news.CreatedAt)

	c.JSON(http.StatusOK, news)
}

func DeleteNews(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM news WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "资讯不存在"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM news WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
