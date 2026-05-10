package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetTaskResultList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	var results []models.TaskResult
	var total int64

	query := database.DB.Model(&models.TaskResult{}).
		Preload("TaskAssignment").
		Preload("TaskAssignment.User").
		Preload("TaskAssignment.Task")

	if status != "" {
		query = query.Where("task_results.status = ?", status)
	}
	if keyword != "" {
		query = query.Joins("JOIN task_assignments ON task_results.task_assignment_id = task_assignments.id").
			Joins("JOIN users ON task_assignments.user_id = users.id").
			Where("users.username LIKE ? OR users.nickname LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("task_results.id DESC").Find(&results)

	utils.Success(c, gin.H{
		"list":      results,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetTaskResultDetail(c *gin.Context) {
	id := c.Param("id")
	var result models.TaskResult
	if err := database.DB.Preload("TaskAssignment").Preload("TaskAssignment.User").Preload("TaskAssignment.Task").First(&result, id).Error; err != nil {
		utils.NotFound(c, "结果不存在")
		return
	}
	utils.Success(c, result)
}

func DeleteTaskResult(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.TaskResult{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

type AuditResultRequest struct {
	Status      int    `json:"status" binding:"required"`
	AuditRemark string `json:"audit_remark"`
}

func AuditTaskResult(c *gin.Context) {
	id := c.Param("id")
	var req AuditResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var result models.TaskResult
	if err := database.DB.First(&result, id).Error; err != nil {
		utils.NotFound(c, "结果不存在")
		return
	}

	updates := map[string]interface{}{
		"status":       req.Status,
		"audit_remark": req.AuditRemark,
	}

	if err := database.DB.Model(&result).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	if req.Status == 1 {
		var assignment models.TaskAssignment
		database.DB.First(&assignment, result.TaskAssignmentID)
		database.DB.Model(&assignment).Update("status", 3)
	}

	utils.SuccessWithMessage(c, "审核成功", result)
}
