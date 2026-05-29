package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/model"
	"team-virtual-office/ws"

	"github.com/gin-gonic/gin"
)

type SendRoomMessageRequest struct {
	RoomID  uint   `json:"room_id"`
	Content string `json:"content"`
	Type    int8   `json:"type"`
}

type SendPrivateMessageRequest struct {
	ReceiverID uint   `json:"receiver_id"`
	Content    string `json:"content"`
	Type       int8   `json:"type"`
}

func SendRoomMessage(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	senderID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req SendRoomMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	message := model.Message{
		RoomID:   &req.RoomID,
		SenderID: uint(senderID),
		Type:     req.Type,
		Content:  req.Content,
		IsRead:   0,
	}
	if err := db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to send message"})
		return
	}

	var sender model.User
	db.First(&sender, senderID)

	members, err := cacheManager.GetRoomMembers(req.RoomID)
	if err != nil {
		var roomMembers []model.RoomMember
		db.Where("room_id = ?", req.RoomID).Find(&roomMembers)
		for _, rm := range roomMembers {
			hub.Broadcast <- ws.Message{
				Type: "private",
				To:   rm.UserID,
				Data: map[string]interface{}{
					"type":       "room_message",
					"id":         message.ID,
					"room_id":    req.RoomID,
					"sender_id":  senderID,
					"nickname":   sender.Nickname,
					"avatar_url": sender.AvatarURL,
					"msg_type":   req.Type,
					"content":    req.Content,
					"created_at": message.CreatedAt,
				},
			}
		}
	} else {
		for _, memberID := range members {
			hub.Broadcast <- ws.Message{
				Type: "private",
				To:   memberID,
				Data: map[string]interface{}{
					"type":       "room_message",
					"id":         message.ID,
					"room_id":    req.RoomID,
					"sender_id":  senderID,
					"nickname":   sender.Nickname,
					"avatar_url": sender.AvatarURL,
					"msg_type":   req.Type,
					"content":    req.Content,
					"created_at": message.CreatedAt,
				},
			}
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"message_id": message.ID,
		},
	})
}

func SendPrivateMessage(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	senderID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req SendPrivateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	receiverID := req.ReceiverID
	message := model.Message{
		SenderID:   uint(senderID),
		ReceiverID: &receiverID,
		Type:       req.Type,
		Content:    req.Content,
		IsRead:     0,
	}
	if err := db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to send message"})
		return
	}

	var sender model.User
	db.First(&sender, senderID)

	hub.Broadcast <- ws.Message{
		Type: "private",
		To:   req.ReceiverID,
		Data: map[string]interface{}{
			"type":       "private_message",
			"id":         message.ID,
			"sender_id":  senderID,
			"nickname":   sender.Nickname,
			"avatar_url": sender.AvatarURL,
			"msg_type":   req.Type,
			"content":    req.Content,
			"created_at": message.CreatedAt,
		},
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"message_id": message.ID,
		},
	})
}

func GetRoomMessages(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	roomID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var member model.RoomMember
	if err := db.Where("room_id = ? AND user_id = ?", roomID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusForbidden, model.Response{Code: 403, Message: "not a room member"})
		return
	}

	var messages []model.Message
	var total int64

	db.Model(&model.Message{}).Where("room_id = ?", roomID).Count(&total)

	offset := (page - 1) * pageSize
	db.Model(&model.Message{}).Where("room_id = ?", roomID).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&messages)

	senderIDs := make([]uint, len(messages))
	for i, msg := range messages {
		senderIDs[i] = msg.SenderID
	}

	var users []model.User
	db.Where("id IN ?", senderIDs).Find(&users)

	userMap := make(map[uint]model.User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]map[string]interface{}, len(messages))
	for i, msg := range messages {
		sender := userMap[msg.SenderID]
		result[i] = map[string]interface{}{
			"id":         msg.ID,
			"sender_id":  msg.SenderID,
			"nickname":   sender.Nickname,
			"avatar_url": sender.AvatarURL,
			"type":       msg.Type,
			"content":    msg.Content,
			"is_read":    msg.IsRead,
			"created_at": msg.CreatedAt,
		}
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

func GetPrivateMessages(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	otherUserID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	var messages []model.Message
	var total int64

	db.Model(&model.Message{}).Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		userID, otherUserID, otherUserID, userID,
	).Count(&total)

	offset := (page - 1) * pageSize
	db.Model(&model.Message{}).Where(
		"(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		userID, otherUserID, otherUserID, userID,
	).Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&messages)

	senderIDs := make([]uint, len(messages))
	for i, msg := range messages {
		senderIDs[i] = msg.SenderID
	}

	var users []model.User
	db.Where("id IN ?", senderIDs).Find(&users)

	userMap := make(map[uint]model.User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	result := make([]map[string]interface{}, len(messages))
	for i, msg := range messages {
		sender := userMap[msg.SenderID]
		result[i] = map[string]interface{}{
			"id":         msg.ID,
			"sender_id":  msg.SenderID,
			"nickname":   sender.Nickname,
			"avatar_url": sender.AvatarURL,
			"type":       msg.Type,
			"content":    msg.Content,
			"is_read":    msg.IsRead,
			"created_at": msg.CreatedAt,
		}
	}

	db.Model(&model.Message{}).Where(
		"sender_id = ? AND receiver_id = ? AND is_read = 0",
		otherUserID, userID,
	).Update("is_read", 1)

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
