package controllers

import (
	"online-job-recruitment/database"
	"online-job-recruitment/models"
	"online-job-recruitment/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Job Type Management
func GetJobTypes(c *gin.Context) {
	var jobTypes []models.JobType
	database.DB.Where("status = ?", 1).Find(&jobTypes)
	utils.Success(c, jobTypes)
}

func GetAllJobTypes(c *gin.Context) {
	var jobTypes []models.JobType
	database.DB.Find(&jobTypes)
	utils.Success(c, jobTypes)
}

func CreateJobType(c *gin.Context) {
	var jobType models.JobType
	if err := c.ShouldBindJSON(&jobType); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	jobType.Status = 1

	if err := database.DB.Create(&jobType).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, jobType)
}

func UpdateJobType(c *gin.Context) {
	id := c.Param("id")

	var jobType models.JobType
	if err := database.DB.First(&jobType, id).Error; err != nil {
		utils.NotFound(c, "职位类型不存在")
		return
	}

	if err := c.ShouldBindJSON(&jobType); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&jobType).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, jobType)
}

func DeleteJobType(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.JobType{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

// Job Management
func GetJobs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	jobTypeID := c.Query("job_type_id")
	location := c.Query("location")
	salary := c.Query("salary")

	offset := (page - 1) * pageSize

	var jobs []models.Job
	var total int64

	query := database.DB.Model(&models.Job{}).Preload("JobType").Preload("Recruiter")
	query = query.Where("jobs.status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR company LIKE ? OR location LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if jobTypeID != "" {
		query = query.Where("job_type_id = ?", jobTypeID)
	}
	if location != "" {
		query = query.Where("location LIKE ?", "%"+location+"%")
	}
	if salary != "" {
		query = query.Where("salary LIKE ?", "%"+salary+"%")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&jobs)

	utils.Success(c, gin.H{
		"list":      jobs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllJobs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var jobs []models.Job
	var total int64

	query := database.DB.Model(&models.Job{}).Preload("JobType").Preload("Recruiter")
	if keyword != "" {
		query = query.Where("title LIKE ? OR company LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&jobs)

	utils.Success(c, gin.H{
		"list":      jobs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetJob(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := database.DB.Preload("JobType").Preload("Recruiter").First(&job, id).Error; err != nil {
		utils.NotFound(c, "职位不存在")
		return
	}

	database.DB.Model(&job).Update("views", job.Views+1)

	utils.Success(c, job)
}

func CreateJob(c *gin.Context) {
	recruiterID := c.GetUint("userID")

	var job models.Job
	if err := c.ShouldBindJSON(&job); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	job.RecruiterID = recruiterID
	job.Status = 1

	var recruiter models.User
	database.DB.First(&recruiter, recruiterID)
	if recruiter.Company != "" {
		job.Company = recruiter.Company
	}

	if err := database.DB.Create(&job).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, job)
}

func UpdateJob(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetUint("userID")
	role := c.GetString("role")

	var job models.Job
	if err := database.DB.First(&job, id).Error; err != nil {
		utils.NotFound(c, "职位不存在")
		return
	}

	if role == "recruiter" && job.RecruiterID != userID {
		utils.Forbidden(c, "无权限修改")
		return
	}

	if err := c.ShouldBindJSON(&job); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&job).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, job)
}

func DeleteJob(c *gin.Context) {
	id := c.Param("id")
	userID := c.GetUint("userID")
	role := c.GetString("role")

	var job models.Job
	if err := database.DB.First(&job, id).Error; err != nil {
		utils.NotFound(c, "职位不存在")
		return
	}

	if role == "recruiter" && job.RecruiterID != userID {
		utils.Forbidden(c, "无权限删除")
		return
	}

	if err := database.DB.Delete(&job).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetRecruiterJobs(c *gin.Context) {
	recruiterID := c.GetUint("userID")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var jobs []models.Job
	var total int64

	query := database.DB.Model(&models.Job{}).Where("recruiter_id = ?", recruiterID)
	query.Preload("JobType").Count(&total)
	query.Preload("JobType").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&jobs)

	utils.Success(c, gin.H{
		"list":      jobs,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
