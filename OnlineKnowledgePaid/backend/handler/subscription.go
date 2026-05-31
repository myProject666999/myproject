package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/middleware"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var subscriptionHandlerService = &service.SubscriptionService{}

type SubscriptionHandler struct{}

func (h *SubscriptionHandler) CheckSubscription(c *gin.Context) {
	userID := middleware.GetUserID(c)
	columnIDStr := c.Query("column_id")
	columnID, err := strconv.ParseUint(columnIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid column_id")
		return
	}
	db := getDB(c)
	subscribed, err := subscriptionHandlerService.CheckSubscription(db, userID, columnID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"subscribed": subscribed,
	})
}

func (h *SubscriptionHandler) GetMySubscriptions(c *gin.Context) {
	userID := middleware.GetUserID(c)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	db := getDB(c)
	subscriptions, total, err := subscriptionHandlerService.GetSubscriptionsByUser(db, userID, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  subscriptions,
		"total": total,
	})
}

func (h *SubscriptionHandler) GetColumnSubscribers(c *gin.Context) {
	columnIDStr := c.Query("column_id")
	columnID, err := strconv.ParseUint(columnIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid column_id")
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	db := getDB(c)
	subscriptions, total, err := subscriptionHandlerService.GetSubscriptionsByColumn(db, columnID, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  subscriptions,
		"total": total,
	})
}