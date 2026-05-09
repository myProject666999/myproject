package controllers

import (
	"net/http"
	"recruithub/config"
	"recruithub/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetJobs(c *gin.Context) {
	keyword := c.Query("keyword")
	city := c.Query("city")
	salaryMin, _ := strconv.Atoi(c.Query("salary_min"))
	salaryMax, _ := strconv.Atoi(c.Query("salary_max"))

	query := config.DB.Preload("Company").Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if city != "" {
		query = query.Where("city = ?", city)
	}
	if salaryMin > 0 {
		query = query.Where("salary_min >= ?", salaryMin)
	}
	if salaryMax > 0 {
		query = query.Where("salary_max <= ?", salaryMax)
	}

	var jobs []models.Job
	query.Order("created_at DESC").Find(&jobs)

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func GetHotJobs(c *gin.Context) {
	var jobs []models.Job
	config.DB.Preload("Company").Where("status = ?", 1).Order("views DESC").Limit(10).Find(&jobs)
	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func GetJobDetail(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := config.DB.Preload("Company").First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	config.DB.Model(&job).Update("views", job.Views+1)

	userID, exists := c.Get("user_id")
	if exists {
		history := models.BrowsingHistory{
			UserID: userID.(uint),
			JobID:  job.ID,
			Type:   "job",
		}
		config.DB.Create(&history)
	}

	c.JSON(http.StatusOK, gin.H{"job": job})
}

func CreateJob(c *gin.Context) {
	userID := c.GetUint("user_id")

	var company models.Company
	if err := config.DB.Where("user_id = ?", userID).First(&company).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "企业信息不存在"})
		return
	}

	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	job.CompanyID = company.ID
	job.Status = 1

	if err := config.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "发布成功", "job": job})
}

func UpdateJob(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var company models.Company
	config.DB.Where("user_id = ?", userID).First(&company)

	var job models.Job
	if err := config.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	if job.CompanyID != company.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改"})
		return
	}

	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&job)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "job": job})
}

func DeleteJob(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var company models.Company
	config.DB.Where("user_id = ?", userID).First(&company)

	var job models.Job
	if err := config.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	if job.CompanyID != company.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限删除"})
		return
	}

	config.DB.Delete(&job)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetMyJobs(c *gin.Context) {
	userID := c.GetUint("user_id")

	var company models.Company
	config.DB.Where("user_id = ?", userID).First(&company)

	var jobs []models.Job
	config.DB.Where("company_id = ?", company.ID).Order("created_at DESC").Find(&jobs)

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func GetBrowsingHistory(c *gin.Context) {
	userID := c.GetUint("user_id")

	var histories []models.BrowsingHistory
	config.DB.Where("user_id = ?", userID).Order("created_at DESC").Limit(50).Find(&histories)

	jobIDs := []uint{}
	for _, h := range histories {
		jobIDs = append(jobIDs, h.JobID)
	}

	var jobs []models.Job
	if len(jobIDs) > 0 {
		config.DB.Preload("Company").Where("id IN ?", jobIDs).Find(&jobs)
	}

	c.JSON(http.StatusOK, gin.H{"histories": histories, "jobs": jobs})
}
