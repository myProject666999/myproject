package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"

	"github.com/gin-gonic/gin"
)

func GetSchedules(c *gin.Context) {
	routeID := c.Query("route_id")
	date := c.Query("date")

	var schedules []models.Schedule
	query := database.DB.Preload("Route").Preload("Shuttle")

	if routeID != "" {
		query = query.Where("route_id = ?", routeID)
	}
	if date != "" {
		query = query.Where("departure_date = ?", date)
	}

	query.Order("departure_date, departure_time").Find(&schedules)
	utils.Success(c, schedules)
}

func GetSchedule(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var schedule models.Schedule
	if err := database.DB.Preload("Route").Preload("Shuttle").First(&schedule, id).Error; err != nil {
		utils.NotFound(c, "班次不存在")
		return
	}

	var routeStations []models.RouteStation
	database.DB.Where("route_id = ?", schedule.RouteID).Preload("Station").Order("sequence").Find(&routeStations)

	utils.Success(c, gin.H{
		"schedule": schedule,
		"stations": routeStations,
	})
}

func CreateSchedule(c *gin.Context) {
	var schedule models.Schedule
	if err := c.ShouldBindJSON(&schedule); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	schedule.ScheduleNo = utils.GenerateNo("SCH")
	schedule.BookedSeats = 0

	if err := database.DB.Create(&schedule).Error; err != nil {
		utils.InternalError(c, "创建班次失败")
		return
	}
	utils.Success(c, schedule)
}

func UpdateSchedule(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var schedule models.Schedule
	if err := database.DB.First(&schedule, id).Error; err != nil {
		utils.NotFound(c, "班次不存在")
		return
	}
	if err := c.ShouldBindJSON(&schedule); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	database.DB.Save(&schedule)
	utils.Success(c, schedule)
}

func DeleteSchedule(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	if err := database.DB.Delete(&models.Schedule{}, id).Error; err != nil {
		utils.InternalError(c, "删除班次失败")
		return
	}
	utils.Success(c, nil)
}
