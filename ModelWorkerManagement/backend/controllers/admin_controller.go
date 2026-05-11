package controllers

import (
	"model-worker-management/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetArchives(c *gin.Context) {
	var archives []models.Archive
	models.DB.Find(&archives)
	c.JSON(http.StatusOK, archives)
}

func GetArchiveByID(c *gin.Context) {
	id := c.Param("id")
	var archive models.Archive
	if result := models.DB.First(&archive, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archive not found"})
		return
	}
	c.JSON(http.StatusOK, archive)
}

func CreateArchive(c *gin.Context) {
	var archive models.Archive
	if err := c.ShouldBindJSON(&archive); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := models.DB.Create(&archive); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Archive created successfully", "archive": archive})
}

func UpdateArchive(c *gin.Context) {
	id := c.Param("id")
	var archive models.Archive
	if result := models.DB.First(&archive, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archive not found"})
		return
	}

	if err := c.ShouldBindJSON(&archive); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Save(&archive)
	c.JSON(http.StatusOK, gin.H{"message": "Archive updated successfully", "archive": archive})
}

func DeleteArchive(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.Archive{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Archive deleted successfully"})
}

func GetArchiveChanges(c *gin.Context) {
	status := c.Query("status")
	var changes []models.ArchiveChange
	query := models.DB.Preload("Archive")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("created_at DESC").Find(&changes)
	c.JSON(http.StatusOK, changes)
}

func GetArchiveChangeByID(c *gin.Context) {
	id := c.Param("id")
	var change models.ArchiveChange
	if result := models.DB.Preload("Archive").First(&change, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archive change not found"})
		return
	}
	c.JSON(http.StatusOK, change)
}

func CreateArchiveChange(c *gin.Context) {
	var change models.ArchiveChange
	if err := c.ShouldBindJSON(&change); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	change.Status = "pending"
	if result := models.DB.Create(&change); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Archive change request created successfully", "change": change})
}

func ReviewArchiveChange(c *gin.Context) {
	id := c.Param("id")
	username := c.GetString("username")

	var change models.ArchiveChange
	if result := models.DB.First(&change, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Archive change not found"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	change.Status = req.Status
	change.Reviewer = username
	models.DB.Save(&change)

	c.JSON(http.StatusOK, gin.H{"message": "Archive change reviewed successfully", "change": change})
}

func DeleteArchiveChange(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.ArchiveChange{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Archive change deleted successfully"})
}

func GetRewardPunishments(c *gin.Context) {
	keyword := c.Query("keyword")
	recordType := c.Query("type")

	var records []models.RewardPunishment
	query := models.DB

	if keyword != "" {
		searchPattern := "%" + keyword + "%"
		query = query.Where("worker_name LIKE ? OR title LIKE ? OR content LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	if recordType != "" {
		query = query.Where("type = ?", recordType)
	}

	query.Order("created_at DESC").Find(&records)
	c.JSON(http.StatusOK, records)
}

func GetRewardPunishmentByID(c *gin.Context) {
	id := c.Param("id")
	var record models.RewardPunishment
	if result := models.DB.First(&record, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}
	c.JSON(http.StatusOK, record)
}

func CreateRewardPunishment(c *gin.Context) {
	var record models.RewardPunishment
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := models.DB.Create(&record); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Record created successfully", "record": record})
}

func UpdateRewardPunishment(c *gin.Context) {
	id := c.Param("id")
	var record models.RewardPunishment
	if result := models.DB.First(&record, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Save(&record)
	c.JSON(http.StatusOK, gin.H{"message": "Record updated successfully", "record": record})
}

func DeleteRewardPunishment(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.RewardPunishment{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Record deleted successfully"})
}

func GetTrainingEnrollments(c *gin.Context) {
	status := c.Query("status")
	var enrollments []models.TrainingEnrollment
	query := models.DB.Preload("Training").Preload("User")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Order("created_at DESC").Find(&enrollments)
	c.JSON(http.StatusOK, enrollments)
}

func ReviewTrainingEnrollment(c *gin.Context) {
	id := c.Param("id")
	username := c.GetString("username")

	var enrollment models.TrainingEnrollment
	if result := models.DB.First(&enrollment, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Enrollment not found"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	enrollment.Status = req.Status
	models.DB.Save(&enrollment)

	c.JSON(http.StatusOK, gin.H{"message": "Enrollment reviewed successfully", "enrollment": enrollment, "reviewer": username})
}

func GetCourses(c *gin.Context) {
	var courses []models.Course
	models.DB.Find(&courses)
	c.JSON(http.StatusOK, courses)
}

func GetCourseByID(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if result := models.DB.First(&course, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}
	c.JSON(http.StatusOK, course)
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := models.DB.Create(&course); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Course created successfully", "course": course})
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")
	var course models.Course
	if result := models.DB.First(&course, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Save(&course)
	c.JSON(http.StatusOK, gin.H{"message": "Course updated successfully", "course": course})
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.Course{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}
