package handler

import (
	"time"

	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type TaskReq struct {
	Title          string `json:"title" binding:"required"`
	AreaID         uint64 `json:"area_id" binding:"required"`
	RouteID        uint64 `json:"route_id" binding:"required"`
	Priority       int8   `json:"priority"`
	InspectionType int8   `json:"inspection_type"`
	ScheduledAt    *string `json:"scheduled_at"`
}

type TaskStatusReq struct {
	Status int8   `json:"status" binding:"required"`
	Remark string `json:"remark"`
}

var validTransitions = map[int8][]int8{
	0: {1},
	1: {2, 4},
	2: {3, 4, 5},
}

func isValidTransition(from, to int8) bool {
	allowed, ok := validTransitions[from]
	if !ok {
		return false
	}
	for _, s := range allowed {
		if s == to {
			return true
		}
	}
	return false
}

func CreateTask(c *gin.Context) {
	var req TaskReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	userID := c.GetUint64("user_id")
	task := model.Task{
		Title:          req.Title,
		AreaID:         req.AreaID,
		RouteID:        req.RouteID,
		Priority:       req.Priority,
		InspectionType: req.InspectionType,
		Status:         0,
		CreatedBy:      userID,
		OperatorID:     userID,
	}
	if req.ScheduledAt != nil {
		t, err := time.Parse("2006-01-02 15:04:05", *req.ScheduledAt)
		if err == nil {
			task.ScheduledAt = &t
		}
	}
	if err := database.DB.Create(&task).Error; err != nil {
		utils.Fail(c, 500, "failed to create task")
		return
	}
	utils.Success(c, task)
}

func GetTask(c *gin.Context) {
	id := c.Param("id")
	var task model.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.Fail(c, 404, "task not found")
		return
	}
	utils.Success(c, task)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var task model.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.Fail(c, 404, "task not found")
		return
	}
	var req TaskReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	updates := map[string]interface{}{
		"title":           req.Title,
		"area_id":         req.AreaID,
		"route_id":        req.RouteID,
		"priority":        req.Priority,
		"inspection_type": req.InspectionType,
	}
	if req.ScheduledAt != nil {
		t, err := time.Parse("2006-01-02 15:04:05", *req.ScheduledAt)
		if err == nil {
			updates["scheduled_at"] = t
		}
	}
	database.DB.Model(&task).Updates(updates)
	utils.Success(c, task)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Task{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete task")
		return
	}
	utils.Success(c, nil)
}

func ListTasks(c *gin.Context) {
	var tasks []model.Task
	query := database.DB.Model(&model.Task{})
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if areaID := c.Query("area_id"); areaID != "" {
		query = query.Where("area_id = ?", areaID)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at DESC").Find(&tasks)
	utils.Success(c, gin.H{"total": total, "list": tasks})
}

func UpdateTaskStatus(c *gin.Context) {
	id := c.Param("id")
	var task model.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.Fail(c, 404, "task not found")
		return
	}
	var req TaskStatusReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	if !isValidTransition(task.Status, req.Status) {
		utils.Fail(c, 400, "invalid status transition")
		return
	}
	userID := c.GetUint64("user_id")
	now := time.Now()
	updates := map[string]interface{}{
		"status": req.Status,
	}
	switch req.Status {
	case 1:
		if task.DroneID != nil {
			updates["started_at"] = nil
		}
	case 2:
		updates["started_at"] = now
	case 3:
		updates["completed_at"] = now
	case 4:
	case 5:
	}
	database.DB.Model(&task).Updates(updates)
	log := model.TaskStatusLog{
		TaskID:     task.ID,
		FromStatus: task.Status,
		ToStatus:   req.Status,
		OperatorID: userID,
		Remark:     req.Remark,
	}
	database.DB.Create(&log)
	utils.Success(c, task)
}

func GetTaskStatusLogs(c *gin.Context) {
	id := c.Param("id")
	var logs []model.TaskStatusLog
	database.DB.Where("task_id = ?", id).Order("created_at ASC").Find(&logs)
	utils.Success(c, logs)
}

func AssignDroneToTask(c *gin.Context) {
	id := c.Param("id")
	var task model.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.Fail(c, 404, "task not found")
		return
	}
	var req struct {
		DroneID uint64 `json:"drone_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&task).Update("drone_id", req.DroneID)
	utils.Success(c, task)
}
