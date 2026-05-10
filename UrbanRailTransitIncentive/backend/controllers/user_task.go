package controllers

import (
	"strconv"
	"time"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetHomeBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Where("status = 1").Order("sort_order ASC, id DESC").Find(&banners)
	utils.Success(c, banners)
}

func GetHomeAnnouncements(c *gin.Context) {
	var announcements []models.Announcement
	database.DB.Where("status = 1").Order("is_top DESC, id DESC").Limit(10).Find(&announcements)
	utils.Success(c, announcements)
}

func GetRecommendedTasks(c *gin.Context) {
	var tasks []models.Task
	database.DB.Where("status = 1 AND audit_status = 1").
		Preload("TaskType").Preload("Publisher").
		Order("id DESC").Limit(10).Find(&tasks)
	utils.Success(c, tasks)
}

func GetTasksForUser(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	taskTypeID := c.Query("task_type_id")
	keyword := c.Query("keyword")

	var tasks []models.Task
	var total int64

	query := database.DB.Model(&models.Task{}).
		Where("status = 1 AND audit_status = 1").
		Preload("TaskType").Preload("Publisher")

	if taskTypeID != "" {
		query = query.Where("task_type_id = ?", taskTypeID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR location LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
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

func AcceptTask(c *gin.Context) {
	userID := c.GetUint("user_id")
	taskIDStr := c.Param("id")
	taskID, _ := strconv.ParseUint(taskIDStr, 10, 64)

	var task models.Task
	if err := database.DB.First(&task, taskID).Error; err != nil {
		utils.NotFound(c, "任务不存在")
		return
	}

	if task.Status != 1 || task.AuditStatus != 1 {
		utils.BadRequest(c, "任务不可接取")
		return
	}

	var existingAssignment models.TaskAssignment
	if database.DB.Where("user_id = ? AND task_id = ? AND status IN (1, 2)", userID, taskID).First(&existingAssignment).Error == nil {
		utils.BadRequest(c, "您已接取该任务")
		return
	}

	if task.MaxParticipants > 0 && task.CurrentParticipants >= task.MaxParticipants {
		utils.BadRequest(c, "任务人数已满")
		return
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	assignment := models.TaskAssignment{
		UserID:     userID,
		TaskID:     uint(taskID),
		Status:     2,
		AcceptedAt: now,
	}

	if err := database.DB.Create(&assignment).Error; err != nil {
		utils.InternalServerError(c, "接取任务失败")
		return
	}

	database.DB.Model(&task).UpdateColumn("current_participants", task.CurrentParticipants+1)

	utils.SuccessWithMessage(c, "接取任务成功", assignment)
}

func GetMyTaskAssignments(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var assignments []models.TaskAssignment
	var total int64

	query := database.DB.Model(&models.TaskAssignment{}).
		Where("user_id = ?", userID).
		Preload("Task").Preload("Task.TaskType").Preload("Task.Publisher")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&assignments)

	utils.Success(c, gin.H{
		"list":      assignments,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetMyTaskResults(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var results []models.TaskResult
	var total int64

	query := database.DB.Model(&models.TaskResult{}).
		Where("user_id = ?", userID).
		Preload("TaskAssignment").Preload("TaskAssignment.Task")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&results)

	utils.Success(c, gin.H{
		"list":      results,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

type SubmitTaskResultRequest struct {
	ImageURLs   string  `json:"image_urls"`
	VideoURL    string  `json:"video_url"`
	Description string  `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

func SubmitTaskResult(c *gin.Context) {
	userID := c.GetUint("user_id")
	assignmentIDStr := c.Param("id")
	assignmentID, _ := strconv.ParseUint(assignmentIDStr, 10, 64)

	var assignment models.TaskAssignment
	if err := database.DB.Where("id = ? AND user_id = ?", assignmentID, userID).First(&assignment).Error; err != nil {
		utils.NotFound(c, "任务接取记录不存在")
		return
	}

	if assignment.Status != 2 {
		utils.BadRequest(c, "任务状态不正确")
		return
	}

	var req SubmitTaskResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	result := models.TaskResult{
		TaskAssignmentID: uint(assignmentID),
		UserID:           userID,
		TaskID:           assignment.TaskID,
		ImageURLs:        req.ImageURLs,
		VideoURL:         req.VideoURL,
		Description:      req.Description,
		Latitude:         req.Latitude,
		Longitude:        req.Longitude,
		Status:           0,
	}

	if err := database.DB.Create(&result).Error; err != nil {
		utils.InternalServerError(c, "提交失败")
		return
	}

	now := time.Now().Format("2006-01-02 15:04:05")
	database.DB.Model(&assignment).Updates(map[string]interface{}{
		"status":       2,
		"completed_at": now,
	})

	utils.SuccessWithMessage(c, "提交成功", result)
}

func ToggleFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	taskIDStr := c.Param("id")
	taskID, _ := strconv.ParseUint(taskIDStr, 10, 64)

	var favorite models.Favorite
	if err := database.DB.Where("user_id = ? AND task_id = ?", userID, taskID).First(&favorite).Error; err != nil {
		favorite = models.Favorite{
			UserID: userID,
			TaskID: uint(taskID),
		}
		if err := database.DB.Create(&favorite).Error; err != nil {
			utils.InternalServerError(c, "收藏失败")
			return
		}
		utils.SuccessWithMessage(c, "收藏成功", gin.H{"is_favorite": true})
	} else {
		if err := database.DB.Delete(&favorite).Error; err != nil {
			utils.InternalServerError(c, "取消收藏失败")
			return
		}
		utils.SuccessWithMessage(c, "取消收藏成功", gin.H{"is_favorite": false})
	}
}

func GetMyFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var favorites []models.Favorite
	var total int64

	query := database.DB.Model(&models.Favorite{}).
		Where("user_id = ?", userID).
		Preload("Task").Preload("Task.TaskType").Preload("Task.Publisher")

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&favorites)

	utils.Success(c, gin.H{
		"list":      favorites,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AddComment(c *gin.Context) {
	userID := c.GetUint("user_id")
	taskIDStr := c.Param("id")
	taskID, _ := strconv.ParseUint(taskIDStr, 10, 64)

	type CommentRequest struct {
		Content string `json:"content" binding:"required"`
		Rating  int    `json:"rating"`
	}

	var req CommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	comment := models.Comment{
		TaskID:  uint(taskID),
		UserID:  userID,
		Content: req.Content,
		Rating:  req.Rating,
		Status:  1,
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		utils.InternalServerError(c, "评论失败")
		return
	}

	utils.SuccessWithMessage(c, "评论成功", comment)
}

func GetTaskCommentsForUser(c *gin.Context) {
	taskIDStr := c.Param("id")
	taskID, _ := strconv.ParseUint(taskIDStr, 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var comments []models.Comment
	var total int64

	query := database.DB.Model(&models.Comment{}).
		Where("task_id = ? AND status = 1", taskID).
		Preload("User")

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
