package controllers

import (
	"io"
	"net/http"
	"offlinedownloader/app/services"
	"offlinedownloader/utils"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

type FileController struct {
	fileService *services.FileService
}

func NewFileController() *FileController {
	return &FileController{
		fileService: services.NewFileService(),
	}
}

func (fc *FileController) GetFileList(c *gin.Context) {
	fileType := c.Query("type")
	keyword := c.Query("keyword")
	page, pageSize := utils.GetPageInfo(c.Query("page"), c.Query("page_size"))

	files, total, err := fc.fileService.GetFileList(fileType, keyword, page, pageSize)
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"list":      files,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (fc *FileController) GetFileDetail(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid file ID")
		return
	}

	file, err := fc.fileService.GetFileByID(id)
	if err != nil {
		utils.NotFound(c, "File not found")
		return
	}

	utils.Success(c, file)
}

func (fc *FileController) GetFilesByTaskID(c *gin.Context) {
	taskID := utils.ParseUint64(c.Param("task_id"), 0)
	if taskID == 0 {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	files, err := fc.fileService.GetFilesByTaskID(taskID)
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, files)
}

func (fc *FileController) DeleteFile(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid file ID")
		return
	}

	deleteFromDisk := c.Query("delete_from_disk") == "true"

	if err := fc.fileService.DeleteFile(id, deleteFromDisk); err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.SuccessWithMessage(c, "File deleted successfully", nil)
}

func (fc *FileController) PlayFile(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid file ID")
		return
	}

	filePath, mimeType, err := fc.fileService.GetFilePath(id)
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		utils.NotFound(c, "File not found")
		return
	}

	fileName := filepath.Base(filePath)

	c.Header("Content-Type", mimeType)
	c.Header("Content-Length", strconv.FormatInt(fileInfo.Size(), 10))
	c.Header("Content-Disposition", "inline; filename=\""+fileName+"\"")
	c.Header("Accept-Ranges", "bytes")

	http.ServeFile(c.Writer, c.Request, filePath)
}

func (fc *FileController) DownloadFile(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid file ID")
		return
	}

	filePath, mimeType, err := fc.fileService.GetFilePath(id)
	if err != nil {
		utils.NotFound(c, err.Error())
		return
	}

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		utils.NotFound(c, "File not found")
		return
	}

	fileName := filepath.Base(filePath)

	c.Header("Content-Type", mimeType)
	c.Header("Content-Length", strconv.FormatInt(fileInfo.Size(), 10))
	c.Header("Content-Disposition", "attachment; filename=\""+fileName+"\"")

	file, err := os.Open(filePath)
	if err != nil {
		utils.InternalServerError(c, "Failed to open file")
		return
	}
	defer file.Close()

	io.Copy(c.Writer, file)
}

func (fc *FileController) GetThumbnail(c *gin.Context) {
	id := utils.ParseUint64(c.Param("id"), 0)
	if id == 0 {
		utils.BadRequest(c, "Invalid file ID")
		return
	}

	file, err := fc.fileService.GetFileByID(id)
	if err != nil {
		utils.NotFound(c, "File not found")
		return
	}

	if file.ThumbnailPath == "" {
		utils.NotFound(c, "Thumbnail not found")
		return
	}

	if _, err := os.Stat(file.ThumbnailPath); os.IsNotExist(err) {
		utils.NotFound(c, "Thumbnail not found")
		return
	}

	c.Header("Content-Type", "image/jpeg")
	http.ServeFile(c.Writer, c.Request, file.ThumbnailPath)
}

func (fc *FileController) ScanDirectory(c *gin.Context) {
	go fc.fileService.ScanDownloadsDirectory()
	utils.SuccessWithMessage(c, "Scanning started in background", nil)
}

func (fc *FileController) GetStatistics(c *gin.Context) {
	stats, err := fc.fileService.GetStatistics()
	if err != nil {
		utils.InternalServerError(c, err.Error())
		return
	}

	utils.Success(c, stats)
}
