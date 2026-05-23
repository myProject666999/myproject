package handlers

import (
	"net/http"
	"server-monitoring-dashboard/db"
	"server-monitoring-dashboard/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetLatestMetrics(c *gin.Context) {
	rows, err := db.DB.Query(`
		SELECT m.id, m.node_id, m.cpu, m.memory, m.disk,
		       m.mem_used, m.mem_total, m.disk_used, m.disk_total, m.created_at,
		       n.name, n.status
		FROM metrics m
		INNER JOIN nodes n ON m.node_id = n.id
		WHERE m.id IN (
			SELECT MAX(id) FROM metrics GROUP BY node_id
		)
		ORDER BY m.id DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type LatestMetric struct {
		models.Metric
		NodeName string `json:"node_name"`
		Status   string `json:"status"`
	}

	results := make([]LatestMetric, 0)
	for rows.Next() {
		var lm LatestMetric
		rows.Scan(&lm.ID, &lm.NodeID, &lm.CPU, &lm.Memory, &lm.Disk,
			&lm.MemUsed, &lm.MemTotal, &lm.DiskUsed, &lm.DiskTotal, &lm.CreatedAt,
			&lm.NodeName, &lm.Status)
		results = append(results, lm)
	}

	c.JSON(http.StatusOK, results)
}

func GetNodeMetrics(c *gin.Context) {
	nodeID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	hours := c.DefaultQuery("hours", "24")

	h, _ := strconv.Atoi(hours)
	if h <= 0 {
		h = 24
	}
	since := time.Now().Add(-time.Duration(h) * time.Hour)

	rows, err := db.DB.Query(`
		SELECT id, node_id, cpu, memory, disk,
		       mem_used, mem_total, disk_used, disk_total, created_at
		FROM metrics
		WHERE node_id = ? AND created_at >= ?
		ORDER BY created_at ASC
	`, nodeID, since)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	metrics := make([]models.Metric, 0)
	for rows.Next() {
		var m models.Metric
		rows.Scan(&m.ID, &m.NodeID, &m.CPU, &m.Memory, &m.Disk,
			&m.MemUsed, &m.MemTotal, &m.DiskUsed, &m.DiskTotal, &m.CreatedAt)
		metrics = append(metrics, m)
	}

	c.JSON(http.StatusOK, metrics)
}

func GetLatestNodeMetric(c *gin.Context) {
	nodeID, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var m models.Metric
	err := db.DB.QueryRow(`
		SELECT id, node_id, cpu, memory, disk,
		       mem_used, mem_total, disk_used, disk_total, created_at
		FROM metrics
		WHERE node_id = ?
		ORDER BY created_at DESC
		LIMIT 1
	`, nodeID).Scan(&m.ID, &m.NodeID, &m.CPU, &m.Memory, &m.Disk,
		&m.MemUsed, &m.MemTotal, &m.DiskUsed, &m.DiskTotal, &m.CreatedAt)

	if err != nil {
		c.JSON(http.StatusOK, nil)
		return
	}

	c.JSON(http.StatusOK, m)
}
