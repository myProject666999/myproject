package controller

import (
	"strconv"

	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type StatisticsController struct {
	statisticsService *service.StatisticsService
}

func NewStatisticsController() *StatisticsController {
	return &StatisticsController{
		statisticsService: service.NewStatisticsService(),
	}
}

func (ctrl *StatisticsController) GetWorkloadStatistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")
	departmentID, _ := strconv.ParseUint(c.Query("department_id"), 10, 32)
	doctorID, _ := strconv.ParseUint(c.Query("doctor_id"), 10, 32)

	statistics, err := ctrl.statisticsService.GetWorkloadStatistics(startDate, endDate, uint(departmentID), uint(doctorID))
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, statistics)
}

func (ctrl *StatisticsController) CreateDailySettlement(c *gin.Context) {
	operatorID, _ := c.Get("user_id")

	settlement, err := ctrl.statisticsService.CreateDailySettlement(operatorID.(uint))
	if err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, settlement)
}

func (ctrl *StatisticsController) GetDailySettlements(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	settlements, err := ctrl.statisticsService.GetDailySettlements(startDate, endDate)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, settlements)
}

func (ctrl *StatisticsController) GetTodayOverview(c *gin.Context) {
	overview, err := ctrl.statisticsService.GetTodayOverview()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, overview)
}
