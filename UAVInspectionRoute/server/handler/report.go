package handler

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type ReportReq struct {
	Title      string `json:"title" binding:"required"`
	TaskID     uint64 `json:"task_id" binding:"required"`
	AreaID     uint64 `json:"area_id" binding:"required"`
	ReportType int8   `json:"report_type"`
}

func CreateReport(c *gin.Context) {
	var req ReportReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	userID := c.GetUint64("user_id")
	report := model.Report{
		Title:      req.Title,
		TaskID:     req.TaskID,
		AreaID:     req.AreaID,
		ReportType: req.ReportType,
		Status:     0,
		CreatedBy:  userID,
	}
	if err := database.DB.Create(&report).Error; err != nil {
		utils.Fail(c, 500, "failed to create report")
		return
	}
	utils.Success(c, report)
}

func GetReport(c *gin.Context) {
	id := c.Param("id")
	var report model.Report
	if err := database.DB.First(&report, id).Error; err != nil {
		utils.Fail(c, 404, "report not found")
		return
	}
	utils.Success(c, report)
}

func UpdateReport(c *gin.Context) {
	id := c.Param("id")
	var report model.Report
	if err := database.DB.First(&report, id).Error; err != nil {
		utils.Fail(c, 404, "report not found")
		return
	}
	var req ReportReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&report).Updates(map[string]interface{}{
		"title":       req.Title,
		"report_type": req.ReportType,
	})
	utils.Success(c, report)
}

func DeleteReport(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Report{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete report")
		return
	}
	utils.Success(c, nil)
}

func ListReports(c *gin.Context) {
	var reports []model.Report
	query := database.DB.Model(&model.Report{})
	if taskID := c.Query("task_id"); taskID != "" {
		query = query.Where("task_id = ?", taskID)
	}
	if areaID := c.Query("area_id"); areaID != "" {
		query = query.Where("area_id = ?", areaID)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at DESC").Find(&reports)
	utils.Success(c, gin.H{"total": total, "list": reports})
}

func GenerateReport(c *gin.Context) {
	id := c.Param("id")
	var report model.Report
	if err := database.DB.First(&report, id).Error; err != nil {
		utils.Fail(c, 404, "report not found")
		return
	}
	var totalMedia int64
	database.DB.Model(&model.MediaFile{}).Where("task_id = ?", report.TaskID).Count(&totalMedia)
	var totalAnnotations int64
	database.DB.Model(&model.Annotation{}).Where("task_id = ?", report.TaskID).Count(&totalAnnotations)
	var criticalCount int64
	database.DB.Model(&model.Annotation{}).Where("task_id = ? AND severity = 3", report.TaskID).Count(&criticalCount)
	var severeCount int64
	database.DB.Model(&model.Annotation{}).Where("task_id = ? AND severity = 2", report.TaskID).Count(&severeCount)
	var normalCount int64
	database.DB.Model(&model.Annotation{}).Where("task_id = ? AND severity = 1", report.TaskID).Count(&normalCount)
	var infoCount int64
	database.DB.Model(&model.Annotation{}).Where("task_id = ? AND severity = 0", report.TaskID).Count(&infoCount)
	var task model.Task
	database.DB.First(&task, report.TaskID)
	contentData := gin.H{
		"task_title":    task.Title,
		"total_media":   totalMedia,
		"total_annotations": totalAnnotations,
		"severity_distribution": gin.H{
			"critical": criticalCount,
			"severe":   severeCount,
			"normal":   normalCount,
			"info":     infoCount,
		},
	}
	contentJSON, _ := json.Marshal(contentData)
	contentStr := string(contentJSON)
	database.DB.Model(&report).Updates(map[string]interface{}{
		"total_media":      totalMedia,
		"total_annotations": totalAnnotations,
		"critical_count":   criticalCount,
		"severe_count":     severeCount,
		"normal_count":     normalCount,
		"info_count":       infoCount,
		"flight_duration":  task.ActualDuration,
		"flight_distance":  task.FlightDistance,
		"content":          contentStr,
		"status":           1,
	})
	database.DB.First(&report, id)
	utils.Success(c, report)
}
