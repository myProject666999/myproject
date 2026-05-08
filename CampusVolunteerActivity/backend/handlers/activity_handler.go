package handlers

import (
	"net/http"
	"strconv"
	"time"

	"campus-volunteer-system/config"
	"campus-volunteer-system/models"

	"github.com/gin-gonic/gin"
)

type CreateActivityRequest struct {
	Title           string    `json:"title" binding:"required"`
	Description     string    `json:"description"`
	Location        string    `json:"location"`
	StartDate       time.Time `json:"start_date"`
	EndDate         time.Time `json:"end_date"`
	MaxParticipants int       `json:"max_participants"`
	Points          int       `json:"points"`
	Category        string    `json:"category"`
	CoverImage      string    `json:"cover_image"`
}

func GetActivities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")
	status := c.Query("status")
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var activities []models.Activity
	var total int64

	db := config.DB.Model(&models.Activity{})

	if category != "" {
		db = db.Where("category = ?", category)
	}
	if status != "" {
		db = db.Where("status = ?", status)
	}
	if keyword != "" {
		db = db.Where("title LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	db.Count(&total)
	db.Order("created_at desc").Offset(offset).Limit(pageSize).Find(&activities)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data": gin.H{
			"list":       activities,
			"total":      total,
			"page":       page,
			"page_size":  pageSize,
		},
	})
}

func GetActivityDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "活动不存在",
		})
		return
	}

	var comments []models.Comment
	config.DB.Where("activity_id = ? AND status = ?", id, "active").
		Preload("User").
		Order("created_at desc").
		Find(&comments)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data": gin.H{
			"activity": activity,
			"comments": comments,
		},
	})
}

func CreateActivity(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	activity := &models.Activity{
		Title:           req.Title,
		Description:     req.Description,
		Location:        req.Location,
		StartDate:       req.StartDate,
		EndDate:         req.EndDate,
		MaxParticipants: req.MaxParticipants,
		Points:          req.Points,
		Category:        req.Category,
		CoverImage:      req.CoverImage,
		Status:          models.ActivityActive,
		CreatedBy:       userID,
	}

	if err := config.DB.Create(activity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "创建活动失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "活动创建成功",
		"data":    activity,
	})
}

func UpdateActivity(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var req CreateActivityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "活动不存在",
		})
		return
	}

	updates := map[string]interface{}{
		"title":            req.Title,
		"description":      req.Description,
		"location":         req.Location,
		"start_date":       req.StartDate,
		"end_date":         req.EndDate,
		"max_participants": req.MaxParticipants,
		"points":          req.Points,
		"category":        req.Category,
		"cover_image":      req.CoverImage,
	}

	if err := config.DB.Model(&activity).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "更新活动失败",
		})
		return
	}

	config.DB.First(&activity, id)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "活动更新成功",
		"data":    activity,
	})
}

func DeleteActivity(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	if err := config.DB.Delete(&models.Activity{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "删除活动失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "活动删除成功",
	})
}

func GetMyActivities(c *gin.Context) {
	userID := c.GetUint("user_id")
	status := c.Query("status")

	var registrations []models.Registration
	db := config.DB.Where("user_id = ?", userID)

	if status != "" {
		db = db.Where("status = ?", status)
	}

	db.Preload("Activity").Order("created_at desc").Find(&registrations)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    registrations,
	})
}

func RegisterActivity(c *gin.Context) {
	userID := c.GetUint("user_id")
	activityID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var activity models.Activity
	if err := config.DB.First(&activity, activityID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "活动不存在",
		})
		return
	}

	var existingReg models.Registration
	if err := config.DB.Where("user_id = ? AND activity_id = ?", userID, activityID).First(&existingReg).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"code":    409,
			"message": "您已经报名过此活动",
		})
		return
	}

	if activity.CurrentParticipants >= activity.MaxParticipants {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "活动名额已满",
		})
		return
	}

	registration := &models.Registration{
		UserID:     userID,
		ActivityID: uint(activityID),
		Status:     models.RegRegistered,
	}

	tx := config.DB.Begin()

	if err := tx.Create(registration).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "报名失败",
		})
		return
	}

	if err := tx.Model(&activity).Update("current_participants", activity.CurrentParticipants+1).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "报名失败",
		})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "报名成功",
		"data":    registration,
	})
}

func CancelRegistration(c *gin.Context) {
	userID := c.GetUint("user_id")
	activityID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var registration models.Registration
	if err := config.DB.Where("user_id = ? AND activity_id = ?", userID, activityID).First(&registration).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "未找到报名记录",
		})
		return
	}

	if registration.Status != models.RegRegistered {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无法取消此状态的报名",
		})
		return
	}

	tx := config.DB.Begin()

	if err := tx.Model(&registration).Update("status", models.RegCancelled).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "取消报名失败",
		})
		return
	}

	var activity models.Activity
	config.DB.First(&activity, activityID)
	if err := tx.Model(&activity).Update("current_participants", activity.CurrentParticipants-1).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "取消报名失败",
		})
		return
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "取消报名成功",
	})
}
