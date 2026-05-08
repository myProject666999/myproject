package handlers

import (
	"net/http"
	"strconv"

	"campus-volunteer-system/config"
	"campus-volunteer-system/models"

	"github.com/gin-gonic/gin"
)

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required"`
	Rating  int    `json:"rating"`
}

func CreateComment(c *gin.Context) {
	userID := c.GetUint("user_id")
	activityID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请求参数错误",
		})
		return
	}

	var registration models.Registration
	if err := config.DB.Where("user_id = ? AND activity_id = ? AND status != ?", 
		userID, activityID, string(models.RegCancelled)).
		First(&registration).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "您未参与过此活动，无法评论",
		})
		return
	}

	rating := req.Rating
	if rating < 1 || rating > 5 {
		rating = 5
	}

	comment := &models.Comment{
		UserID:     userID,
		ActivityID: uint(activityID),
		Content:    req.Content,
		Rating:     rating,
		Status:     "active",
	}

	if err := config.DB.Create(comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "评论失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "评论成功",
		"data":    comment,
	})
}

func GetComments(c *gin.Context) {
	activityID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的活动ID",
		})
		return
	}

	var comments []models.Comment
	config.DB.Where("activity_id = ? AND status = ?", activityID, "active").
		Preload("User").
		Order("created_at desc").
		Find(&comments)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    comments,
	})
}
