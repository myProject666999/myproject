package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"simple-webhook-reception/database"
	"simple-webhook-reception/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func generateToken() string {
	return uuid.New().String()
}

func generateID() string {
	return uuid.New().String()
}

func CreateEndpoint(c *gin.Context) {
	var req struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
		Retention   int    `json:"retention"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	retention := req.Retention
	if retention <= 0 {
		retention = 7
	}

	endpoint := models.Endpoint{
		ID:          generateID(),
		Name:        req.Name,
		Description: req.Description,
		Token:       generateToken(),
		Active:      true,
		Retention:   retention,
	}

	result := database.DB.Create(&endpoint)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create endpoint"})
		return
	}

	c.JSON(http.StatusCreated, endpoint)
}

func ListEndpoints(c *gin.Context) {
	var endpoints []models.Endpoint
	result := database.DB.Order("created_at desc").Find(&endpoints)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list endpoints"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": endpoints})
}

func GetEndpoint(c *gin.Context) {
	id := c.Param("id")

	var endpoint models.Endpoint
	result := database.DB.First(&endpoint, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
		return
	}

	c.JSON(http.StatusOK, endpoint)
}

func UpdateEndpoint(c *gin.Context) {
	id := c.Param("id")

	var endpoint models.Endpoint
	if err := database.DB.First(&endpoint, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Active      *bool  `json:"active"`
		Retention   int    `json:"retention"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		endpoint.Name = req.Name
	}
	if req.Description != "" {
		endpoint.Description = req.Description
	}
	if req.Active != nil {
		endpoint.Active = *req.Active
	}
	if req.Retention > 0 {
		endpoint.Retention = req.Retention
	}

	database.DB.Save(&endpoint)
	c.JSON(http.StatusOK, endpoint)
}

func DeleteEndpoint(c *gin.Context) {
	id := c.Param("id")

	result := database.DB.Delete(&models.Endpoint{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete endpoint"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "endpoint deleted"})
}

func ReceiveWebhook(c *gin.Context) {
	endpointInterface, exists := c.Get("endpoint")
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
		return
	}

	endpoint := endpointInterface.(models.Endpoint)

	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read request body"})
		return
	}

	headersJSON, _ := json.Marshal(c.Request.Header)

	request := models.WebhookRequest{
		ID:         generateID(),
		EndpointID: endpoint.ID,
		Method:     c.Request.Method,
		Path:       c.Request.URL.Path,
		QueryParams: c.Request.URL.RawQuery,
		Headers:    string(headersJSON),
		Body:       string(body),
		SourceIP:   c.ClientIP(),
		UserAgent:  c.Request.UserAgent(),
		ReceivedAt: time.Now(),
	}

	result := database.DB.Create(&request)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save request"})
		return
	}

	go forwardRequest(request, endpoint.ID)

	c.JSON(http.StatusOK, gin.H{
		"message":     "request received",
		"request_id":  request.ID,
		"received_at": request.ReceivedAt,
	})
}

func ListRequests(c *gin.Context) {
	endpointID := c.Query("endpoint_id")

	var requests []models.WebhookRequest
	query := database.DB.Order("received_at desc")

	if endpointID != "" {
		query = query.Where("endpoint_id = ?", endpointID)
	}

	result := query.Limit(100).Find(&requests)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list requests"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": requests})
}

func GetRequest(c *gin.Context) {
	id := c.Param("id")

	var request models.WebhookRequest
	result := database.DB.First(&request, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	var forwardLogs []models.ForwardLog
	database.DB.Where("request_id = ?", id).Find(&forwardLogs)

	c.JSON(http.StatusOK, gin.H{
		"request":      request,
		"forward_logs": forwardLogs,
	})
}

func ResendRequest(c *gin.Context) {
	id := c.Param("id")

	var request models.WebhookRequest
	if err := database.DB.First(&request, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	var endpoint models.Endpoint
	if err := database.DB.First(&endpoint, "id = ?", request.EndpointID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "endpoint not found"})
		return
	}

	go forwardRequest(request, endpoint.ID)

	c.JSON(http.StatusOK, gin.H{"message": "request resending"})
}

func DeleteRequest(c *gin.Context) {
	id := c.Param("id")

	result := database.DB.Delete(&models.WebhookRequest{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete request"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "request deleted"})
}

func CreateForwardRule(c *gin.Context) {
	endpointID := c.Param("endpoint_id")

	var req struct {
		Name      string `json:"name" binding:"required"`
		TargetURL string `json:"target_url" binding:"required"`
		Method    string `json:"method"`
		Headers   string `json:"headers"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	method := req.Method
	if method == "" {
		method = "POST"
	}

	rule := models.ForwardRule{
		ID:         generateID(),
		EndpointID: endpointID,
		Name:       req.Name,
		TargetURL:  req.TargetURL,
		Method:     method,
		Headers:    req.Headers,
		Active:     true,
	}

	result := database.DB.Create(&rule)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create forward rule"})
		return
	}

	c.JSON(http.StatusCreated, rule)
}

func ListForwardRules(c *gin.Context) {
	endpointID := c.Param("endpoint_id")

	var rules []models.ForwardRule
	result := database.DB.Where("endpoint_id = ?", endpointID).Find(&rules)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list forward rules"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": rules})
}

func UpdateForwardRule(c *gin.Context) {
	id := c.Param("id")

	var rule models.ForwardRule
	if err := database.DB.First(&rule, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "forward rule not found"})
		return
	}

	var req struct {
		Name      string `json:"name"`
		TargetURL string `json:"target_url"`
		Method    string `json:"method"`
		Headers   string `json:"headers"`
		Active    *bool  `json:"active"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Name != "" {
		rule.Name = req.Name
	}
	if req.TargetURL != "" {
		rule.TargetURL = req.TargetURL
	}
	if req.Method != "" {
		rule.Method = req.Method
	}
	if req.Headers != "" {
		rule.Headers = req.Headers
	}
	if req.Active != nil {
		rule.Active = *req.Active
	}

	database.DB.Save(&rule)
	c.JSON(http.StatusOK, rule)
}

func DeleteForwardRule(c *gin.Context) {
	id := c.Param("id")

	result := database.DB.Delete(&models.ForwardRule{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete forward rule"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "forward rule deleted"})
}

func forwardRequest(request models.WebhookRequest, endpointID string) {
	var rules []models.ForwardRule
	database.DB.Where("endpoint_id = ? AND active = ?", endpointID, true).Find(&rules)

	if len(rules) == 0 {
		return
	}

	for _, rule := range rules {
		forwardToRule(request, rule)
	}
}

func forwardToRule(request models.WebhookRequest, rule models.ForwardRule) {
	client := &http.Client{Timeout: 30 * time.Second}

	method := rule.Method
	if method == "" {
		method = "POST"
	}

	req, err := http.NewRequest(method, rule.TargetURL, strings.NewReader(request.Body))
	if err != nil {
		createForwardLog(request.ID, rule.ID, rule.TargetURL, 0, "", err.Error(), false)
		return
	}

	if rule.Headers != "" {
		var headers map[string]string
		if jsonErr := json.Unmarshal([]byte(rule.Headers), &headers); jsonErr == nil {
			for key, value := range headers {
				req.Header.Set(key, value)
			}
		}
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		createForwardLog(request.ID, rule.ID, rule.TargetURL, 0, "", err.Error(), false)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	createForwardLog(request.ID, rule.ID, rule.TargetURL, resp.StatusCode, string(body), "", resp.StatusCode < 400)
}

func createForwardLog(requestID, ruleID, targetURL string, statusCode int, responseBody, errorMsg string, success bool) {
	log := models.ForwardLog{
		ID:           generateID(),
		RequestID:    requestID,
		RuleID:       ruleID,
		TargetURL:    targetURL,
		StatusCode:   statusCode,
		ResponseBody: responseBody,
		Error:        errorMsg,
		Success:      success,
		ForwardedAt:  time.Now(),
	}

	database.DB.Create(&log)

	if success {
		database.DB.Model(&models.WebhookRequest{}).Where("id = ?", requestID).Update("forwarded", true)
	}
}
