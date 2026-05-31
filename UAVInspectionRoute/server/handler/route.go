package handler

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type RouteReq struct {
	Name              string  `json:"name" binding:"required"`
	AreaID            uint64  `json:"area_id" binding:"required"`
	RouteType         int8    `json:"route_type"`
	Altitude          float64 `json:"altitude"`
	Speed             float64 `json:"speed"`
	OverlapRate       float64 `json:"overlap_rate"`
	SideOverlapRate   float64 `json:"side_overlap_rate"`
	CameraAngle       float64 `json:"camera_angle"`
	TotalDistance     float64 `json:"total_distance"`
	EstimatedDuration int     `json:"estimated_duration"`
	Description       string  `json:"description"`
}

type RoutePointReq struct {
	SeqNum      uint    `json:"seq_num" binding:"required"`
	Lng         float64 `json:"lng" binding:"required"`
	Lat         float64 `json:"lat" binding:"required"`
	Altitude    float64 `json:"altitude"`
	Speed       float64 `json:"speed"`
	PointType   int8    `json:"point_type"`
	Action      int8    `json:"action"`
	Heading     float64 `json:"heading"`
	GimbalPitch float64 `json:"gimbal_pitch"`
	HoverTime   int     `json:"hover_time"`
}

func CreateRoute(c *gin.Context) {
	var req RouteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	userID := c.GetUint64("user_id")
	route := model.Route{
		Name:              req.Name,
		AreaID:            req.AreaID,
		RouteType:         req.RouteType,
		Altitude:          req.Altitude,
		Speed:             req.Speed,
		OverlapRate:       req.OverlapRate,
		SideOverlapRate:   req.SideOverlapRate,
		CameraAngle:       req.CameraAngle,
		TotalDistance:     req.TotalDistance,
		EstimatedDuration: req.EstimatedDuration,
		Description:       req.Description,
		CreatedBy:         userID,
	}
	if err := database.DB.Create(&route).Error; err != nil {
		utils.Fail(c, 500, "failed to create route")
		return
	}
	utils.Success(c, route)
}

func GetRoute(c *gin.Context) {
	id := c.Param("id")
	var route model.Route
	if err := database.DB.Preload("Points", func(db *gorm.DB) *gorm.DB {
		return db.Order("seq_num ASC")
	}).First(&route, id).Error; err != nil {
		utils.Fail(c, 404, "route not found")
		return
	}
	utils.Success(c, route)
}

func UpdateRoute(c *gin.Context) {
	id := c.Param("id")
	var route model.Route
	if err := database.DB.First(&route, id).Error; err != nil {
		utils.Fail(c, 404, "route not found")
		return
	}
	var req RouteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&route).Updates(map[string]interface{}{
		"name":               req.Name,
		"area_id":            req.AreaID,
		"route_type":         req.RouteType,
		"altitude":           req.Altitude,
		"speed":              req.Speed,
		"overlap_rate":       req.OverlapRate,
		"side_overlap_rate":  req.SideOverlapRate,
		"camera_angle":       req.CameraAngle,
		"total_distance":     req.TotalDistance,
		"estimated_duration": req.EstimatedDuration,
		"description":        req.Description,
	})
	utils.Success(c, route)
}

func DeleteRoute(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Route{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete route")
		return
	}
	utils.Success(c, nil)
}

func ListRoutes(c *gin.Context) {
	var routes []model.Route
	query := database.DB.Model(&model.Route{})
	if areaID := c.Query("area_id"); areaID != "" {
		query = query.Where("area_id = ?", areaID)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&routes)
	utils.Success(c, gin.H{"total": total, "list": routes})
}

func AddRoutePoint(c *gin.Context) {
	routeID := c.Param("id")
	var route model.Route
	if err := database.DB.First(&route, routeID).Error; err != nil {
		utils.Fail(c, 404, "route not found")
		return
	}
	var req RoutePointReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var maxSeq uint
	database.DB.Model(&model.RoutePoint{}).Where("route_id = ?", routeID).Select("COALESCE(MAX(seq_num),0)").Scan(&maxSeq)
	if req.SeqNum == 0 || req.SeqNum > maxSeq+1 {
		utils.Fail(c, 400, "invalid seq_num")
		return
	}
	point := model.RoutePoint{
		RouteID:     route.ID,
		SeqNum:      req.SeqNum,
		Lng:         req.Lng,
		Lat:         req.Lat,
		Altitude:    req.Altitude,
		Speed:       req.Speed,
		PointType:   req.PointType,
		Action:      req.Action,
		Heading:     req.Heading,
		GimbalPitch: req.GimbalPitch,
		HoverTime:   req.HoverTime,
	}
	if err := database.DB.Create(&point).Error; err != nil {
		utils.Fail(c, 500, "failed to add route point")
		return
	}
	utils.Success(c, point)
}

func DeleteRoutePoint(c *gin.Context) {
	pointID := c.Param("point_id")
	if err := database.DB.Delete(&model.RoutePoint{}, pointID).Error; err != nil {
		utils.Fail(c, 500, "failed to delete route point")
		return
	}
	utils.Success(c, nil)
}

func ValidateRouteNoFlyZone(c *gin.Context) {
	id := c.Param("id")
	var route model.Route
	if err := database.DB.Preload("Points", func(db *gorm.DB) *gorm.DB {
		return db.Order("seq_num ASC")
	}).First(&route, id).Error; err != nil {
		utils.Fail(c, 404, "route not found")
		return
	}
	var zones []model.NoFlyZone
	database.DB.Find(&zones)
	var conflicts []gin.H
	for _, p := range route.Points {
		for _, z := range zones {
			if isPointInZone(p.Lng, p.Lat, nil, z) {
				conflicts = append(conflicts, gin.H{
					"route_point_id": p.ID,
					"seq_num":        p.SeqNum,
					"no_fly_zone_id": z.ID,
					"zone_name":      z.Name,
				})
			}
		}
	}
	utils.Success(c, gin.H{
		"has_conflict": len(conflicts) > 0,
		"conflicts":    conflicts,
	})
}
