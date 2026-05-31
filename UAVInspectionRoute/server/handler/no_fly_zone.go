package handler

import (
	"encoding/json"
	"math"

	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type NoFlyZoneReq struct {
	Name            string   `json:"name" binding:"required"`
	ZoneType        int8     `json:"zone_type"`
	CenterLng       float64  `json:"center_lng" binding:"required"`
	CenterLat       float64  `json:"center_lat" binding:"required"`
	Radius          float64  `json:"radius"`
	BoundaryPolygon *string  `json:"boundary_polygon"`
	MaxAltitude     float64  `json:"max_altitude"`
	EffectiveFrom   *string  `json:"effective_from"`
	EffectiveTo     *string  `json:"effective_to"`
	Source          string   `json:"source"`
}

func CreateNoFlyZone(c *gin.Context) {
	var req NoFlyZoneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	zone := model.NoFlyZone{
		Name:            req.Name,
		ZoneType:        req.ZoneType,
		CenterLng:       req.CenterLng,
		CenterLat:       req.CenterLat,
		Radius:          req.Radius,
		BoundaryPolygon: req.BoundaryPolygon,
		MaxAltitude:     req.MaxAltitude,
		Source:          req.Source,
	}
	if err := database.DB.Create(&zone).Error; err != nil {
		utils.Fail(c, 500, "failed to create no-fly zone")
		return
	}
	utils.Success(c, zone)
}

func GetNoFlyZone(c *gin.Context) {
	id := c.Param("id")
	var zone model.NoFlyZone
	if err := database.DB.First(&zone, id).Error; err != nil {
		utils.Fail(c, 404, "no-fly zone not found")
		return
	}
	utils.Success(c, zone)
}

func UpdateNoFlyZone(c *gin.Context) {
	id := c.Param("id")
	var zone model.NoFlyZone
	if err := database.DB.First(&zone, id).Error; err != nil {
		utils.Fail(c, 404, "no-fly zone not found")
		return
	}
	var req NoFlyZoneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&zone).Updates(map[string]interface{}{
		"name":             req.Name,
		"zone_type":        req.ZoneType,
		"center_lng":       req.CenterLng,
		"center_lat":       req.CenterLat,
		"radius":           req.Radius,
		"boundary_polygon": req.BoundaryPolygon,
		"max_altitude":     req.MaxAltitude,
		"source":           req.Source,
	})
	utils.Success(c, zone)
}

func DeleteNoFlyZone(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.NoFlyZone{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete no-fly zone")
		return
	}
	utils.Success(c, nil)
}

func ListNoFlyZones(c *gin.Context) {
	var zones []model.NoFlyZone
	query := database.DB.Model(&model.NoFlyZone{})
	if zoneType := c.Query("zone_type"); zoneType != "" {
		query = query.Where("zone_type = ?", zoneType)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&zones)
	utils.Success(c, gin.H{"total": total, "list": zones})
}

type CheckNoFlyZoneReq struct {
	Lng      float64  `json:"lng" binding:"required"`
	Lat      float64  `json:"lat" binding:"required"`
	Altitude *float64 `json:"altitude"`
}

func CheckNoFlyZone(c *gin.Context) {
	var req CheckNoFlyZoneReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var zones []model.NoFlyZone
	database.DB.Find(&zones)
	var conflicts []model.NoFlyZone
	for _, z := range zones {
		if isPointInZone(req.Lng, req.Lat, req.Altitude, z) {
			conflicts = append(conflicts, z)
		}
	}
	utils.Success(c, gin.H{
		"in_no_fly_zone": len(conflicts) > 0,
		"conflicts":      conflicts,
	})
}

func isPointInZone(lng, lat float64, altitude *float64, zone model.NoFlyZone) bool {
	if zone.Radius > 0 {
		dist := haversineDistance(lat, lng, zone.CenterLat, zone.CenterLng)
		if dist <= zone.Radius {
			if altitude != nil && zone.MaxAltitude > 0 && *altitude > zone.MaxAltitude {
				return false
			}
			return true
		}
	}
	if zone.BoundaryPolygon != nil {
		polygon := parsePolygon(*zone.BoundaryPolygon)
		if pointInPolygon(lng, lat, polygon) {
			if altitude != nil && zone.MaxAltitude > 0 && *altitude > zone.MaxAltitude {
				return false
			}
			return true
		}
	}
	return false
}

func haversineDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const R = 6371000.0
	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func parsePolygon(data string) [][2]float64 {
	var coords [][2]float64
	if err := json.Unmarshal([]byte(data), &coords); err != nil {
		return nil
	}
	return coords
}

func pointInPolygon(lng, lat float64, polygon [][2]float64) bool {
	n := len(polygon)
	if n < 3 {
		return false
	}
	inside := false
	j := n - 1
	for i := 0; i < n; i++ {
		xi, yi := polygon[i][0], polygon[i][1]
		xj, yj := polygon[j][0], polygon[j][1]
		if ((yi > lat) != (yj > lat)) && (lng < (xj-xi)*(lat-yi)/(yj-yi)+xi) {
			inside = !inside
		}
		j = i
	}
	return inside
}
