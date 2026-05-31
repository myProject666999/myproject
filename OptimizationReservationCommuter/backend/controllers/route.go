package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"

	"github.com/gin-gonic/gin"
)

func GetRoutes(c *gin.Context) {
	direction := c.Query("direction")
	var routes []models.Route
	query := database.DB
	if direction != "" {
		query = query.Where("direction = ?", direction)
	}
	query.Find(&routes)
	utils.Success(c, routes)
}

func GetRoute(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var route models.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		utils.NotFound(c, "线路不存在")
		return
	}

	var routeStations []models.RouteStation
	database.DB.Where("route_id = ?", id).Preload("Station").Order("sequence").Find(&routeStations)
	route.Stations = make([]models.Station, len(routeStations))
	for i, rs := range routeStations {
		route.Stations[i] = rs.Station
	}

	utils.Success(c, gin.H{
		"route":    route,
		"stations": routeStations,
	})
}

func GetRouteMap(c *gin.Context) {
	var routes []models.Route
	database.DB.Where("status = 1").Find(&routes)

	for i := range routes {
		var routeStations []models.RouteStation
		database.DB.Where("route_id = ?", routes[i].ID).Preload("Station").Order("sequence").Find(&routeStations)
		routes[i].Stations = make([]models.Station, len(routeStations))
		for j, rs := range routeStations {
			routes[i].Stations[j] = rs.Station
		}
	}

	var stations []models.Station
	database.DB.Where("status = 1").Find(&stations)

	utils.Success(c, gin.H{
		"routes":   routes,
		"stations": stations,
	})
}

func CreateRoute(c *gin.Context) {
	var input struct {
		models.Route
		StationIDs []int `json:"station_ids"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	input.RouteNo = utils.GenerateNo("ROUTE")
	tx := database.DB.Begin()

	if err := tx.Create(&input.Route).Error; err != nil {
		tx.Rollback()
		utils.InternalError(c, "创建线路失败")
		return
	}

	for i, stationID := range input.StationIDs {
		rs := models.RouteStation{
			RouteID:   input.Route.ID,
			StationID: stationID,
			Sequence:  i + 1,
		}
		if err := tx.Create(&rs).Error; err != nil {
			tx.Rollback()
			utils.InternalError(c, "添加站点失败")
			return
		}
	}

	tx.Commit()
	utils.Success(c, input.Route)
}

func UpdateRoute(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var route models.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		utils.NotFound(c, "线路不存在")
		return
	}

	if err := c.ShouldBindJSON(&route); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	database.DB.Save(&route)
	utils.Success(c, route)
}

func DeleteRoute(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	tx := database.DB.Begin()
	tx.Where("route_id = ?", id).Delete(&models.RouteStation{})
	tx.Delete(&models.Route{}, id)
	tx.Commit()
	utils.Success(c, nil)
}
