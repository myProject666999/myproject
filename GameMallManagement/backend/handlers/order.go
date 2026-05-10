package handlers

import (
	"database/sql"
	"gamemall/database"
	"gamemall/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Checkout(c *gin.Context) {
	userID := c.GetUint("user_id")

	rows, err := database.DB.Query(`SELECT ci.game_id, ci.quantity, g.price
		FROM cart_items ci
		INNER JOIN games g ON ci.game_id = g.id
		WHERE ci.user_id = ?`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	type CartGame struct {
		GameID   uint
		Quantity int
		Price    float64
	}
	var cartGames []CartGame
	for rows.Next() {
		var cg CartGame
		if err := rows.Scan(&cg.GameID, &cg.Quantity, &cg.Price); err != nil {
			continue
		}
		cartGames = append(cartGames, cg)
	}

	if len(cartGames) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "购物车为空"})
		return
	}

	var totalPrice float64
	for _, cg := range cartGames {
		totalPrice += cg.Price * float64(cg.Quantity)
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "事务开始失败"})
		return
	}

	result, err := tx.Exec("INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
		userID, totalPrice, "pending")
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建订单失败"})
		return
	}

	orderID, _ := result.LastInsertId()

	for _, cg := range cartGames {
		_, err = tx.Exec("INSERT INTO order_items (order_id, game_id, quantity, price) VALUES (?, ?, ?, ?)",
			orderID, cg.GameID, cg.Quantity, cg.Price)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建订单项失败"})
			return
		}
	}

	_, err = tx.Exec("DELETE FROM cart_items WHERE user_id = ?", userID)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "清空购物车失败"})
		return
	}

	tx.Commit()

	order, err := getOrderByID(uint(orderID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询订单失败"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func getOrderByID(orderID uint) (models.Order, error) {
	var order models.Order
	var userID uint
	var username sql.NullString

	err := database.DB.QueryRow(`SELECT o.id, o.user_id, o.total_price, o.status, o.created_at,
		u.id, u.username
		FROM orders o
		LEFT JOIN users u ON o.user_id = u.id
		WHERE o.id = ?`, orderID).Scan(
		&order.ID, &order.UserID, &order.TotalPrice, &order.Status, &order.CreatedAt,
		&userID, &username)

	if err != nil {
		return order, err
	}

	if userID > 0 {
		order.User = models.User{ID: userID, Username: username.String}
	}

	itemRows, err := database.DB.Query(`SELECT oi.id, oi.order_id, oi.game_id, oi.quantity, oi.price,
		g.id, g.name, g.description, g.price, g.image, g.category_id,
		c.id, c.name
		FROM order_items oi
		INNER JOIN games g ON oi.game_id = g.id
		LEFT JOIN categories c ON g.category_id = c.id
		WHERE oi.order_id = ?`, orderID)
	if err == nil {
		defer itemRows.Close()
		for itemRows.Next() {
			var item models.OrderItem
			var catID sql.NullInt64
			var catName sql.NullString
			err := itemRows.Scan(&item.ID, &item.OrderID, &item.GameID, &item.Quantity, &item.Price,
				&item.Game.ID, &item.Game.Name, &item.Game.Description, &item.Game.Price, &item.Game.Image, &item.Game.CategoryID,
				&catID, &catName)
			if err == nil {
				if catID.Valid {
					item.Game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
				}
				order.Items = append(order.Items, item)
			}
		}
	}

	return order, nil
}

func GetOrders(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	query := `SELECT o.id, o.user_id, o.total_price, o.status, o.created_at,
		u.id, u.username
		FROM orders o
		LEFT JOIN users u ON o.user_id = u.id
		WHERE 1=1`
	args := []interface{}{}

	if role != "admin" {
		query += " AND o.user_id = ?"
		args = append(args, userID)
	}

	query += " ORDER BY o.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var order models.Order
		var uid uint
		var username sql.NullString
		err := rows.Scan(&order.ID, &order.UserID, &order.TotalPrice, &order.Status, &order.CreatedAt,
			&uid, &username)
		if err != nil {
			continue
		}
		if uid > 0 {
			order.User = models.User{ID: uid, Username: username.String}
		}

		itemRows, _ := database.DB.Query(`SELECT oi.id, oi.order_id, oi.game_id, oi.quantity, oi.price,
			g.id, g.name, g.description, g.price, g.image, g.category_id,
			c.id, c.name
			FROM order_items oi
			INNER JOIN games g ON oi.game_id = g.id
			LEFT JOIN categories c ON g.category_id = c.id
			WHERE oi.order_id = ?`, order.ID)
		if itemRows != nil {
			defer itemRows.Close()
			for itemRows.Next() {
				var item models.OrderItem
				var catID sql.NullInt64
				var catName sql.NullString
				err := itemRows.Scan(&item.ID, &item.OrderID, &item.GameID, &item.Quantity, &item.Price,
					&item.Game.ID, &item.Game.Name, &item.Game.Description, &item.Game.Price, &item.Game.Image, &item.Game.CategoryID,
					&catID, &catName)
				if err == nil {
					if catID.Valid {
						item.Game.Category = models.Category{ID: uint(catID.Int64), Name: catName.String}
					}
					order.Items = append(order.Items, item)
				}
			}
		}

		orders = append(orders, order)
	}

	c.JSON(http.StatusOK, orders)
}

func GetOrder(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var orderUserID uint
	err := database.DB.QueryRow("SELECT user_id FROM orders WHERE id = ?", id).Scan(&orderUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	if role != "admin" && orderUserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权访问"})
		return
	}

	order, err := getOrderByID(uint(orderUserID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询订单失败"})
		return
	}
	order.ID = uint(orderUserID)

	c.JSON(http.StatusOK, order)
}

func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM orders WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "状态不能为空"})
		return
	}

	_, err = database.DB.Exec("UPDATE orders SET status = ? WHERE id = ?", input.Status, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	order, err := getOrderByID(uint(existingID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询订单失败"})
		return
	}
	order.ID = uint(existingID)

	c.JSON(http.StatusOK, order)
}

func DeleteOrder(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM orders WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "事务开始失败"})
		return
	}

	_, err = tx.Exec("DELETE FROM order_items WHERE order_id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除订单项失败"})
		return
	}

	_, err = tx.Exec("DELETE FROM orders WHERE id = ?", id)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除订单失败"})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
