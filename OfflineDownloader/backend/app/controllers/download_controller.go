package controllers

import (
	"offlinedownloader/app/services"
	"offlinedownloader/utils"

	"github.com/gin-gonic/gin"
)

type DownloadController struct {
	downloadService *services.DownloadService
}

func NewDownloadController() *DownloadController {
	return &DownloadController{
		downloadService: services.NewDownloadService(),
	}
}

type AddDownloadRequest struct {
	URL   string `json:"url" binding:"required"`
	Title string `json:"title"`
}

func (dc *DownloadController) AddDownload(c *gin.Context) {
	var req AddDownloadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters")
		return
	}

	if !utils.IsValidURL(req.URL) {
		utils.BadRequest(c, "Invalid download URL, must be HTTP/HTTPS or magnet link")
		return
	}

	task, err := dc.downloadService.AddDownload(req.URL, req.Title)
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, task)
}

func (dc *DownloadController) GetTaskList(c *gin.Context) {
	status := utils.ParseInt8(c.Query("status"), -1)
	page, pageSize := utils.GetPageInfo(c.Query("page"), c.Query("page_size"))

	tasks, total, err := dc.downloadService.GetTaskList(status, page, pageSize)
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"list":      tasks,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (dc *DownloadController) GetTaskDetail(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	task, err := dc.downloadService.GetTaskByID(id)
	if err != nil {
		utils.NotFound(c, "Task not found")
		return
	}

	utils.Success(c, task)
}

func (dc *DownloadController) PauseTask(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	if err := dc.downloadService.PauseTask(id); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "Task paused successfully", nil)
}

func (dc *DownloadController) ResumeTask(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	if err := dc.downloadService.ResumeTask(id); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "Task resumed successfully", nil)
}

func (dc *DownloadController) DeleteTask(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	deleteFiles := c.Query("delete_files") == "true"

	if err := dc.downloadService.DeleteTask(id, deleteFiles); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "Task deleted successfully", nil)
}

func (dc *DownloadController) PauseAll(c *gin.Context) {
	if err := dc.downloadService.PauseAll(); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "All tasks paused", nil)
}

func (dc *DownloadController) ResumeAll(c *gin.Context) {
	if err := dc.downloadService.ResumeAll(); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "All tasks resumed", nil)
}

func (dc *DownloadController) ClearCompleted(c *gin.Context) {
	if err := dc.downloadService.ClearCompleted(); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "Completed tasks cleared", nil)
}

func (dc *DownloadController) GetStatistics(c *gin.Context) {
	fileService := services.NewFileService()
	stats, err := fileService.GetStatistics()
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, stats)
}
