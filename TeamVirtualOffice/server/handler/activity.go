package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/model"
	"time"

	"github.com/gin-gonic/gin"
)

func GetActivities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var activities []model.Activity
	var total int64

	db.Model(&model.Activity{}).Count(&total)

	offset := (page - 1) * pageSize
	db.Model(&model.Activity{}).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&activities)

	userIDs := make([]uint, 0)
	for _, act := range activities {
		userIDs = append(userIDs, act.UserID)
		if act.TargetUserID != nil {
			userIDs = append(userIDs, *act.TargetUserID)
		}
	}

	var users []model.User
	if len(userIDs) > 0 {
		db.Where("id IN ?", userIDs).Find(&users)
	}

	userMap := make(map[uint]model.User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]map[string]interface{}, len(activities))
	for i, act := range activities {
		data := map[string]interface{}{
			"id":         act.ID,
			"user_id":    act.UserID,
			"type":       act.Type,
			"content":    act.Content,
			"room_id":    act.RoomID,
			"created_at": act.CreatedAt,
		}

		if user, ok := userMap[act.UserID]; ok {
			data["nickname"] = user.Nickname
			data["avatar_url"] = user.AvatarURL
		}

		if act.TargetUserID != nil {
			data["target_user_id"] = act.TargetUserID
			if targetUser, ok := userMap[*act.TargetUserID]; ok {
				data["target_nickname"] = targetUser.Nickname
				data["target_avatar_url"] = targetUser.AvatarURL
			}
		}

		result[i] = data
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: model.PageResult{
			List:     result,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}

func CreateActivity(userID uint, activityType int8, content string, roomID *uint, targetUserID *uint) error {
	activity := model.Activity{
		UserID:       userID,
		Type:         activityType,
		Content:      content,
		RoomID:       roomID,
		TargetUserID: targetUserID,
		CreatedAt:    time.Now(),
	}
	return db.Create(&activity).Error
}
