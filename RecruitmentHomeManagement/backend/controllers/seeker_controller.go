package controllers

import (
	"net/http"
	"recruithub/config"
	"recruithub/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetSeekers(c *gin.Context) {
	keyword := c.Query("keyword")
	city := c.Query("city")
	experience := c.Query("experience")

	query := config.DB.Preload("User").Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR expected_position LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if city != "" {
		query = query.Where("city = ?", city)
	}
	if experience != "" {
		query = query.Where("experience = ?", experience)
	}

	var seekers []models.JobSeeker
	query.Order("created_at DESC").Find(&seekers)

	c.JSON(http.StatusOK, gin.H{"seekers": seekers})
}

func GetSeekerDetail(c *gin.Context) {
	id := c.Param("id")

	var seeker models.JobSeeker
	if err := config.DB.Preload("User").First(&seeker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "求职信息不存在"})
		return
	}

	config.DB.Model(&seeker).Update("views", seeker.Views+1)

	c.JSON(http.StatusOK, gin.H{"seeker": seeker})
}

func CreateSeeker(c *gin.Context) {
	userID := c.GetUint("user_id")

	var seeker models.JobSeeker
	if err := c.ShouldBindJSON(&seeker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	seeker.UserID = userID
	seeker.Status = 1

	if err := config.DB.Create(&seeker).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "发布成功", "seeker": seeker})
}

func UpdateSeeker(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var seeker models.JobSeeker
	if err := config.DB.First(&seeker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "求职信息不存在"})
		return
	}

	if seeker.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改"})
		return
	}

	if err := c.ShouldBindJSON(&seeker); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&seeker)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "seeker": seeker})
}

func DeleteSeeker(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var seeker models.JobSeeker
	if err := config.DB.First(&seeker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "求职信息不存在"})
		return
	}

	if seeker.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限删除"})
		return
	}

	config.DB.Delete(&seeker)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetMySeekers(c *gin.Context) {
	userID := c.GetUint("user_id")

	var seekers []models.JobSeeker
	config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&seekers)

	c.JSON(http.StatusOK, gin.H{"seekers": seekers})
}

func ApplyJob(c *gin.Context) {
	userID := c.GetUint("user_id")
	jobID, _ := strconv.Atoi(c.Param("id"))

	var job models.Job
	if err := config.DB.First(&job, jobID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	var seeker models.JobSeeker
	if err := config.DB.Where("user_id = ?", userID).First(&seeker).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请先发布求职信息"})
		return
	}

	var existing models.Application
	if err := config.DB.Where("job_id = ? AND seeker_id = ?", jobID, seeker.ID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "已经投递过该职位"})
		return
	}

	var req struct {
		Message string `json:"message"`
	}
	c.ShouldBindJSON(&req)

	application := models.Application{
		JobID:     uint(jobID),
		SeekerID:  seeker.ID,
		CompanyID: job.CompanyID,
		Message:   req.Message,
	}

	if err := config.DB.Create(&application).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "投递失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "投递成功"})
}

func GetMyApplications(c *gin.Context) {
	userID := c.GetUint("user_id")

	var seeker models.JobSeeker
	config.DB.Where("user_id = ?", userID).First(&seeker)

	var applications []models.Application
	config.DB.Preload("Job").Preload("Job.Company").Where("seeker_id = ?", seeker.ID).Order("created_at DESC").Find(&applications)

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func GetJobApplicants(c *gin.Context) {
	userID := c.GetUint("user_id")
	jobID := c.Param("id")

	var company models.Company
	config.DB.Where("user_id = ?", userID).First(&company)

	var applications []models.Application
	config.DB.Preload("Seeker").Preload("Seeker.User").Where("job_id = ? AND company_id = ?", jobID, company.ID).Find(&applications)

	c.JSON(http.StatusOK, gin.H{"applications": applications})
}

func UpdateApplicationStatus(c *gin.Context) {
	userID := c.GetUint("user_id")
	appID := c.Param("id")

	var company models.Company
	config.DB.Where("user_id = ?", userID).First(&company)

	var application models.Application
	if err := config.DB.First(&application, appID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "申请不存在"})
		return
	}

	if application.CompanyID != company.ID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限操作"})
		return
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	application.Status = req.Status
	config.DB.Save(&application)

	c.JSON(http.StatusOK, gin.H{"message": "状态已更新"})
}
