package handler

import (
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetReportList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	taskID, _ := strconv.ParseUint(c.Query("task_id"), 10, 64)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := repository.DB.Model(&model.Report{}).Where("status = 1")
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}
	if taskID > 0 {
		query = query.Where("task_id = ?", taskID)
	}

	var total int64
	query.Count(&total)

	var reports []model.Report
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&reports)

	utils.Success(c, gin.H{
		"list":  reports,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func GetReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid report ID")
		return
	}

	var report model.Report
	if err := repository.DB.First(&report, id).Error; err != nil {
		utils.NotFound(c, "Report not found")
		return
	}

	utils.Success(c, report)
}

func GetReportByTaskID(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("task_id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	var report model.Report
	if err := repository.DB.Where("task_id = ? AND status = 1", taskID).First(&report).Error; err != nil {
		utils.NotFound(c, "Report not found")
		return
	}

	utils.Success(c, report)
}

func DeleteReport(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid report ID")
		return
	}

	var report model.Report
	if err := repository.DB.First(&report, id).Error; err != nil {
		utils.NotFound(c, "Report not found")
		return
	}

	report.Status = 0
	if err := repository.DB.Save(&report).Error; err != nil {
		utils.InternalError(c, "Failed to delete report")
		return
	}

	utils.Success(c, nil)
}
