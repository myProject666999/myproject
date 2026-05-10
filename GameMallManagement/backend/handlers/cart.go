package handlers

import (
	"database/sql"
	"gamemall/database"
	"gamemall/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCart(c *gin.Context) {
	userID := c.GetUint("user_id")

	rows, err := database.DB.Query(`SELECT ci.id, ci.user_id, ci.game_id, ci.quantity,
		g.id, g.name, g.description, g.price, g.image, g.category_id,
		c.id, c.name
		FROM cart_items ci
		INNER JOIN games g ON ci.game_id = g.id
		LEFT JOIN categories c ON g.category_id = c.id
		WHERE ci.user_id = ?`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var item models.CartItem
		var catID sql.NullInt64
		var catName sql.NullString
		err := rows.Scan(&item.ID, &item.UserID, &item.GameID, &item.Quantity,
			&item.Game.ID, &item.Game.Name, &item.Game.Description, &item.Game.Price, &item.Game.Image, &item.Game.CategoryID,
			&catID, &catName)
		if err != nil {
			continue
		}
		if catID.Valid {
			item.Game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
		}
		items = append(items, item)
	}

	c.JSON(http.StatusOK, items)
}

func AddToCart(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input struct {
		GameID   uint `json:"game_id" binding:"required"`
		Quantity int  `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "game_id不能为空"})
		return
	}

	var gameID int
	err := database.DB.QueryRow("SELECT id FROM games WHERE id = ?", input.GameID).Scan(&gameID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "游戏不存在"})
		return
	}

	var existingID int
	var existingQty int
	err = database.DB.QueryRow("SELECT id, quantity FROM cart_items WHERE user_id = ? AND game_id = ?", userID, input.GameID).Scan(&existingID, &existingQty)

	if err == nil {
		newQty := existingQty + 1
		if input.Quantity > 0 {
			newQty = input.Quantity
		}
		database.DB.Exec("UPDATE cart_items SET quantity = ? WHERE id = ?", newQty, existingID)
	} else {
		qty := 1
		if input.Quantity > 0 {
			qty = input.Quantity
		}
		result, _ := database.DB.Exec("INSERT INTO cart_items (user_id, game_id, quantity) VALUES (?, ?, ?)",
			userID, input.GameID, qty)
		existingID64, _ := result.LastInsertId()
		existingID = int(existingID64)
	}

	var item models.CartItem
	var catID sql.NullInt64
	var catName sql.NullString

	database.DB.QueryRow(`SELECT ci.id, ci.user_id, ci.game_id, ci.quantity,
		g.id, g.name, g.description, g.price, g.image, g.category_id,
		c.id, c.name
		FROM cart_items ci
		INNER JOIN games g ON ci.game_id = g.id
		LEFT JOIN categories c ON g.category_id = c.id
		WHERE ci.id = ?`, existingID).Scan(
		&item.ID, &item.UserID, &item.GameID, &item.Quantity,
		&item.Game.ID, &item.Game.Name, &item.Game.Description, &item.Game.Price, &item.Game.Image, &item.Game.CategoryID,
		&catID, &catName)

	if catID.Valid {
		item.Game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
	}

	c.JSON(http.StatusOK, item)
}

func UpdateCartItem(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM cart_items WHERE user_id = ? AND id = ?", userID, id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "购物车项不存在"})
		return
	}

	var input struct {
		Quantity int `json:"quantity" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "数量不能为空"})
		return
	}

	database.DB.Exec("UPDATE cart_items SET quantity = ? WHERE id = ?", input.Quantity, id)

	var item models.CartItem
	var catID sql.NullInt64
	var catName sql.NullString

	database.DB.QueryRow(`SELECT ci.id, ci.user_id, ci.game_id, ci.quantity,
		g.id, g.name, g.description, g.price, g.image, g.category_id,
		c.id, c.name
		FROM cart_items ci
		INNER JOIN games g ON ci.game_id = g.id
		LEFT JOIN categories c ON g.category_id = c.id
		WHERE ci.id = ?`, id).Scan(
		&item.ID, &item.UserID, &item.GameID, &item.Quantity,
		&item.Game.ID, &item.Game.Name, &item.Game.Description, &item.Game.Price, &item.Game.Image, &item.Game.CategoryID,
		&catID, &catName)

	if catID.Valid {
		item.Game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
	}

	c.JSON(http.StatusOK, item)
}

func RemoveFromCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM cart_items WHERE user_id = ? AND id = ?", userID, id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "购物车项不存在"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM cart_items WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
