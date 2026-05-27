package controllers

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"ConvertWebpage2PDF/config"
	"ConvertWebpage2PDF/models"
	"ConvertWebpage2PDF/services"
)

type ConvertRequest struct {
	URL        string `json:"url" binding:"required"`
	Title      string `json:"title"`
	Style      string `json:"style" default:"default"`
	EnableTOC  bool   `json:"enable_toc" default:"true"`
	Pagination string `json:"pagination" default:"A4"`
}

type BatchConvertRequest struct {
	URLs       []string `json:"urls" binding:"required"`
	Name       string   `json:"name"`
	Style      string   `json:"style" default:"default"`
	EnableTOC  bool     `json:"enable_toc" default:"true"`
	Pagination string   `json:"pagination" default:"A4"`
}

func ConvertWebpage(c *gin.Context) {
	var req ConvertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误: " + err.Error()})
		return
	}

	job := models.ConversionJob{
		ID:         uuid.New().String(),
		URL:        req.URL,
		Title:      req.Title,
		Style:      req.Style,
		EnableTOC:  req.EnableTOC,
		Pagination: req.Pagination,
		Status:     "processing",
	}

	if err := models.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建任务失败: " + err.Error()})
		return
	}

	go func() {
		filename, pageCount, err := services.ConvertWebpageToPDF(services.PDFOptions{
			URL:        req.URL,
			Title:      req.Title,
			Style:      req.Style,
			EnableTOC:  req.EnableTOC,
			Pagination: req.Pagination,
		}, config.AppConfig.PDFOutputDir, config.AppConfig.ChromePath)

		now := time.Now()
		if err != nil {
			log.Printf("转换任务失败: %s, 错误: %v", job.ID, err)
			models.DB.Model(&job).Updates(map[string]interface{}{
				"status":      "failed",
				"error_msg":   err.Error(),
				"updated_at":  now,
			})
			return
		}

		models.DB.Model(&job).Updates(map[string]interface{}{
			"status":       "completed",
			"file_path":    filename,
			"page_count":   pageCount,
			"updated_at":   now,
			"completed_at": now,
		})
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "任务已创建",
		"job_id":  job.ID,
		"status":  job.Status,
	})
}

func GetJobStatus(c *gin.Context) {
	jobID := c.Param("id")

	var job models.ConversionJob
	if err := models.DB.Where("id = ?", jobID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	c.JSON(http.StatusOK, job)
}

func DownloadPDF(c *gin.Context) {
	jobID := c.Param("id")

	var job models.ConversionJob
	if err := models.DB.Where("id = ?", jobID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	if job.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "任务尚未完成"})
		return
	}

	fullPath := filepath.Join(config.AppConfig.PDFOutputDir, job.FilePath)
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "文件不存在"})
		return
	}

	c.FileAttachment(fullPath, job.FilePath)
}

func GetHistory(c *gin.Context) {
	page := c.DefaultQuery("page", "1")
	pageSize := c.DefaultQuery("page_size", "10")

	var jobs []models.ConversionJob
	var total int64

	models.DB.Model(&models.ConversionJob{}).Count(&total)
	models.DB.Order("created_at DESC").Limit(10).Offset((0) * 10).Find(&jobs)

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"page":  page,
		"size":  pageSize,
		"data":  jobs,
	})
}

func BatchConvert(c *gin.Context) {
	var req BatchConvertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误: " + err.Error()})
		return
	}

	if len(req.URLs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "URL列表不能为空"})
		return
	}

	batchJob := models.BatchJob{
		ID:         uuid.New().String(),
		Name:       req.Name,
		Status:     "processing",
		TotalCount: len(req.URLs),
	}

	if err := models.DB.Create(&batchJob).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建批量任务失败: " + err.Error()})
		return
	}

	go func() {
		successCount := 0
		failedCount := 0

		for _, url := range req.URLs {
			job := models.ConversionJob{
				ID:         uuid.New().String(),
				URL:        url,
				Style:      req.Style,
				EnableTOC:  req.EnableTOC,
				Pagination: req.Pagination,
				Status:     "processing",
			}
			models.DB.Create(&job)

			filename, pageCount, err := services.ConvertWebpageToPDF(services.PDFOptions{
				URL:        url,
				Style:      req.Style,
				EnableTOC:  req.EnableTOC,
				Pagination: req.Pagination,
			}, config.AppConfig.PDFOutputDir, config.AppConfig.ChromePath)

			now := time.Now()
			if err != nil {
				failedCount++
				log.Printf("批量转换任务失败: %s, 错误: %v", job.ID, err)
				models.DB.Model(&job).Updates(map[string]interface{}{
					"status":    "failed",
					"error_msg": err.Error(),
					"updated_at": now,
				})
			} else {
				successCount++
				models.DB.Model(&job).Updates(map[string]interface{}{
					"status":       "completed",
					"file_path":    filename,
					"page_count":   pageCount,
					"updated_at":   now,
					"completed_at": now,
				})
			}
		}

		now := time.Now()
		models.DB.Model(&batchJob).Updates(map[string]interface{}{
			"status":        "completed",
			"success_count": successCount,
			"failed_count":  failedCount,
			"completed_at":  now,
		})
	}()

	c.JSON(http.StatusOK, gin.H{
		"message":     "批量任务已创建",
		"batch_id":    batchJob.ID,
		"total_count": batchJob.TotalCount,
	})
}

func GetBatchStatus(c *gin.Context) {
	batchID := c.Param("id")

	var batchJob models.BatchJob
	if err := models.DB.Where("id = ?", batchID).First(&batchJob).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "批量任务不存在"})
		return
	}

	c.JSON(http.StatusOK, batchJob)
}

func DeleteJob(c *gin.Context) {
	jobID := c.Param("id")

	var job models.ConversionJob
	if err := models.DB.Where("id = ?", jobID).First(&job).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "任务不存在"})
		return
	}

	if job.FilePath != "" {
		fullPath := filepath.Join(config.AppConfig.PDFOutputDir, job.FilePath)
		os.Remove(fullPath)
	}

	models.DB.Delete(&job)

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
