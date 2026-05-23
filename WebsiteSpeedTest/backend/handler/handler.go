package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"websitespeedtest/db"
	"websitespeedtest/model"
	"websitespeedtest/service"
)

func GetRegions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"regions": service.GetRegions()})
}

func RunTest(c *gin.Context) {
	var req struct {
		URL     string   `json:"url" binding:"required"`
		Regions []string `json:"regions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !strings.HasPrefix(req.URL, "http://") && !strings.HasPrefix(req.URL, "https://") {
		req.URL = "https://" + req.URL
	}

	regions := req.Regions
	if len(regions) == 0 {
		regions = []string{"cn-north", "cn-east", "us-west", "ap-sg"}
	}

	results := make([]*model.SpeedTestResult, 0, len(regions))
	for _, regionCode := range regions {
		region := service.GetRegionByCode(regionCode)
		regionName := regionCode
		if region != nil {
			regionName = region.Name
		}
		result := service.PerformSpeedTest(req.URL, regionCode, regionName)
		db.DB.Create(result)
		results = append(results, result)
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

func GetTestHistory(c *gin.Context) {
	url := c.Query("url")
	region := c.Query("region")
	limitStr := c.DefaultQuery("limit", "50")

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 50
	}

	query := db.DB.Order("created_at DESC").Limit(limit)
	if url != "" {
		query = query.Where("url = ?", url)
	}
	if region != "" {
		query = query.Where("region = ?", region)
	}

	var results []model.SpeedTestResult
	query.Find(&results)

	c.JSON(http.StatusOK, gin.H{"results": results})
}

func GetTestByID(c *gin.Context) {
	id := c.Param("id")
	var result model.SpeedTestResult
	if err := db.DB.First(&result, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "record not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"result": result})
}

func DeleteTest(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&model.SpeedTestResult{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func GetMonitorTasks(c *gin.Context) {
	var tasks []model.MonitorTask
	db.DB.Order("created_at DESC").Find(&tasks)
	c.JSON(http.StatusOK, gin.H{"tasks": tasks})
}

func CreateMonitorTask(c *gin.Context) {
	var task model.MonitorTask
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !strings.HasPrefix(task.URL, "http://") && !strings.HasPrefix(task.URL, "https://") {
		task.URL = "https://" + task.URL
	}

	if task.Interval <= 0 {
		task.Interval = 30
	}

	region := service.GetRegionByCode(task.Region)
	if region != nil {
		task.RegionName = region.Name
	}

	if err := db.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if task.Enabled && service.GlobalScheduler != nil {
		service.GlobalScheduler.AddTask(task)
	}

	c.JSON(http.StatusOK, gin.H{"task": task})
}

func UpdateMonitorTask(c *gin.Context) {
	id := c.Param("id")
	var task model.MonitorTask
	if err := db.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	var updates struct {
		URL      *string `json:"url"`
		Region   *string `json:"region"`
		Interval *int    `json:"interval"`
		Enabled  *bool   `json:"enabled"`
	}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if updates.URL != nil {
		url := *updates.URL
		if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
			url = "https://" + url
		}
		task.URL = url
	}
	if updates.Region != nil {
		task.Region = *updates.Region
		region := service.GetRegionByCode(*updates.Region)
		if region != nil {
			task.RegionName = region.Name
		}
	}
	if updates.Interval != nil {
		task.Interval = *updates.Interval
	}
	if updates.Enabled != nil {
		task.Enabled = *updates.Enabled
	}

	task.UpdatedAt = time.Now()
	db.DB.Save(&task)

	if service.GlobalScheduler != nil {
		if task.Enabled {
			service.GlobalScheduler.AddTask(task)
		} else {
			service.GlobalScheduler.StopTask(task.ID)
		}
	}

	c.JSON(http.StatusOK, gin.H{"task": task})
}

func DeleteMonitorTask(c *gin.Context) {
	id := c.Param("id")
	var task model.MonitorTask
	if err := db.DB.First(&task, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	if service.GlobalScheduler != nil {
		service.GlobalScheduler.StopTask(task.ID)
	}

	db.DB.Delete(&task)
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func GetMonitorResults(c *gin.Context) {
	taskID := c.Param("id")
	var task model.MonitorTask
	if err := db.DB.First(&task, taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	var results []model.SpeedTestResult
	db.DB.Where("url = ? AND region = ?", task.URL, task.Region).
		Order("created_at DESC").Limit(100).Find(&results)

	c.JSON(http.StatusOK, gin.H{"task": task, "results": results})
}
