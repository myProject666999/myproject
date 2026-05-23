package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"server-monitoring-dashboard/db"
	"server-monitoring-dashboard/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func generateToken() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func GetNodes(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT id, name, ip, "group", token, status, created_at, updated_at
		FROM nodes ORDER BY id DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	nodes := make([]models.Node, 0)
	for rows.Next() {
		var n models.Node
		rows.Scan(&n.ID, &n.Name, &n.IP, &n.Group, &n.Token, &n.Status, &n.CreatedAt, &n.UpdatedAt)
		nodes = append(nodes, n)
	}

	c.JSON(http.StatusOK, nodes)
}

func GetNode(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var n models.Node
	err := db.DB.QueryRow(`
		SELECT id, name, ip, "group", token, status, created_at, updated_at
		FROM nodes WHERE id = ?
	`, id).Scan(&n.ID, &n.Name, &n.IP, &n.Group, &n.Token, &n.Status, &n.CreatedAt, &n.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Node not found"})
		return
	}

	c.JSON(http.StatusOK, n)
}

type CreateNodeReq struct {
	Name  string `json:"name" binding:"required"`
	IP    string `json:"ip" binding:"required"`
	Group string `json:"group"`
}

func CreateNode(c *gin.Context) {
	var req CreateNodeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	token := generateToken()
	now := time.Now()

	result, err := db.DB.Exec(`
		INSERT INTO nodes (name, ip, "group", token, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, 'offline', ?, ?)
	`, req.Name, req.IP, req.Group, token, now, now)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusOK, gin.H{"id": id, "token": token})
}

type UpdateNodeReq struct {
	Name  string `json:"name"`
	IP    string `json:"ip"`
	Group string `json:"group"`
}

func UpdateNode(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var req UpdateNodeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	_, err := db.DB.Exec(`
		UPDATE nodes SET name = COALESCE(NULLIF(?, ''), name),
		ip = COALESCE(NULLIF(?, ''), ip),
		"group" = ?,
		updated_at = ?
		WHERE id = ?
	`, req.Name, req.IP, req.Group, now, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated"})
}

func DeleteNode(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	_, err := db.DB.Exec("DELETE FROM nodes WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func RegenerateToken(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	token := generateToken()
	now := time.Now()

	_, err := db.DB.Exec("UPDATE nodes SET token = ?, updated_at = ? WHERE id = ?", token, now, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}
