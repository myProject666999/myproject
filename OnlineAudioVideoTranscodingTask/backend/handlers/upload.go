package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"transcoding-service/models"
	"transcoding-service/services"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UploadHandler struct {
	db       *gorm.DB
	queue    *services.QueueService
	uploadDir string
}

func NewUploadHandler(db *gorm.DB, queue *services.QueueService, uploadDir string) *UploadHandler {
	return &UploadHandler{
		db:        db,
		queue:     queue,
		uploadDir: uploadDir,
	}
}

type UploadRequest struct {
	OutputFormat string `form:"output_format" binding:"required"`
}

func (h *UploadHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未找到上传文件"})
		return
	}

	outputFormat := strings.ToLower(strings.TrimSpace(c.PostForm("output_format")))
	if outputFormat == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "必须指定目标格式"})
		return
	}

	validFormats := map[string]bool{
		"mp4": true, "mp3": true, "webm": true, "avi": true,
		"mov": true, "flv": true, "mkv": true, "wav": true,
		"aac": true, "ogg": true, "flac": true, "m4a": true,
	}
	if !validFormats[outputFormat] {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("不支持的目标格式: %s", outputFormat)})
		return
	}

	os.MkdirAll(h.uploadDir, 0755)

	ext := filepath.Ext(file.Filename)
	storedName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	savePath := filepath.Join(h.uploadDir, storedName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "保存文件失败"})
		return
	}

	task := models.Task{
		FileName:     file.Filename,
		FilePath:     savePath,
		FileSize:     uint64(file.Size),
		OutputFormat: outputFormat,
		Status:       models.StatusPending,
		Progress:     0,
		RetryCount:   0,
		MaxRetries:   3,
	}

	if err := h.db.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建任务失败"})
		return
	}

	if err := h.queue.Enqueue(c.Request.Context(), task.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "任务入队失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"task_id":  task.ID,
		"status":   task.Status,
		"format":   task.OutputFormat,
		"progress": 0,
		"message":  "文件上传成功，任务已加入队列",
	})
}

type TaskListRequest struct {
	Page     int    `form:"page,default=1"`
	PageSize int    `form:"page_size,default=20"`
	Status   string `form:"status"`
}

func (h *UploadHandler) ListTasks(c *gin.Context) {
	var req TaskListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 || req.PageSize > 100 {
		req.PageSize = 20
	}

	query := h.db.Model(&models.Task{})
	if req.Status != "" {
		query = query.Where("status = ?", req.Status)
	}

	var total int64
	query.Count(&total)

	var tasks []models.Task
	offset := (req.Page - 1) * req.PageSize
	query.Order("created_at DESC").Offset(offset).Limit(req.PageSize).Find(&tasks)

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"page":  req.Page,
		"size":  req.PageSize,
		"items": tasks,
	})
}

func (h *UploadHandler) GetTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := h.db.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}
	c.JSON(http.StatusOK, task)
}

func (h *UploadHandler) DeleteTask(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := h.db.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	if task.FilePath != "" {
		os.Remove(task.FilePath)
	}
	if task.OutputPath != "" {
		os.Remove(task.OutputPath)
	}

	h.db.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "任务已删除"})
}

func (h *UploadHandler) Download(c *gin.Context) {
	id := c.Param("id")
	var task models.Task
	if err := h.db.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	if task.Status != models.StatusCompleted || task.OutputPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "任务未完成，无法下载"})
		return
	}

	if _, err := os.Stat(task.OutputPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "输出文件不存在"})
		return
	}

	downloadName := fmt.Sprintf("%s_%d.%s",
		strings.TrimSuffix(task.FileName, filepath.Ext(task.FileName)),
		time.Now().Unix(),
		task.OutputFormat,
	)

	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", downloadName))
	c.Header("Content-Type", "application/octet-stream")
	c.File(task.OutputPath)
}
