package handler

import (
	"encoding/json"
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateBaselineRequest struct {
	Name              string   `json:"name" binding:"required,max=100"`
	ReportID          uint64   `json:"report_id" binding:"required"`
	ThresholdQPS      *float64 `json:"threshold_qps"`
	ThresholdRTP95    *int     `json:"threshold_rt_p95"`
	ThresholdErrRate  *float64 `json:"threshold_error_rate"`
	IsDefault         int8     `json:"is_default"`
	Description       string   `json:"description"`
}

type ComparisonRequest struct {
	BaselineID uint64 `json:"baseline_id" binding:"required"`
	ReportID   uint64 `json:"report_id" binding:"required"`
	Name       string `json:"name"`
}

func CreateBaseline(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateBaselineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters: "+err.Error())
		return
	}

	var report model.Report
	if err := repository.DB.First(&report, req.ReportID).Error; err != nil {
		utils.NotFound(c, "Report not found")
		return
	}

	var task model.Task
	if err := repository.DB.First(&task, report.TaskID).Error; err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	baselineData := map[string]interface{}{
		"avg_qps":     report.AvgQPS,
		"peak_qps":    report.PeakQPS,
		"avg_rt":      report.AvgRT,
		"p50_rt":      report.P50RT,
		"p95_rt":      report.P95RT,
		"p99_rt":      report.P99RT,
		"error_rate":  report.ErrorRate,
		"total_req":   report.TotalRequests,
	}

	baselineDataJSON, _ := json.Marshal(baselineData)

	baseline := &model.Baseline{
		Name:              req.Name,
		TargetID:          task.TargetID,
		Path:              task.Path,
		Method:            task.Method,
		ReportID:          req.ReportID,
		BaselineData:      string(baselineDataJSON),
		ThresholdQPS:      req.ThresholdQPS,
		ThresholdRTP95:    req.ThresholdRTP95,
		ThresholdErrRate:  req.ThresholdErrRate,
		IsDefault:         req.IsDefault,
		Description:       req.Description,
		CreatedBy:         userID,
	}

	if req.IsDefault == 1 {
		repository.DB.Model(&model.Baseline{}).
			Where("target_id = ? AND path = ? AND method = ?", task.TargetID, task.Path, task.Method).
			Update("is_default", 0)
	}

	if err := repository.DB.Create(baseline).Error; err != nil {
		utils.InternalError(c, "Failed to create baseline")
		return
	}

	utils.Success(c, baseline)
}

func GetBaselineList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	targetID, _ := strconv.ParseUint(c.Query("target_id"), 10, 64)
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := repository.DB.Model(&model.Baseline{})
	if targetID > 0 {
		query = query.Where("target_id = ?", targetID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var baselines []model.Baseline
	query.Order("is_default DESC, id DESC").Offset(offset).Limit(pageSize).Find(&baselines)

	utils.Success(c, gin.H{
		"list":  baselines,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func GetBaseline(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid baseline ID")
		return
	}

	var baseline model.Baseline
	if err := repository.DB.First(&baseline, id).Error; err != nil {
		utils.NotFound(c, "Baseline not found")
		return
	}

	utils.Success(c, baseline)
}

func UpdateBaseline(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid baseline ID")
		return
	}

	var baseline model.Baseline
	if err := repository.DB.First(&baseline, id).Error; err != nil {
		utils.NotFound(c, "Baseline not found")
		return
	}

	var req struct {
		Name             string   `json:"name"`
		ThresholdQPS     *float64 `json:"threshold_qps"`
		ThresholdRTP95   *int     `json:"threshold_rt_p95"`
		ThresholdErrRate *float64 `json:"threshold_error_rate"`
		IsDefault        *int8    `json:"is_default"`
		Description      string   `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters")
		return
	}

	if req.Name != "" {
		baseline.Name = req.Name
	}
	if req.ThresholdQPS != nil {
		baseline.ThresholdQPS = req.ThresholdQPS
	}
	if req.ThresholdRTP95 != nil {
		baseline.ThresholdRTP95 = req.ThresholdRTP95
	}
	if req.ThresholdErrRate != nil {
		baseline.ThresholdErrRate = req.ThresholdErrRate
	}
	if req.IsDefault != nil {
		if *req.IsDefault == 1 {
			repository.DB.Model(&model.Baseline{}).
				Where("target_id = ? AND path = ? AND method = ?", baseline.TargetID, baseline.Path, baseline.Method).
				Update("is_default", 0)
		}
		baseline.IsDefault = *req.IsDefault
	}
	if req.Description != "" {
		baseline.Description = req.Description
	}

	if err := repository.DB.Save(&baseline).Error; err != nil {
		utils.InternalError(c, "Failed to update baseline")
		return
	}

	utils.Success(c, baseline)
}

func DeleteBaseline(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid baseline ID")
		return
	}

	if err := repository.DB.Delete(&model.Baseline{}, id).Error; err != nil {
		utils.InternalError(c, "Failed to delete baseline")
		return
	}

	utils.Success(c, nil)
}

func CompareWithBaseline(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req ComparisonRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters: "+err.Error())
		return
	}

	var baseline model.Baseline
	if err := repository.DB.First(&baseline, req.BaselineID).Error; err != nil {
		utils.NotFound(c, "Baseline not found")
		return
	}

	var report model.Report
	if err := repository.DB.First(&report, req.ReportID).Error; err != nil {
		utils.NotFound(c, "Report not found")
		return
	}

	var baselineData map[string]interface{}
	json.Unmarshal([]byte(baseline.BaselineData), &baselineData)

	comparisonResult := make(map[string]interface{})
	alarms := make([]map[string]interface{}, 0)

	baselineQPS := baselineData["avg_qps"].(float64)
	qpsDiff := (report.AvgQPS - baselineQPS) / baselineQPS * 100
	comparisonResult["qps"] = map[string]interface{}{
		"baseline": baselineQPS,
		"current":  report.AvgQPS,
		"diff_pct": qpsDiff,
	}
	if baseline.ThresholdQPS != nil && report.AvgQPS < baselineQPS*(1-*baseline.ThresholdQPS/100) {
		alarms = append(alarms, map[string]interface{}{
			"type":    "qps",
			"level":   1,
			"message": "QPS低于基线阈值",
		})
	}

	baselineP95 := baselineData["p95_rt"].(float64)
	rtP95Diff := float64(report.P95RT) - baselineP95
	comparisonResult["rt_p95"] = map[string]interface{}{
		"baseline": baselineP95,
		"current":  report.P95RT,
		"diff_ms":  rtP95Diff,
	}
	if baseline.ThresholdRTP95 != nil && report.P95RT > *baseline.ThresholdRTP95 {
		alarms = append(alarms, map[string]interface{}{
			"type":    "rt_p95",
			"level":   2,
			"message": "P95响应时间超过阈值",
		})
	}

	baselineErrRate := baselineData["error_rate"].(float64)
	comparisonResult["error_rate"] = map[string]interface{}{
		"baseline": baselineErrRate,
		"current":  report.ErrorRate,
		"diff_pct": report.ErrorRate - baselineErrRate,
	}
	if baseline.ThresholdErrRate != nil && report.ErrorRate > *baseline.ThresholdErrRate {
		alarms = append(alarms, map[string]interface{}{
			"type":    "error_rate",
			"level":   2,
			"message": "错误率超过阈值",
		})
	}

	comparisonData, _ := json.Marshal(comparisonResult)
	alarmDetails, _ := json.Marshal(alarms)

	name := req.Name
	if name == "" {
		name = "基线对比 - " + baseline.Name + " vs 报告" + strconv.FormatUint(req.ReportID, 10)
	}

	comparison := &model.Comparison{
		Name:           name,
		BaselineID:     req.BaselineID,
		ReportID:       req.ReportID,
		ComparisonData: string(comparisonData),
		HasAlarm:       int8(map[bool]int{true: 1, false: 0}[len(alarms) > 0]),
		AlarmDetails:   string(alarmDetails),
		CreatedBy:      userID,
	}

	if err := repository.DB.Create(comparison).Error; err != nil {
		utils.InternalError(c, "Failed to create comparison")
		return
	}

	if len(alarms) > 0 {
		for _, alarm := range alarms {
			alarmModel := &model.Alarm{
				ReportID:     &req.ReportID,
				BaselineID:   &req.BaselineID,
				ComparisonID: &comparison.ID,
				Type:         "threshold",
				Level:        int8(alarm["level"].(int)),
				Metric:       alarm["type"].(string),
				Message:      alarm["message"].(string),
				Status:       0,
			}
			repository.DB.Create(alarmModel)
		}
	}

	utils.Success(c, gin.H{
		"comparison_id": comparison.ID,
		"result":        comparisonResult,
		"has_alarm":     len(alarms) > 0,
		"alarms":        alarms,
	})
}

func GetComparisonList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var total int64
	repository.DB.Model(&model.Comparison{}).Count(&total)

	var comparisons []model.Comparison
	repository.DB.Order("id DESC").Offset(offset).Limit(pageSize).Find(&comparisons)

	utils.Success(c, gin.H{
		"list":  comparisons,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func GetAlarmList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status, _ := strconv.Atoi(c.Query("status"))

	offset := (page - 1) * pageSize

	query := repository.DB.Model(&model.Alarm{})
	if status >= 0 {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var alarms []model.Alarm
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&alarms)

	utils.Success(c, gin.H{
		"list":  alarms,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func HandleAlarm(c *gin.Context) {
	userID := c.GetUint64("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid alarm ID")
		return
	}

	var alarm model.Alarm
	if err := repository.DB.First(&alarm, id).Error; err != nil {
		utils.NotFound(c, "Alarm not found")
		return
	}

	alarm.Status = 1
	alarm.HandledBy = &userID
	if err := repository.DB.Save(&alarm).Error; err != nil {
		utils.InternalError(c, "Failed to handle alarm")
		return
	}

	utils.Success(c, nil)
}
