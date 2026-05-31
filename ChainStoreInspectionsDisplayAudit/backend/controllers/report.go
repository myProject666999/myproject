package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ReportController struct{}

func NewReportController() *ReportController {
	return &ReportController{}
}

func generateReportCode() string {
	now := time.Now()
	dateStr := now.Format("20060102")

	var maxSeq int
	var lastReport models.InspectionReport
	prefix := fmt.Sprintf("REPORT%s%%", dateStr)

	database.DB.Where("report_code LIKE ?", prefix).Order("report_code DESC").First(&lastReport)

	if lastReport.ID > 0 {
		seqStr := lastReport.ReportCode[len(lastReport.ReportCode)-3:]
		maxSeq, _ = strconv.Atoi(seqStr)
	}

	return fmt.Sprintf("REPORT%s%03d", dateStr, maxSeq+1)
}

func (ctrl *ReportController) GetReportList(c *gin.Context) {
	var reports []models.InspectionReport
	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	reportType := c.Query("reportType")
	storeID := c.Query("storeId")

	query := database.DB.Model(&models.InspectionReport{})

	if reportType != "" {
		query = query.Where("report_type = ?", reportType)
	}
	if storeID != "" {
		query = query.Where("store_id = ?", storeID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&reports).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取报告列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":     reports,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (ctrl *ReportController) GetReportDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的报告ID")
		return
	}

	var report models.InspectionReport
	if err := database.DB.First(&report, id).Error; err != nil {
		utils.NotFoundResponse(c, "报告不存在")
		return
	}

	var content map[string]interface{}
	if report.Content != "" {
		json.Unmarshal([]byte(report.Content), &content)
	}

	utils.SuccessResponse(c, gin.H{
		"report":  report,
		"content": content,
	})
}

func (ctrl *ReportController) CreateReport(c *gin.Context) {
	var req struct {
		ReportType  string `json:"reportType" binding:"required"`
		ReportName  string `json:"reportName" binding:"required"`
		TaskID      uint64 `json:"taskId"`
		StoreID     uint64 `json:"storeId"`
		PeriodType  string `json:"periodType"`
		PeriodValue string `json:"periodValue"`
		CreatorID   uint64 `json:"creatorId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	report := models.InspectionReport{
		ReportCode:  generateReportCode(),
		ReportType:  req.ReportType,
		ReportName:  req.ReportName,
		TaskID:      req.TaskID,
		StoreID:     req.StoreID,
		PeriodType:  req.PeriodType,
		PeriodValue: req.PeriodValue,
		CreatorID:   req.CreatorID,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建报告失败")
		return
	}

	utils.SuccessResponse(c, report)
}

func (ctrl *ReportController) GenerateTaskReport(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("taskId"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.Preload("Store").Preload("Inspector").Preload("Template").First(&task, taskID).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	if task.Status != "completed" {
		utils.BadRequestResponse(c, "只有已完成的任务才能生成报告")
		return
	}

	var records []models.InspectionRecord
	if err := database.DB.Where("task_id = ?", taskID).Preload("Item").Preload("Photos").Find(&records).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取检查记录失败")
		return
	}

	var issues []models.Issue
	if err := database.DB.Where("task_id = ?", taskID).Preload("Photos").Preload("Rectifications").Find(&issues).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取问题列表失败")
		return
	}

	passCount := 0
	totalItemScore := 0
	actualItemScore := 0
	for _, record := range records {
		totalItemScore += record.Item.Score
		actualItemScore += record.Score
		if record.IsPass == 1 {
			passCount++
		}
	}

	itemPassRate := 0.0
	if len(records) > 0 {
		itemPassRate = float64(passCount) / float64(len(records)) * 100
	}

	issueByLevel := make(map[string]int)
	issueByType := make(map[string]int)
	rectifiedCount := 0
	for _, issue := range issues {
		issueByLevel[issue.IssueLevel]++
		issueByType[issue.IssueType]++
		if issue.IsRectified == 1 {
			rectifiedCount++
		}
	}

	rectificationRate := 0.0
	if len(issues) > 0 {
		rectificationRate = float64(rectifiedCount) / float64(len(issues)) * 100
	}

	content := map[string]interface{}{
		"basicInfo": map[string]interface{}{
			"taskCode":      task.TaskCode,
			"taskName":      task.TaskName,
			"taskType":      task.TaskType,
			"storeName":     task.Store.StoreName,
			"storeAddress":  task.Store.Address,
			"inspectorName": task.Inspector.RealName,
			"templateName":  task.Template.TemplateName,
			"startTime":     task.StartTime,
			"endTime":       task.EndTime,
			"duration":      task.EndTime.Sub(task.StartTime).Minutes(),
		},
		"scoreInfo": map[string]interface{}{
			"totalScore":      task.Template.TotalScore,
			"actualScore":     task.ActualScore,
			"passScore":       task.Template.PassScore,
			"isPass":          task.IsPass,
			"itemTotalScore":  totalItemScore,
			"itemActualScore": actualItemScore,
			"itemCount":       len(records),
			"passCount":       passCount,
			"itemPassRate":    itemPassRate,
		},
		"issueStats": map[string]interface{}{
			"totalCount":   len(issues),
			"byLevel":      issueByLevel,
			"byType":       issueByType,
		},
		"rectificationInfo": map[string]interface{}{
			"totalCount":        len(issues),
			"rectifiedCount":    rectifiedCount,
			"rectificationRate": rectificationRate,
		},
		"checkDetails": records,
		"issueDetails": issues,
	}

	contentJSON, _ := json.Marshal(content)

	report := models.InspectionReport{
		ReportCode:     generateReportCode(),
		ReportType:     "task",
		ReportName:     fmt.Sprintf("%s-巡检报告", task.Store.StoreName),
		TaskID:         taskID,
		StoreID:        task.StoreID,
		Content:        string(contentJSON),
		Summary:        fmt.Sprintf("本次巡检总分%d分，实际得分%d分，%s。发现问题%d个，已整改%d个，整改率%.2f%%。",
			task.Template.TotalScore, task.ActualScore,
			map[bool]string{true: "合格", false: "不合格"}[task.IsPass == 1],
			len(issues), rectifiedCount, rectificationRate),
		TotalScore:     task.ActualScore,
		AvgScore:       float64(task.ActualScore),
		PassRate:       itemPassRate,
		IssueCount:     len(issues),
		RectifiedCount: rectifiedCount,
		CreatorID:      task.InspectorID,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		utils.InternalServerErrorResponse(c, "生成报告失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"report":  report,
		"content": content,
	})
}

func (ctrl *ReportController) GenerateStoreReport(c *gin.Context) {
	storeID, err := strconv.ParseUint(c.Param("storeId"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的门店ID")
		return
	}

	periodType := c.DefaultQuery("periodType", "month")
	periodValue := c.Query("periodValue")
	creatorID, _ := strconv.ParseUint(c.DefaultQuery("creatorId", "1"), 10, 64)

	if periodValue == "" {
		now := time.Now()
		if periodType == "month" {
			periodValue = now.Format("2006-01")
		} else {
			periodValue = strconv.Itoa(now.Year())
		}
	}

	var store models.Store
	if err := database.DB.First(&store, storeID).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	taskQuery := database.DB.Where("store_id = ? AND status = 'completed'", storeID)
	if periodType == "month" {
		startDate := periodValue + "-01"
		endDate := periodValue + "-31"
		taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
	} else if periodType == "year" {
		startDate := periodValue + "-01-01"
		endDate := periodValue + "-12-31"
		taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
	}

	var tasks []models.InspectionTask
	if err := taskQuery.Preload("Template").Preload("Inspector").Find(&tasks).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取任务列表失败")
		return
	}

	issueQuery := database.DB.Where("store_id = ?", storeID)
	if periodType == "month" {
		startDate := periodValue + "-01 00:00:00"
		endDate := periodValue + "-31 23:59:59"
		issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
	} else if periodType == "year" {
		startDate := periodValue + "-01-01 00:00:00"
		endDate := periodValue + "-12-31 23:59:59"
		issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
	}

	var issues []models.Issue
	if err := issueQuery.Preload("Photos").Find(&issues).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取问题列表失败")
		return
	}

	taskCount := len(tasks)
	totalScore := 0
	passCount := 0
	inspectorStats := make(map[string]int)
	for _, task := range tasks {
		totalScore += task.ActualScore
		if task.IsPass == 1 {
			passCount++
		}
		inspectorStats[task.Inspector.RealName]++
	}

	avgScore := 0.0
	passRate := 0.0
	if taskCount > 0 {
		avgScore = float64(totalScore) / float64(taskCount)
		passRate = float64(passCount) / float64(taskCount) * 100
	}

	issueByLevel := make(map[string]int)
	issueByType := make(map[string]int)
	rectifiedCount := 0
	for _, issue := range issues {
		issueByLevel[issue.IssueLevel]++
		issueByType[issue.IssueType]++
		if issue.IsRectified == 1 {
			rectifiedCount++
		}
	}

	rectificationRate := 0.0
	if len(issues) > 0 {
		rectificationRate = float64(rectifiedCount) / float64(len(issues)) * 100
	}

	content := map[string]interface{}{
		"basicInfo": map[string]interface{}{
			"storeName":    store.StoreName,
			"storeCode":    store.StoreCode,
			"address":      store.Address,
			"managerName":  store.ManagerName,
			"managerPhone": store.ManagerPhone,
			"periodType":   periodType,
			"periodValue":  periodValue,
		},
		"scoreInfo": map[string]interface{}{
			"taskCount":   taskCount,
			"passCount":   passCount,
			"totalScore":  totalScore,
			"avgScore":    avgScore,
			"passRate":    passRate,
		},
		"inspectorStats": inspectorStats,
		"issueStats": map[string]interface{}{
			"totalCount": len(issues),
			"byLevel":    issueByLevel,
			"byType":     issueByType,
		},
		"rectificationInfo": map[string]interface{}{
			"totalCount":        len(issues),
			"rectifiedCount":    rectifiedCount,
			"rectificationRate": rectificationRate,
		},
		"taskList":  tasks,
		"issueList": issues,
	}

	contentJSON, _ := json.Marshal(content)

	report := models.InspectionReport{
		ReportCode:     generateReportCode(),
		ReportType:     "store",
		ReportName:     fmt.Sprintf("%s-%s巡检报告", store.StoreName, periodValue),
		StoreID:        storeID,
		PeriodType:     periodType,
		PeriodValue:    periodValue,
		Content:        string(contentJSON),
		Summary:        fmt.Sprintf("%s期间，%s共完成巡检%d次，合格%d次，合格率%.2f%%。平均得分%.2f分。发现问题%d个，已整改%d个，整改率%.2f%%。",
			periodValue, store.StoreName, taskCount, passCount, passRate, avgScore,
			len(issues), rectifiedCount, rectificationRate),
		TotalScore:     totalScore,
		AvgScore:       avgScore,
		PassRate:       passRate,
		IssueCount:     len(issues),
		RectifiedCount: rectifiedCount,
		CreatorID:      creatorID,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		utils.InternalServerErrorResponse(c, "生成报告失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"report":  report,
		"content": content,
	})
}

func (ctrl *ReportController) GenerateSummaryReport(c *gin.Context) {
	periodType := c.DefaultQuery("periodType", "month")
	periodValue := c.Query("periodValue")
	creatorID, _ := strconv.ParseUint(c.DefaultQuery("creatorId", "1"), 10, 64)

	if periodValue == "" {
		now := time.Now()
		if periodType == "month" {
			periodValue = now.Format("2006-01")
		} else {
			periodValue = strconv.Itoa(now.Year())
		}
	}

	taskQuery := database.DB.Where("status = 'completed'")
	if periodType == "month" {
		startDate := periodValue + "-01"
		endDate := periodValue + "-31"
		taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
	} else if periodType == "year" {
		startDate := periodValue + "-01-01"
		endDate := periodValue + "-12-31"
		taskQuery = taskQuery.Where("DATE(end_time) BETWEEN ? AND ?", startDate, endDate)
	}

	var tasks []models.InspectionTask
	if err := taskQuery.Preload("Store").Preload("Template").Find(&tasks).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取任务列表失败")
		return
	}

	issueQuery := database.DB.Model(&models.Issue{})
	if periodType == "month" {
		startDate := periodValue + "-01 00:00:00"
		endDate := periodValue + "-31 23:59:59"
		issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
	} else if periodType == "year" {
		startDate := periodValue + "-01-01 00:00:00"
		endDate := periodValue + "-12-31 23:59:59"
		issueQuery = issueQuery.Where("discover_time BETWEEN ? AND ?", startDate, endDate)
	}

	var issues []models.Issue
	if err := issueQuery.Find(&issues).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取问题列表失败")
		return
	}

	var stores []models.Store
	database.DB.Where("status = 1").Find(&stores)

	taskCount := len(tasks)
	totalScore := 0
	passCount := 0
	storeStats := make(map[string]map[string]interface{})
	areaStats := make(map[string]int)

	for _, task := range tasks {
		totalScore += task.ActualScore
		if task.IsPass == 1 {
			passCount++
		}

		storeName := task.Store.StoreName
		if _, ok := storeStats[storeName]; !ok {
			storeStats[storeName] = map[string]interface{}{
				"taskCount": 0,
				"passCount": 0,
				"totalScore": 0,
			}
		}
		storeStats[storeName]["taskCount"] = storeStats[storeName]["taskCount"].(int) + 1
		if task.IsPass == 1 {
			storeStats[storeName]["passCount"] = storeStats[storeName]["passCount"].(int) + 1
		}
		storeStats[storeName]["totalScore"] = storeStats[storeName]["totalScore"].(int) + task.ActualScore

		areaStats[task.Store.Area]++
	}

	avgScore := 0.0
	passRate := 0.0
	if taskCount > 0 {
		avgScore = float64(totalScore) / float64(taskCount)
		passRate = float64(passCount) / float64(taskCount) * 100
	}

	issueByLevel := make(map[string]int)
	issueByType := make(map[string]int)
	rectifiedCount := 0
	for _, issue := range issues {
		issueByLevel[issue.IssueLevel]++
		issueByType[issue.IssueType]++
		if issue.IsRectified == 1 {
			rectifiedCount++
		}
	}

	rectificationRate := 0.0
	if len(issues) > 0 {
		rectificationRate = float64(rectifiedCount) / float64(len(issues)) * 100
	}

	storeRankings := make([]map[string]interface{}, 0)
	for storeName, stats := range storeStats {
		sc := stats["taskCount"].(int)
		pc := stats["passCount"].(int)
		ts := stats["totalScore"].(int)
		as := 0.0
		pr := 0.0
		if sc > 0 {
			as = float64(ts) / float64(sc)
			pr = float64(pc) / float64(sc) * 100
		}
		storeRankings = append(storeRankings, map[string]interface{}{
			"storeName": storeName,
			"taskCount": sc,
			"passCount": pc,
			"avgScore":  as,
			"passRate":  pr,
		})
	}

	for i := range storeRankings {
		for j := i + 1; j < len(storeRankings); j++ {
			if storeRankings[i]["avgScore"].(float64) < storeRankings[j]["avgScore"].(float64) {
				storeRankings[i], storeRankings[j] = storeRankings[j], storeRankings[i]
			}
		}
	}

	content := map[string]interface{}{
		"basicInfo": map[string]interface{}{
			"periodType":  periodType,
			"periodValue": periodValue,
			"storeCount":  len(stores),
		},
		"overview": map[string]interface{}{
			"taskCount":   taskCount,
			"passCount":   passCount,
			"totalScore":  totalScore,
			"avgScore":    avgScore,
			"passRate":    passRate,
			"issueCount":  len(issues),
			"rectifiedCount": rectifiedCount,
			"rectificationRate": rectificationRate,
		},
		"storeStats":     storeStats,
		"areaStats":      areaStats,
		"storeRankings":  storeRankings,
		"issueStats": map[string]interface{}{
			"totalCount": len(issues),
			"byLevel":    issueByLevel,
			"byType":     issueByType,
		},
	}

	contentJSON, _ := json.Marshal(content)

	report := models.InspectionReport{
		ReportCode:     generateReportCode(),
		ReportType:     "summary",
		ReportName:     fmt.Sprintf("%s巡检汇总报告", periodValue),
		PeriodType:     periodType,
		PeriodValue:    periodValue,
		Content:        string(contentJSON),
		Summary:        fmt.Sprintf("%s期间，全部门店共完成巡检%d次，合格%d次，合格率%.2f%%。平均得分%.2f分。发现问题%d个，已整改%d个，整改率%.2f%%。",
			periodValue, taskCount, passCount, passRate, avgScore,
			len(issues), rectifiedCount, rectificationRate),
		TotalScore:     totalScore,
		AvgScore:       avgScore,
		PassRate:       passRate,
		IssueCount:     len(issues),
		RectifiedCount: rectifiedCount,
		CreatorID:      creatorID,
	}

	if err := database.DB.Create(&report).Error; err != nil {
		utils.InternalServerErrorResponse(c, "生成报告失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"report":  report,
		"content": content,
	})
}
