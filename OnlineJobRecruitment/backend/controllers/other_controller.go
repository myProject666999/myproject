package controllers

import (
	"online-job-recruitment/database"
	"online-job-recruitment/models"
	"online-job-recruitment/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Exercise Management
func GetExercises(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	difficulty := c.Query("difficulty")

	offset := (page - 1) * pageSize

	var exercises []models.Exercise
	var total int64

	query := database.DB.Model(&models.Exercise{})
	query = query.Where("status = ?", 1)

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if difficulty != "" {
		query = query.Where("difficulty = ?", difficulty)
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&exercises)

	utils.Success(c, gin.H{
		"list":      exercises,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllExercises(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var exercises []models.Exercise
	var total int64

	query := database.DB.Model(&models.Exercise{})
	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&exercises)

	utils.Success(c, gin.H{
		"list":      exercises,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetExercise(c *gin.Context) {
	id := c.Param("id")

	var exercise models.Exercise
	if err := database.DB.First(&exercise, id).Error; err != nil {
		utils.NotFound(c, "练习题不存在")
		return
	}

	utils.Success(c, exercise)
}

func CreateExercise(c *gin.Context) {
	var exercise models.Exercise
	if err := c.ShouldBindJSON(&exercise); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	exercise.Status = 1

	if err := database.DB.Create(&exercise).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, exercise)
}

func UpdateExercise(c *gin.Context) {
	id := c.Param("id")

	var exercise models.Exercise
	if err := database.DB.First(&exercise, id).Error; err != nil {
		utils.NotFound(c, "练习题不存在")
		return
	}

	if err := c.ShouldBindJSON(&exercise); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&exercise).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, exercise)
}

func DeleteExercise(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Exercise{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func SubmitExercise(c *gin.Context) {
	userID := c.GetUint("userID")

	var req struct {
		ExerciseID uint   `json:"exercise_id" binding:"required"`
		Answer     string `json:"answer"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var exercise models.Exercise
	if err := database.DB.First(&exercise, req.ExerciseID).Error; err != nil {
		utils.NotFound(c, "练习题不存在")
		return
	}

	isCorrect := exercise.Answer == req.Answer

	utils.Success(c, gin.H{
		"is_correct":  isCorrect,
		"correct_answer": exercise.Answer,
		"user_answer": req.Answer,
		"user_id":     userID,
	})
}

// News Management
func GetNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var newsList []models.News
	var total int64

	query := database.DB.Model(&models.News{})
	query = query.Where("status = ?", 1)

	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&newsList)

	utils.Success(c, gin.H{
		"list":      newsList,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var newsList []models.News
	var total int64

	query := database.DB.Model(&models.News{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&newsList)

	utils.Success(c, gin.H{
		"list":      newsList,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetNewsDetail(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := database.DB.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	database.DB.Model(&news).Update("views", news.Views+1)

	utils.Success(c, news)
}

func CreateNews(c *gin.Context) {
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	news.Status = 1

	if err := database.DB.Create(&news).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, news)
}

func UpdateNews(c *gin.Context) {
	id := c.Param("id")

	var news models.News
	if err := database.DB.First(&news, id).Error; err != nil {
		utils.NotFound(c, "资讯不存在")
		return
	}

	if err := c.ShouldBindJSON(&news); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&news).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.Success(c, news)
}

func DeleteNews(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.News{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

// Review Management
func CreateReview(c *gin.Context) {
	userID := c.GetUint("userID")

	var review models.Review
	if err := c.ShouldBindJSON(&review); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	review.UserID = userID
	review.Status = 1

	if err := database.DB.Create(&review).Error; err != nil {
		utils.InternalServerError(c, "提交失败")
		return
	}

	utils.SuccessWithMessage(c, "评价成功", review)
}

func GetReviews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var reviews []models.Review
	var total int64

	query := database.DB.Model(&models.Review{})
	query.Preload("User").Preload("Job").Count(&total)
	query.Preload("User").Preload("Job").Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&reviews)

	utils.Success(c, gin.H{
		"list":      reviews,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetMyReviews(c *gin.Context) {
	userID := c.GetUint("userID")

	var reviews []models.Review
	database.DB.Where("user_id = ?", userID).Preload("Job").Order("created_at DESC").Find(&reviews)

	utils.Success(c, reviews)
}

func DeleteReview(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Review{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

// Dashboard Statistics
func GetDashboardStats(c *gin.Context) {
	var userCount int64
	var recruiterCount int64
	var jobCount int64
	var applicationCount int64
	var newsCount int64
	var exerciseCount int64

	database.DB.Model(&models.User{}).Where("role = ?", "user").Count(&userCount)
	database.DB.Model(&models.User{}).Where("role = ?", "recruiter").Count(&recruiterCount)
	database.DB.Model(&models.Job{}).Count(&jobCount)
	database.DB.Model(&models.Application{}).Count(&applicationCount)
	database.DB.Model(&models.News{}).Count(&newsCount)
	database.DB.Model(&models.Exercise{}).Count(&exerciseCount)

	utils.Success(c, gin.H{
		"user_count":        userCount,
		"recruiter_count":   recruiterCount,
		"job_count":         jobCount,
		"application_count": applicationCount,
		"news_count":        newsCount,
		"exercise_count":    exerciseCount,
	})
}
