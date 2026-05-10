package handlers

import (
	"database/sql"
	"gamemall/database"
	"gamemall/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGames(c *gin.Context) {
	keyword := c.Query("keyword")
	categoryID := c.Query("category_id")

	query := `SELECT g.id, g.name, g.description, g.price, g.image, g.category_id, g.created_at, 
	          c.id, c.name 
	          FROM games g 
	          LEFT JOIN categories c ON g.category_id = c.id 
	          WHERE 1=1`
	args := []interface{}{}

	if keyword != "" {
		query += " AND (g.name LIKE ? OR g.description LIKE ?)"
		args = append(args, "%"+keyword+"%", "%"+keyword+"%")
	}

	if categoryID != "" {
		query += " AND g.category_id = ?"
		args = append(args, categoryID)
	}

	query += " ORDER BY g.id DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	var games []models.Game
	for rows.Next() {
		var game models.Game
		var catID sql.NullInt64
		var catName sql.NullString
		err := rows.Scan(&game.ID, &game.Name, &game.Description, &game.Price,
			&game.Image, &game.CategoryID, &game.CreatedAt,
			&catID, &catName)
		if err != nil {
			continue
		}
		if catID.Valid {
			game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
		}
		games = append(games, game)
	}

	c.JSON(http.StatusOK, games)
}

func GetGame(c *gin.Context) {
	id := c.Param("id")

	var game models.Game
	var catID sql.NullInt64
	var catName sql.NullString

	err := database.DB.QueryRow(`SELECT g.id, g.name, g.description, g.price, g.image, g.category_id, g.created_at,
		c.id, c.name 
		FROM games g 
		LEFT JOIN categories c ON g.category_id = c.id 
		WHERE g.id = ?`, id).Scan(
		&game.ID, &game.Name, &game.Description, &game.Price,
		&game.Image, &game.CategoryID, &game.CreatedAt,
		&catID, &catName)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "游戏不存在"})
		return
	}

	if catID.Valid {
		game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
	}

	c.JSON(http.StatusOK, game)
}

func CreateGame(c *gin.Context) {
	var input struct {
		Name        string  `json:"name" binding:"required"`
		Description string  `json:"description"`
		Price       float64 `json:"price" binding:"required"`
		Image       string  `json:"image"`
		CategoryID  uint    `json:"category_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "必填项不能为空"})
		return
	}

	result, err := database.DB.Exec(`INSERT INTO games (name, description, price, image, category_id) 
		VALUES (?, ?, ?, ?, ?)`,
		input.Name, input.Description, input.Price, input.Image, input.CategoryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	id, _ := result.LastInsertId()

	var game models.Game
	var catID sql.NullInt64
	var catName sql.NullString

	database.DB.QueryRow(`SELECT g.id, g.name, g.description, g.price, g.image, g.category_id, g.created_at,
		c.id, c.name 
		FROM games g 
		LEFT JOIN categories c ON g.category_id = c.id 
		WHERE g.id = ?`, id).Scan(
		&game.ID, &game.Name, &game.Description, &game.Price,
		&game.Image, &game.CategoryID, &game.CreatedAt,
		&catID, &catName)

	if catID.Valid {
		game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
	}

	c.JSON(http.StatusOK, game)
}

func UpdateGame(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM games WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "游戏不存在"})
		return
	}

	var input struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Price       float64 `json:"price"`
		Image       string  `json:"image"`
		CategoryID  uint    `json:"category_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.Name != "" {
		database.DB.Exec("UPDATE games SET name = ? WHERE id = ?", input.Name, id)
	}
	if input.Description != "" {
		database.DB.Exec("UPDATE games SET description = ? WHERE id = ?", input.Description, id)
	}
	if input.Price != 0 {
		database.DB.Exec("UPDATE games SET price = ? WHERE id = ?", input.Price, id)
	}
	if input.Image != "" {
		database.DB.Exec("UPDATE games SET image = ? WHERE id = ?", input.Image, id)
	}
	if input.CategoryID != 0 {
		database.DB.Exec("UPDATE games SET category_id = ? WHERE id = ?", input.CategoryID, id)
	}

	var game models.Game
	var catID sql.NullInt64
	var catName sql.NullString

	database.DB.QueryRow(`SELECT g.id, g.name, g.description, g.price, g.image, g.category_id, g.created_at,
		c.id, c.name 
		FROM games g 
		LEFT JOIN categories c ON g.category_id = c.id 
		WHERE g.id = ?`, id).Scan(
		&game.ID, &game.Name, &game.Description, &game.Price,
		&game.Image, &game.CategoryID, &game.CreatedAt,
		&catID, &catName)

	if catID.Valid {
		game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
	}

	c.JSON(http.StatusOK, game)
}

func DeleteGame(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM games WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "游戏不存在"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM games WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
