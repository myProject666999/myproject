package handler

import (
	"math"

	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type AnnotationReq struct {
	MediaID     uint64  `json:"media_id" binding:"required"`
	TaskID      uint64  `json:"task_id" binding:"required"`
	AreaID      uint64  `json:"area_id" binding:"required"`
	Title       string  `json:"title" binding:"required"`
	Category    int8    `json:"category"`
	Severity    int8    `json:"severity"`
	Description string  `json:"description"`
	ShapeType   int8    `json:"shape_type"`
	ShapeData   string  `json:"shape_data" binding:"required"`
	XRatio      float64 `json:"x_ratio"`
	YRatio      float64 `json:"y_ratio"`
	WidthRatio  float64 `json:"width_ratio"`
	HeightRatio float64 `json:"height_ratio"`
}

func CreateAnnotation(c *gin.Context) {
	var req AnnotationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	userID := c.GetUint64("user_id")
	annotation := model.Annotation{
		MediaID:     req.MediaID,
		TaskID:      req.TaskID,
		AreaID:      req.AreaID,
		Title:       req.Title,
		Category:    req.Category,
		Severity:    req.Severity,
		Description: req.Description,
		ShapeType:   req.ShapeType,
		ShapeData:   req.ShapeData,
		XRatio:      req.XRatio,
		YRatio:      req.YRatio,
		WidthRatio:  req.WidthRatio,
		HeightRatio: req.HeightRatio,
		Status:      0,
		CreatedBy:   userID,
	}
	var media model.MediaFile
	if err := database.DB.First(&media, req.MediaID).Error; err == nil {
		geoLng, geoLat := convertImageToGeo(
			req.XRatio, req.YRatio,
			media.CaptureLng, media.CaptureLat,
			media.CaptureAltitude,
			media.CaptureHeading,
			media.CaptureGimbalPitch,
			media.Width, media.Height,
		)
		annotation.GeoLng = geoLng
		annotation.GeoLat = geoLat
	}
	if err := database.DB.Create(&annotation).Error; err != nil {
		utils.Fail(c, 500, "failed to create annotation")
		return
	}
	utils.Success(c, annotation)
}

func GetAnnotation(c *gin.Context) {
	id := c.Param("id")
	var annotation model.Annotation
	if err := database.DB.First(&annotation, id).Error; err != nil {
		utils.Fail(c, 404, "annotation not found")
		return
	}
	utils.Success(c, annotation)
}

func UpdateAnnotation(c *gin.Context) {
	id := c.Param("id")
	var annotation model.Annotation
	if err := database.DB.First(&annotation, id).Error; err != nil {
		utils.Fail(c, 404, "annotation not found")
		return
	}
	var req AnnotationReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&annotation).Updates(map[string]interface{}{
		"title":       req.Title,
		"category":    req.Category,
		"severity":    req.Severity,
		"description": req.Description,
		"shape_type":  req.ShapeType,
		"shape_data":  req.ShapeData,
		"x_ratio":     req.XRatio,
		"y_ratio":     req.YRatio,
		"width_ratio": req.WidthRatio,
		"height_ratio": req.HeightRatio,
	})
	utils.Success(c, annotation)
}

func DeleteAnnotation(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Annotation{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete annotation")
		return
	}
	utils.Success(c, nil)
}

func ListAnnotations(c *gin.Context) {
	var annotations []model.Annotation
	query := database.DB.Model(&model.Annotation{})
	if taskID := c.Query("task_id"); taskID != "" {
		query = query.Where("task_id = ?", taskID)
	}
	if mediaID := c.Query("media_id"); mediaID != "" {
		query = query.Where("media_id = ?", mediaID)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	if severity := c.Query("severity"); severity != "" {
		query = query.Where("severity = ?", severity)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at DESC").Find(&annotations)
	utils.Success(c, gin.H{"total": total, "list": annotations})
}

func convertImageToGeo(xRatio, yRatio float64, captureLng, captureLat *float64, altitude float64, heading, gimbalPitch float64, imgWidth, imgHeight int) (*float64, *float64) {
	if captureLng == nil || captureLat == nil {
		return nil, nil
	}
	if altitude <= 0 {
		return captureLng, captureLat
	}
	pitchRad := gimbalPitch * math.Pi / 180
	headingRad := heading * math.Pi / 180
	groundDist := 0.0
	if math.Abs(math.Cos(pitchRad)) > 0.001 {
		groundDist = altitude * math.Abs(math.Tan(pitchRad))
	}
	offsetX := (xRatio - 0.5) * groundDist
	offsetY := (yRatio - 0.5) * groundDist
	deltaLng := (offsetX*math.Cos(headingRad) - offsetY*math.Sin(headingRad)) / 111320.0
	deltaLat := (offsetX*math.Sin(headingRad) + offsetY*math.Cos(headingRad)) / 110540.0
	geoLng := *captureLng + deltaLng
	geoLat := *captureLat + deltaLat
	return &geoLng, &geoLat
}
