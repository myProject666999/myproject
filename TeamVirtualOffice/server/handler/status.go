package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/model"
	"team-virtual-office/ws"
	"time"

	"github.com/gin-gonic/gin"
)

type UpdateStatusRequest struct {
	OnlineStatus int    `json:"online_status"`
	BusyMode     int    `json:"busy_mode"`
	TextStatus   string `json:"text_status"`
}

type SetBusyModeRequest struct {
	BusyMode int `json:"busy_mode"`
}

func UpdateStatus(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	changed, err := cacheManager.SetUserStatus(uint(userID), req.OnlineStatus, req.BusyMode, req.TextStatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to update status"})
		return
	}

	var userStatus model.UserStatus
	db.Where("user_id = ?", userID).First(&userStatus)
	if userStatus.ID == 0 {
		userStatus = model.UserStatus{
			UserID:       uint(userID),
			OnlineStatus: int8(req.OnlineStatus),
			BusyMode:     int8(req.BusyMode),
			TextStatus:   req.TextStatus,
		}
		db.Create(&userStatus)
	} else {
		userStatus.OnlineStatus = int8(req.OnlineStatus)
		userStatus.BusyMode = int8(req.BusyMode)
		userStatus.TextStatus = req.TextStatus
		userStatus.UpdatedAt = time.Now()
		db.Save(&userStatus)
	}

	if changed {
		var user model.User
		db.First(&user, userID)
		onlineUsers, _ := cacheManager.GetOnlineUsers()
		for _, uid := range onlineUsers {
			hub.Broadcast <- ws.Message{
				Type: "private",
				To:   uid,
				Data: map[string]interface{}{
					"type":          "status_update",
					"user_id":       userID,
					"nickname":      user.Nickname,
					"avatar_url":    user.AvatarURL,
					"online_status": req.OnlineStatus,
					"busy_mode":     req.BusyMode,
					"text_status":   req.TextStatus,
				},
			}
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func SetBusyMode(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req SetBusyModeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	statusMap, err := cacheManager.GetUserStatus(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to get status"})
		return
	}

	onlineStatus := 0
	if val, ok := statusMap["online_status"]; ok {
		onlineStatus, _ = strconv.Atoi(val)
	}
	textStatus := statusMap["text_status"]

	_, err = cacheManager.SetUserStatus(uint(userID), onlineStatus, req.BusyMode, textStatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to update busy mode"})
		return
	}

	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Update("busy_mode", req.BusyMode)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func GetStatus(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	statusMap, err := cacheManager.GetUserStatus(uint(userID))
	if err != nil || len(statusMap) == 0 {
		var userStatus model.UserStatus
		if err := db.Where("user_id = ?", userID).First(&userStatus).Error; err != nil {
			c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "status not found"})
			return
		}
		c.JSON(http.StatusOK, model.Response{
			Code:    0,
			Message: "success",
			Data:    userStatus,
		})
		return
	}

	onlineStatus, _ := strconv.Atoi(statusMap["online_status"])
	busyMode, _ := strconv.Atoi(statusMap["busy_mode"])

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"user_id":        userID,
			"online_status":  onlineStatus,
			"busy_mode":      busyMode,
			"text_status":    statusMap["text_status"],
			"last_heartbeat": statusMap["last_heartbeat"],
		},
	})
}

func Heartbeat(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	err := cacheManager.UpdateHeartbeat(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to update heartbeat"})
		return
	}

	now := time.Now()
	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Updates(map[string]interface{}{
		"last_heartbeat":  &now,
		"last_active_time": now,
	})

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}
