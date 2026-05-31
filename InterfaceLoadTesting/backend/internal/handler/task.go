package handler

import (
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/loadtest"
	"load-testing/pkg/logger"
	"load-testing/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateTaskRequest struct {
	Name        string  `json:"name" binding:"required,max=100"`
	TargetID    uint64  `json:"target_id" binding:"required"`
	Method      string  `json:"method" binding:"required,oneof=GET POST PUT DELETE PATCH HEAD OPTIONS"`
	Path        string  `json:"path" binding:"required,max=255"`
	Headers     string  `json:"headers"`
	Body        string  `json:"body"`
	Concurrency int     `json:"concurrency" binding:"required,min=1,max=10000"`
	Duration    int     `json:"duration" binding:"required,min=1,max=86400"`
	RampUp      int     `json:"ramp_up" binding:"min=0,max=3600"`
	Steps       *int    `json:"steps" binding:"omitempty,min=1,max=100"`
	QPSLimit    *int    `json:"qps_limit" binding:"omitempty,min=1"`
	Timeout     int     `json:"timeout" binding:"min=1,max=300"`
}

func CreateTask(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters: "+err.Error())
		return
	}

	var target model.Target
	if err := repository.DB.First(&target, req.TargetID).Error; err != nil {
		utils.NotFound(c, "Target not found")
		return
	}

	if target.Status != 1 {
		utils.BadRequest(c, "Target is disabled")
		return
	}

	task := &model.Task{
		Name:        req.Name,
		TargetID:    req.TargetID,
		Method:      req.Method,
		Path:        req.Path,
		Headers:     req.Headers,
		Body:        req.Body,
		Concurrency: req.Concurrency,
		Duration:    req.Duration,
		RampUp:      req.RampUp,
		Steps:       req.Steps,
		QPSLimit:    req.QPSLimit,
		Timeout:     req.Timeout,
		Status:      0,
		Progress:    0,
		CreatedBy:   userID,
	}

	if req.Timeout == 0 {
		task.Timeout = 30
	}

	if err := repository.DB.Create(task).Error; err != nil {
		utils.InternalError(c, "Failed to create task")
		return
	}

	utils.Success(c, task)
}

func GetTaskList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status, _ := strconv.Atoi(c.Query("status"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := repository.DB.Model(&model.Task{})
	if status >= 0 {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var tasks []model.Task
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&tasks)

	utils.Success(c, gin.H{
		"list":  tasks,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func GetTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	var task model.Task
	if err := repository.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	utils.Success(c, task)
}

func StartTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	var task model.Task
	if err := repository.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	if task.Status != 0 {
		utils.BadRequest(c, "Task is not in pending status")
		return
	}

	var target model.Target
	if err := repository.DB.First(&target, task.TargetID).Error; err != nil {
		utils.NotFound(c, "Target not found")
		return
	}

	if target.Status != 1 {
		utils.BadRequest(c, "Target is disabled")
		return
	}

	loadtest.Manager.StartTask(&task, &target)

	utils.Success(c, gin.H{"message": "Task started successfully"})
}

func StopTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	var task model.Task
	if err := repository.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	if task.Status != 1 {
		utils.BadRequest(c, "Task is not running")
		return
	}

	if !loadtest.Manager.StopTask(id) {
		utils.BadRequest(c, "Failed to stop task")
		return
	}

	logger.Infof("Task %d stop signal sent", id)
	utils.Success(c, gin.H{"message": "Task stop signal sent"})
}

func DeleteTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	var task model.Task
	if err := repository.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	if task.Status == 1 {
		utils.BadRequest(c, "Cannot delete running task")
		return
	}

	repository.DB.Where("task_id = ?", id).Delete(&model.Metric{})
	repository.DB.Where("task_id = ?", id).Delete(&model.Report{})
	repository.DB.Where("task_id = ?", id).Delete(&model.TaskNode{})

	if err := repository.DB.Delete(&task).Error; err != nil {
		utils.InternalError(c, "Failed to delete task")
		return
	}

	utils.Success(c, nil)
}
