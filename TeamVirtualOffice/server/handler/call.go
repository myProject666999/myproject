package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/model"
	"team-virtual-office/ws"
	"time"

	"github.com/gin-gonic/gin"
)

type StartCallRequest struct {
	CalleeID uint `json:"callee_id"`
	Type     int8 `json:"type"`
}

func StartCall(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	callerID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req StartCallRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	isOnline, err := cacheManager.IsUserOnline(req.CalleeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to check user status"})
		return
	}

	if !isOnline {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "callee is offline"})
		return
	}

	statusMap, err := cacheManager.GetUserStatus(req.CalleeID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to get user status"})
		return
	}

	busyMode := 0
	if val, ok := statusMap["busy_mode"]; ok {
		busyMode, _ = strconv.Atoi(val)
	}

	if busyMode == 1 {
		callRecord := model.CallRecord{
			CallerID: uint(callerID),
			CalleeID: req.CalleeID,
			Type:     req.Type,
			Status:   5,
		}
		db.Create(&callRecord)
		c.JSON(http.StatusBadRequest, model.Response{Code: 403, Message: "callee is in DND mode"})
		return
	}

	callRecord := model.CallRecord{
		CallerID: uint(callerID),
		CalleeID: req.CalleeID,
		Type:     req.Type,
		Status:   1,
	}
	if err := db.Create(&callRecord).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to create call record"})
		return
	}

	var caller model.User
	db.First(&caller, callerID)

	hub.Broadcast <- ws.Message{
		Type: "private",
		To:   req.CalleeID,
		Data: map[string]interface{}{
			"type":       "call_incoming",
			"call_id":    callRecord.ID,
			"caller_id":  callerID,
			"nickname":   caller.Nickname,
			"avatar_url": caller.AvatarURL,
			"call_type":  req.Type,
		},
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"call_id": callRecord.ID,
		},
	})
}

func AnswerCall(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	calleeID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	callID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var callRecord model.CallRecord
	if err := db.First(&callRecord, callID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "call not found"})
		return
	}

	if callRecord.CalleeID != uint(calleeID) {
		c.JSON(http.StatusForbidden, model.Response{Code: 403, Message: "not authorized"})
		return
	}

	now := time.Now()
	callRecord.Status = 2
	callRecord.StartTime = now
	db.Save(&callRecord)

	var callee model.User
	db.First(&callee, calleeID)

	hub.Broadcast <- ws.Message{
		Type: "private",
		To:   callRecord.CallerID,
		Data: map[string]interface{}{
			"type":       "call_answered",
			"call_id":    callRecord.ID,
			"callee_id":  calleeID,
			"nickname":   callee.Nickname,
			"start_time": now,
		},
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func RejectCall(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	calleeID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	callID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var callRecord model.CallRecord
	if err := db.First(&callRecord, callID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "call not found"})
		return
	}

	if callRecord.CalleeID != uint(calleeID) {
		c.JSON(http.StatusForbidden, model.Response{Code: 403, Message: "not authorized"})
		return
	}

	callRecord.Status = 3
	db.Save(&callRecord)

	hub.Broadcast <- ws.Message{
		Type: "private",
		To:   callRecord.CallerID,
		Data: map[string]interface{}{
			"type":    "call_rejected",
			"call_id": callRecord.ID,
		},
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func HangupCall(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	callID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var callRecord model.CallRecord
	if err := db.First(&callRecord, callID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "call not found"})
		return
	}

	if callRecord.CallerID != uint(userID) && callRecord.CalleeID != uint(userID) {
		c.JSON(http.StatusForbidden, model.Response{Code: 403, Message: "not authorized"})
		return
	}

	now := time.Now()
	endTime := &now
	duration := 0
	if !callRecord.StartTime.IsZero() {
		duration = int(now.Sub(callRecord.StartTime).Seconds())
	}

	finalStatus := int8(4)
	if callRecord.Status == 2 {
		finalStatus = 2
	}

	callRecord.Status = finalStatus
	callRecord.EndTime = endTime
	callRecord.Duration = duration
	db.Save(&callRecord)

	hub.Broadcast <- ws.Message{
		Type: "private",
		To:   callRecord.CallerID,
		Data: map[string]interface{}{
			"type":     "call_ended",
			"call_id":  callRecord.ID,
			"duration": duration,
		},
	}

	if callRecord.CallerID != callRecord.CalleeID {
		hub.Broadcast <- ws.Message{
			Type: "private",
			To:   callRecord.CalleeID,
			Data: map[string]interface{}{
				"type":     "call_ended",
				"call_id":  callRecord.ID,
				"duration": duration,
			},
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}
