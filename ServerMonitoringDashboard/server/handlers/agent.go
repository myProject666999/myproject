package handlers

import (
	"fmt"
	"net/http"
	"server-monitoring-dashboard/db"
	"server-monitoring-dashboard/models"
	"time"

	"github.com/gin-gonic/gin"
)

func AgentReportHandler(c *gin.Context) {
	var report models.AgentReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var nodeID int64
	err := db.DB.QueryRow("SELECT id FROM nodes WHERE token = ?", report.Token).Scan(&nodeID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	now := time.Now()
	_, err = db.DB.Exec(`
		INSERT INTO metrics (node_id, cpu, memory, disk, mem_used, mem_total, disk_used, disk_total, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, nodeID, report.CPU, report.Memory, report.Disk,
		report.MemUsed, report.MemTotal, report.DiskUsed, report.DiskTotal, now)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	_, err = db.DB.Exec("UPDATE nodes SET status = 'online', updated_at = ? WHERE id = ?", now, nodeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	go checkAlertRules(nodeID, report)

	c.JSON(http.StatusOK, gin.H{"message": "Received"})
}

func checkAlertRules(nodeID int64, report models.AgentReport) {
	rows, err := db.DB.Query(`
		SELECT id, metric, condition, threshold FROM alert_rules
		WHERE node_id = ? AND enabled = 1
	`, nodeID)
	if err != nil {
		return
	}
	defer rows.Close()

	type rule struct {
		ID        int64
		Metric    string
		Condition string
		Threshold float64
	}

	rules := make([]rule, 0)
	for rows.Next() {
		var r rule
		rows.Scan(&r.ID, &r.Metric, &r.Condition, &r.Threshold)
		rules = append(rules, r)
	}

	for _, r := range rules {
		var value float64
		switch r.Metric {
		case "cpu":
			value = report.CPU
		case "memory":
			value = report.Memory
		case "disk":
			value = report.Disk
		default:
			continue
		}

		var triggered bool
		switch r.Condition {
		case ">":
			triggered = value > r.Threshold
		case ">=":
			triggered = value >= r.Threshold
		case "<":
			triggered = value < r.Threshold
		case "<=":
			triggered = value <= r.Threshold
		case "==":
			triggered = value == r.Threshold
		}

		if triggered {
			level := "warning"
			if value > r.Threshold*1.2 {
				level = "critical"
			}

			msg := fmt.Sprintf("%s 使用率 %.1f%% 超过阈值 %.1f%%", r.Metric, value, r.Threshold)
			db.DB.Exec(`
				INSERT INTO alert_records (node_id, rule_id, metric, value, threshold, message, level)
				VALUES (?, ?, ?, ?, ?, ?, ?)
			`, nodeID, r.ID, r.Metric, value, r.Threshold, msg, level)
		}
	}
}
