package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"moonsister/config"
	"moonsister/models"
	"moonsister/utils"

	"github.com/gin-gonic/gin"
)

func GetCourses(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	level := c.Query("level")

	var courses []models.Course
	var total int64

	query := config.DB.Model(&models.Course{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}

	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at desc").Find(&courses)

	utils.Page(c, courses, total)
}

func GetCourseDetail(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "课程不存在")
		return
	}

	config.DB.Model(&course).Update("view_count", course.ViewCount+1)

	utils.Success(c, course)
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	if err := config.DB.Create(&course).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "创建失败")
		return
	}

	utils.Success(c, course)
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "课程不存在")
		return
	}

	if err := c.ShouldBindJSON(&course); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	config.DB.Save(&course)
	utils.Success(c, course)
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Course{}, id).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "删除失败")
		return
	}

	utils.Success(c, gin.H{"message": "删除成功"})
}

func StartLearning(c *gin.Context) {
	userID := c.GetUint("user_id")
	courseIDStr := c.Param("id")
	
	var courseID uint64
	fmt.Sscanf(courseIDStr, "%d", &courseID)

	var record models.LearningRecord
	config.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&record)

	if record.ID == 0 {
		record = models.LearningRecord{
			CourseID: uint(courseID),
			UserID:   userID,
		}
		config.DB.Create(&record)
	}

	utils.Success(c, record)
}

func UpdateProgress(c *gin.Context) {
	userID := c.GetUint("user_id")
	courseIDStr := c.Param("id")
	
	var courseID uint64
	fmt.Sscanf(courseIDStr, "%d", &courseID)

	var req struct {
		Progress     int `json:"progress"`
		LastPosition int `json:"last_position"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var record models.LearningRecord
	if err := config.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&record).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "学习记录不存在")
		return
	}

	record.Progress = req.Progress
	record.LastPosition = req.LastPosition

	if req.Progress >= 100 {
		record.IsCompleted = true
		now := time.Now()
		record.CompletedAt = &now
	}

	config.DB.Save(&record)
	utils.Success(c, record)
}

func GetMyCourses(c *gin.Context) {
	userID := c.GetUint("user_id")

	var records []models.LearningRecord
	config.DB.Where("user_id = ?", userID).Order("updated_at desc").Find(&records)

	utils.Success(c, records)
}
