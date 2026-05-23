package handlers

import (
	"database/sql"
	"net/http"
	"server-monitoring-dashboard/db"
	"server-monitoring-dashboard/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetAlertRules(c *gin.Context) {
	nodeID := c.Query("node_id")

	var rows *sql.Rows
	var err error

	if nodeID != "" {
		rows, err = db.DB.Query(`
			SELECT id, node_id, metric, condition, threshold, enabled, created_at
			FROM alert_rules WHERE node_id = ? ORDER BY id DESC
		`, nodeID)
	} else {
		rows, err = db.DB.Query(`
			SELECT ar.id, ar.node_id, ar.metric, ar.condition, ar.threshold, ar.enabled, ar.created_at,
			       n.name as node_name
			FROM alert_rules ar
			INNER JOIN nodes n ON ar.node_id = n.id
			ORDER BY ar.id DESC
		`)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type AlertRuleWithNode struct {
		models.AlertRule
		NodeName string `json:"node_name"`
	}

	rules := make([]AlertRuleWithNode, 0)
	for rows.Next() {
		var r AlertRuleWithNode
		if nodeID != "" {
			rows.Scan(&r.ID, &r.NodeID, &r.Metric, &r.Condition, &r.Threshold, &r.Enabled, &r.CreatedAt)
		} else {
			rows.Scan(&r.ID, &r.NodeID, &r.Metric, &r.Condition, &r.Threshold, &r.Enabled, &r.CreatedAt, &r.NodeName)
		}
		rules = append(rules, r)
	}

	c.JSON(http.StatusOK, rules)
}

type CreateAlertRuleReq struct {
	NodeID    int64   `json:"node_id" binding:"required"`
	Metric    string  `json:"metric" binding:"required"`
	Condition string  `json:"condition" binding:"required"`
	Threshold float64 `json:"threshold" binding:"required"`
}

func CreateAlertRule(c *gin.Context) {
	var req CreateAlertRuleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec(`
		INSERT INTO alert_rules (node_id, metric, condition, threshold)
		VALUES (?, ?, ?, ?)
	`, req.NodeID, req.Metric, req.Condition, req.Threshold)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusOK, gin.H{"id": id})
}

func ToggleAlertRule(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	var enabled int
	err := db.DB.QueryRow("SELECT enabled FROM alert_rules WHERE id = ?", id).Scan(&enabled)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Rule not found"})
		return
	}

	newEnabled := 1
	if enabled == 1 {
		newEnabled = 0
	}

	_, err = db.DB.Exec("UPDATE alert_rules SET enabled = ? WHERE id = ?", newEnabled, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"enabled": newEnabled})
}

func DeleteAlertRule(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)

	_, err := db.DB.Exec("DELETE FROM alert_rules WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

func GetAlertRecords(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "100")
	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 {
		limit = 100
	}

	nodeID := c.Query("node_id")

	var rows *sql.Rows
	var err error

	if nodeID != "" {
		rows, err = db.DB.Query(`
			SELECT ar.id, ar.node_id, ar.rule_id, ar.metric, ar.value, ar.threshold,
			       ar.message, ar.level, ar.created_at
			FROM alert_records ar
			WHERE ar.node_id = ?
			ORDER BY ar.created_at DESC LIMIT ?
		`, nodeID, limit)
	} else {
		rows, err = db.DB.Query(`
			SELECT ar.id, ar.node_id, ar.rule_id, ar.metric, ar.value, ar.threshold,
			       ar.message, ar.level, ar.created_at,
			       n.name as node_name
			FROM alert_records ar
			INNER JOIN nodes n ON ar.node_id = n.id
			ORDER BY ar.created_at DESC LIMIT ?
		`, limit)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	type AlertRecordWithNode struct {
		models.AlertRecord
		NodeName string `json:"node_name"`
	}

	records := make([]AlertRecordWithNode, 0)
	for rows.Next() {
		var r AlertRecordWithNode
		if nodeID != "" {
			rows.Scan(&r.ID, &r.NodeID, &r.RuleID, &r.Metric, &r.Value, &r.Threshold,
				&r.Message, &r.Level, &r.CreatedAt)
		} else {
			rows.Scan(&r.ID, &r.NodeID, &r.RuleID, &r.Metric, &r.Value, &r.Threshold,
				&r.Message, &r.Level, &r.CreatedAt, &r.NodeName)
		}
		records = append(records, r)
	}

	c.JSON(http.StatusOK, records)
}

func ClearAlertRecords(c *gin.Context) {
	nodeID := c.Query("node_id")

	var err error
	if nodeID != "" {
		_, err = db.DB.Exec("DELETE FROM alert_records WHERE node_id = ?", nodeID)
	} else {
		_, err = db.DB.Exec("DELETE FROM alert_records")
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cleared"})
}
