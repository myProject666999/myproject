package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/middleware"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var statsService = &service.StatsService{}

type StatsHandler struct{}

func (h *StatsHandler) GetRevenueStats(c *gin.Context) {
	userID := middleware.GetUserID(c)
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	db := getDB(c)
	stats, err := statsService.GetRevenueStats(db, userID, startDate, endDate)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, stats)
}

func (h *StatsHandler) GetAuthorOverview(c *gin.Context) {
	userID := middleware.GetUserID(c)
	db := getDB(c)
	overview, err := statsService.GetAuthorOverview(db, userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, overview)
}

func (h *StatsHandler) GetColumnStats(c *gin.Context) {
	columnIDStr := c.Query("column_id")
	columnID, err := strconv.ParseUint(columnIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid column_id")
		return
	}
	db := getDB(c)
	columnStats, err := statsService.GetColumnStats(db, columnID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, columnStats)
}