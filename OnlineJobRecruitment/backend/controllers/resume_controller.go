package controllers

import (
	"online-job-recruitment/database"
	"online-job-recruitment/models"
	"online-job-recruitment/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetMyResume(c *gin.Context) {
	userID := c.GetUint("userID")

	var resume models.Resume
	if err := database.DB.Where("user_id = ?", userID).First(&resume).Error; err != nil {
		resume = models.Resume{
			UserID: userID,
		}
		database.DB.Create(&resume)
	}

	utils.Success(c, resume)
}

func SaveResume(c *gin.Context) {
	userID := c.GetUint("userID")

	var resume models.Resume
	if err := database.DB.Where("user_id = ?", userID).First(&resume).Error; err != nil {
		resume = models.Resume{
			UserID: userID,
		}
	}

	if err := c.ShouldBindJSON(&resume); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	resume.UserID = userID

	if resume.ID == 0 {
		if err := database.DB.Create(&resume).Error; err != nil {
			utils.InternalServerError(c, "保存失败")
			return
		}
	} else {
		if err := database.DB.Save(&resume).Error; err != nil {
			utils.InternalServerError(c, "更新失败")
			return
		}
	}

	utils.Success(c, resume)
}

func GetResume(c *gin.Context) {
	id := c.Param("id")

	var resume models.Resume
	if err := database.DB.Preload("User").First(&resume, id).Error; err != nil {
		utils.NotFound(c, "简历不存在")
		return
	}

	utils.Success(c, resume)
}

func ApplyJob(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		JobID uint `json:"job_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var resume models.Resume
	if err := database.DB.Where("user_id = ?", userID).First(&resume).Error; err != nil {
		utils.BadRequest(c, "请先完善简历")
		return
	}

	var existingApplication models.Application
	if database.DB.Where("user_id = ? AND job_id = ?", userID, req.JobID).First(&existingApplication).Error == nil {
		utils.BadRequest(c, "您已经投递过这个职位")
		return
	}

	application := models.Application{
		JobID:    req.JobID,
		UserID:   userID,
		ResumeID: resume.ID,
		Status:   "pending",
	}

	if err := database.DB.Create(&application).Error; err != nil {
		utils.InternalServerError(c, "投递失败")
		return
	}

	utils.SuccessWithMessage(c, "投递成功", application)
}

func GetMyApplications(c *gin.Context) {
	userID := c.GetUint("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var applications []models.Application
	var total int64

	query := database.DB.Model(&models.Application{}).Where("user_id = ?", userID)
	query.Preload("Job").Preload("Resume").Count(&total)
	query.Preload("Job").Preload("Resume").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&applications)

	utils.Success(c, gin.H{
		"list":      applications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetApplications(c *gin.Context) {
	recruiterID := c.GetUint("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var applications []models.Application
	var total int64

	query := database.DB.Model(&models.Application{}).
		Joins("JOIN jobs ON applications.job_id = jobs.id").
		Where("jobs.recruiter_id = ?", recruiterID)

	if status != "" {
		query = query.Where("applications.status = ?", status)
	}

	query.Preload("Job").Preload("Resume").Preload("User").Count(&total)
	query.Preload("Job").Preload("Resume").Preload("User").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&applications)

	utils.Success(c, gin.H{
		"list":      applications,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func UpdateApplicationStatus(c *gin.Context) {
	id := c.Param("id")
	recruiterID := c.GetUint("userID")

	var application models.Application
	if err := database.DB.Preload("Job").First(&application, id).Error; err != nil {
		utils.NotFound(c, "投递记录不存在")
		return
	}

	if application.Job.RecruiterID != recruiterID {
		utils.Forbidden(c, "无权限操作")
		return
	}

	var req struct {
		Status            string `json:"status"`
		InterviewTime     string `json:"interview_time"`
		InterviewLocation string `json:"interview_location"`
		Note              string `json:"note"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Status != "" {
		application.Status = req.Status
	}
	if req.InterviewTime != "" {
		application.InterviewTime = req.InterviewTime
	}
	if req.InterviewLocation != "" {
		application.InterviewLocation = req.InterviewLocation
	}
	if req.Note != "" {
		application.Note = req.Note
	}

	if err := database.DB.Save(&application).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	if req.Status == "passed" || req.Status == "failed" {
		interview := models.Interview{
			ApplicationID: application.ID,
			Result:        req.Status,
			Feedback:      req.Note,
		}
		database.DB.Create(&interview)
	}

	utils.SuccessWithMessage(c, "更新成功", application)
}

func AddFavorite(c *gin.Context) {
	recruiterID := c.GetUint("userID")

	var req struct {
		ResumeID uint   `json:"resume_id" binding:"required"`
		Note     string `json:"note"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existingFavorite models.Favorite
	if database.DB.Where("recruiter_id = ? AND resume_id = ?", recruiterID, req.ResumeID).First(&existingFavorite).Error == nil {
		utils.BadRequest(c, "已收藏该简历")
		return
	}

	favorite := models.Favorite{
		RecruiterID: recruiterID,
		ResumeID:    req.ResumeID,
		Note:        req.Note,
	}

	if err := database.DB.Create(&favorite).Error; err != nil {
		utils.InternalServerError(c, "收藏失败")
		return
	}

	utils.SuccessWithMessage(c, "收藏成功", favorite)
}

func GetFavorites(c *gin.Context) {
	recruiterID := c.GetUint("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var favorites []models.Favorite
	var total int64

	query := database.DB.Model(&models.Favorite{}).Where("recruiter_id = ?", recruiterID)
	query.Preload("Resume").Preload("Resume.User").Count(&total)
	query.Preload("Resume").Preload("Resume.User").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&favorites)

	utils.Success(c, gin.H{
		"list":      favorites,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func RemoveFavorite(c *gin.Context) {
	id := c.Param("id")
	recruiterID := c.GetUint("userID")

	var favorite models.Favorite
	if err := database.DB.First(&favorite, id).Error; err != nil {
		utils.NotFound(c, "收藏记录不存在")
		return
	}

	if favorite.RecruiterID != recruiterID {
		utils.Forbidden(c, "无权限操作")
		return
	}

	if err := database.DB.Delete(&favorite).Error; err != nil {
		utils.InternalServerError(c, "取消收藏失败")
		return
	}

	utils.SuccessWithMessage(c, "已取消收藏", nil)
}
