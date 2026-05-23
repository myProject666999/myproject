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
	NodeID