package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetTaskList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	taskTypeID := c.Query("task_type_id")
	status := c.Query("status")
	auditStatus := c.Query("audit_status")

	var tasks []models.Task
	var total int64

	query := database.DB.Model(&models.Task{}).Preload("TaskType").Preload("Publisher")
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}
	if taskTypeID != "" {
		query = query.Where("task_type_id = ?", taskTypeID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if auditStatus != "" {
		query = query.Where("audit_status = ?", auditStatus)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&tasks)

	utils.Success(c, gin.H{
		"list":      tasks,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetTaskDetail(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := database.DB.Preload("TaskType").Preload("Publisher").First(&task, id).Error; err != nil {
		utils.NotFound(c, "任务不存在")
		return
	}
	utils.Success(c, task)
}

type CreateTaskRequest struct {
	Title               string  `json:"title" binding:"required"`
	Description         string  `json:"description"`
	TaskTypeID          uint    `json:"task_type_id" binding:"required"`
	PublisherID         uint    `json:"publisher_id" binding:"required"`
	Reward              float64 `json:"reward"`
	Points              int     `json:"points"`
	Location            string  `json:"location"`
	Latitude            float64 `json:"latitude"`
	Longitude           float64 `json:"longitude"`
	StartDate           string  `json:"start_date"`
	EndDate             string  `json:"end_date"`
	MaxParticipants     int     `json:"max_participants"`
	VideoURL            string  `json:"video_url"`
	Thumbnail           string  `json:"thumbnail"`
}

func CreateTask(c *gin.Context) {
	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	task := models.Task{
		Title:           req.Title,
		Description:     req.Description,
		TaskTypeID:      req.TaskTypeID,
		PublisherID:     req.PublisherID,
		Reward:          req.Reward,
		Points:          req.Points,
		Location:        req.Location,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		MaxParticipants: req.MaxParticipants,
		VideoURL:        req.VideoURL,
		Thumbnail:       req.Thumbnail,
		Status:          1,
		AuditStatus:     0,
	}

	if err := database.DB.Create(&task).Error; err != nil {
		utils.InternalServerError(c, "创建任务失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", task)
}

func UpdateTask(c *gin.Context) {
	id := c.Param("id")
	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var task models.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "任务不存在")
		return
	}

	if err := database.DB.Model(&task).Updates(models.Task{
		Title:           req.Title,
		Description:     req.Description,
		TaskTypeID:      req.TaskTypeID,
		PublisherID:     req.PublisherID,
		Reward:          req.Reward,
		Points:          req.Points,
		Location:        req.Location,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		MaxParticipants: req.MaxParticipants,
		VideoURL:        req.VideoURL,
		Thumbnail:       req.Thumbnail,
	}).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", task)
}

func DeleteTask(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Task{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

type AuditTaskRequest struct {
	AuditStatus int    `json:"audit_status" binding:"required"`
	AuditRemark string `json:"audit_remark"`
}

func AuditTask(c *gin.Context) {
	id := c.Param("id")
	var req AuditTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var task models.Task
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.NotFound(c, "任务不存在")
		return
	}

	updates := map[string]interface{}{
		"audit_status": req.AuditStatus,
		"audit_remark": req.AuditRemark,
	}
	if req.AuditStatus == 1 {
		updates["status"] = 1
	} else if req.AuditStatus == 2 {
		updates["status"] = 0
	}

	if err := database.DB.Model(&task).Updates(updates).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	utils.SuccessWithMessage(c, "审核成功", task)
}

func GetTaskComments(c *gin.Context) {
	id := c.Param("id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var comments []models.Comment
	var total int64

	query := database.DB.Model(&models.Comment{}).Where("task_id = ?", id).Preload("User")
	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&comments)

	utils.Success(c, gin.H{
		"list":      comments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Comment{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
