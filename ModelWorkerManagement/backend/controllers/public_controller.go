package controllers

import (
	"model-worker-management/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBanners(c *gin.Context) {
	var banners []models.Banner
	models.DB.Where("is_active = ?", true).Find(&banners)
	c.JSON(http.StatusOK, banners)
}

func GetAnnouncements(c *gin.Context) {
	var announcements []models.Announcement
	models.DB.Where("is_active = ?", true).Order("created_at DESC").Find(&announcements)
	c.JSON(http.StatusOK, announcements)
}

func GetAnnouncementByID(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement
	if result := models.DB.First(&announcement, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}
	c.JSON(http.StatusOK, announcement)
}

func GetTrainings(c *gin.Context) {
	var trainings []models.Training
	models.DB.Where("is_active = ?", true).Order("created_at DESC").Find(&trainings)
	c.JSON(http.StatusOK, trainings)
}

func GetTrainingByID(c *gin.Context) {
	id := c.Param("id")
	var training models.Training
	if result := models.DB.First(&training, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Training not found"})
		return
	}
	c.JSON(http.StatusOK, training)
}

func GetForumPosts(c *gin.Context) {
	var posts []models.ForumPost
	models.DB.Order("created_at DESC").Find(&posts)
	c.JSON(http.StatusOK, posts)
}

func GetForumPostByID(c *gin.Context) {
	id := c.Param("id")
	var post models.ForumPost
	if result := models.DB.First(&post, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}

func CreateForumPost(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var post models.ForumPost
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	post.UserID = userID
	post.Username = username

	if result := models.DB.Create(&post); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Post created successfully", "post": post})
}

func EnrollTraining(c *gin.Context) {
	userID := c.GetUint("user_id")
	trainingIDStr := c.Param("id")
	trainingID, _ := strconv.ParseUint(trainingIDStr, 10, 32)

	var training models.Training
	if result := models.DB.First(&training, uint(trainingID)); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Training not found"})
		return
	}

	if training.CurrentEnroll >= training.MaxEnroll {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Training is full"})
		return
	}

	var existingEnrollment models.TrainingEnrollment
	if result := models.DB.Where("user_id = ? AND training_id = ?", userID, trainingID).First(&existingEnrollment); result.RowsAffected > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Already enrolled"})
		return
	}

	enrollment := models.TrainingEnrollment{
		UserID:     userID,
		TrainingID: uint(trainingID),
		Status:      "pending",
	}

	if result := models.DB.Create(&enrollment); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	training.CurrentEnroll++
	models.DB.Save(&training)

	c.JSON(http.StatusCreated, gin.H{"message": "Enrollment submitted successfully", "enrollment": enrollment})
}

func GetMyPosts(c *gin.Context) {
	userID := c.GetUint("user_id")
	var posts []models.ForumPost
	models.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&posts)
	c.JSON(http.StatusOK, posts)
}

func GetMyFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favoriteTrainings []models.Training
	models.DB.Raw(`
		SELECT t.* FROM trainings t
		JOIN favorites f ON t.id = f.target_id AND f.target_type = 'training'
		WHERE f.user_id = ?
	`, userID).Scan(&favoriteTrainings)

	var favoritePosts []models.ForumPost
	models.DB.Raw(`
		SELECT p.* FROM forum_posts p
		JOIN favorites f ON p.id = f.target_id AND f.target_type = 'post'
		WHERE f.user_id = ?
	`, userID).Scan(&favoritePosts)

	c.JSON(http.StatusOK, gin.H{
		"trainings": favoriteTrainings,
		"posts":     favoritePosts,
	})
}

func GetMyEnrollments(c *gin.Context) {
	userID := c.GetUint("user_id")
	var enrollments []models.TrainingEnrollment
	models.DB.Where("user_id = ?", userID).Find(&enrollments)
	c.JSON(http.StatusOK, enrollments)
}

func CreateTraining(c *gin.Context) {
	var training models.Training
	if err := c.ShouldBindJSON(&training); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := models.DB.Create(&training); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Training created successfully", "training": training})
}

func UpdateTraining(c *gin.Context) {
	id := c.Param("id")
	var training models.Training
	if result := models.DB.First(&training, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Training not found"})
		return
	}

	if err := c.ShouldBindJSON(&training); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Save(&training)
	c.JSON(http.StatusOK, gin.H{"message": "Training updated successfully", "training": training})
}

func DeleteTraining(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.Training{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Training deleted successfully"})
}

func CreateAnnouncement(c *gin.Context) {
	var announcement models.Announcement
	if err := c.ShouldBindJSON(&announcement); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if result := models.DB.Create(&announcement); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Announcement created successfully", "announcement": announcement})
}

func UpdateAnnouncement(c *gin.Context) {
	id := c.Param("id")
	var announcement models.Announcement
	if result := models.DB.First(&announcement, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}

	if err := c.ShouldBindJSON(&announcement); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	models.DB.Save(&announcement)
	c.JSON(http.StatusOK, gin.H{"message": "Announcement updated successfully", "announcement": announcement})
}

func DeleteAnnouncement(c *gin.Context) {
	id := c.Param("id")
	if result := models.DB.Delete(&models.Announcement{}, id); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Announcement deleted successfully"})
}

func DeleteForumPost(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var post models.ForumPost
	if result := models.DB.First(&post, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Post not found"})
		return
	}

	if post.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own posts"})
		return
	}

	models.DB.Delete(&post)
	c.JSON(http.StatusOK, gin.H{"message": "Post deleted successfully"})
}

func ToggleFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		TargetID   uint   `json:"target_id" binding:"required"`
		TargetType string `json:"type" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existing models.Favorite
	if result := models.DB.Where("user_id = ? AND target_id = ? AND target_type = ?", userID, req.TargetID, req.TargetType).First(&existing); result.RowsAffected > 0 {
		models.DB.Delete(&existing)
		c.JSON(http.StatusOK, gin.H{"favorited": false, "message": "Favorite removed"})
		return
	}

	favorite := models.Favorite{
		UserID:     userID,
		TargetID:   req.TargetID,
		TargetType: req.TargetType,
	}

	if result := models.DB.Create(&favorite); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"favorited": true, "message": "Favorite added", "favorite": favorite})
}
