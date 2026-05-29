package handler

import (
	"net/http"
	"strconv"
	"team-virtual-office/model"

	"github.com/gin-gonic/gin"
)

type CreateRoomRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Type        int8   `json:"type"`
	MaxCapacity int    `json:"max_capacity"`
	IsPublic    int8   `json:"is_public"`
	Password    string `json:"password"`
}

func ListRooms(c *gin.Context) {
	var rooms []model.Room
	if err := db.Where("status = 1").Find(&rooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to query rooms"})
		return
	}

	result := make([]map[string]interface{}, len(rooms))
	for i, room := range rooms {
		var count int64
		db.Model(&model.RoomMember{}).Where("room_id = ?", room.ID).Count(&count)
		result[i] = map[string]interface{}{
			"id":           room.ID,
			"name":         room.Name,
			"description":  room.Description,
			"type":         room.Type,
			"max_capacity": room.MaxCapacity,
			"owner_id":     room.OwnerID,
			"is_public":    room.IsPublic,
			"member_count": count,
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data:    result,
	})
}

func CreateRoom(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)

	var req CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "invalid request"})
		return
	}

	room := model.Room{
		Name:        req.Name,
		Description: req.Description,
		Type:        req.Type,
		MaxCapacity: req.MaxCapacity,
		OwnerID:     uint(userID),
		IsPublic:    req.IsPublic,
		Password:    req.Password,
		Status:      1,
	}

	if err := db.Create(&room).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to create room"})
		return
	}

	member := model.RoomMember{
		RoomID: room.ID,
		UserID: uint(userID),
		Role:   1,
	}
	db.Create(&member)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data:    gin.H{"room_id": room.ID},
	})
}

func JoinRoom(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)
	roomID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var room model.Room
	if err := db.First(&room, roomID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "room not found"})
		return
	}

	var count int64
	db.Model(&model.RoomMember{}).Where("room_id = ?", roomID).Count(&count)
	if int(count) >= room.MaxCapacity {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "room is full"})
		return
	}

	var existing model.RoomMember
	if db.Where("room_id = ? AND user_id = ?", roomID, userID).First(&existing).Error == nil {
		c.JSON(http.StatusOK, model.Response{Code: 0, Message: "already in room"})
		return
	}

	member := model.RoomMember{
		RoomID: uint(roomID),
		UserID: uint(userID),
		Role:   2,
	}
	db.Create(&member)

	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Update("current_room_id", roomID)
	cacheManager.SetUserRoom(uint(userID), uint(roomID))

	var user model.User
	db.First(&user, userID)
	hub.BroadcastToRoom(uint(roomID), map[string]interface{}{
		"type": "user_joined",
		"user": map[string]interface{}{
			"id":       user.ID,
			"nickname": user.Nickname,
			"avatar_url": user.AvatarURL,
		},
	})

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func LeaveRoom(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)
	roomID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	db.Where("room_id = ? AND user_id = ?", roomID, userID).Delete(&model.RoomMember{})

	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Update("current_room_id", nil)
	cacheManager.SetUserRoom(uint(userID), 0)

	var user model.User
	db.First(&user, userID)
	hub.BroadcastToRoom(uint(roomID), map[string]interface{}{
		"type": "user_left",
		"user_id": user.ID,
	})

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func GetRoomDetail(c *gin.Context) {
	roomID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var room model.Room
	if err := db.First(&room, roomID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "room not found"})
		return
	}

	var members []model.RoomMember
	db.Where("room_id = ?", roomID).Find(&members)

	userIDs := make([]uint, len(members))
	for i, m := range members {
		userIDs[i] = m.UserID
	}

	var users []model.User
	db.Where("id IN ?", userIDs).Find(&users)

	userMap := make(map[uint]model.User)
	for _, u := range users {
		userMap[u.ID] = u
	}

	var statuses []model.UserStatus
	db.Where("user_id IN ?", userIDs).Find(&statuses)

	statusMap := make(map[uint]model.UserStatus)
	for _, s := range statuses {
		statusMap[s.UserID] = s
	}

	memberList := make([]map[string]interface{}, len(members))
	for i, m := range members {
		u := userMap[m.UserID]
		s := statusMap[m.UserID]
		memberList[i] = map[string]interface{}{
			"id":            u.ID,
			"nickname":      u.Nickname,
			"avatar_url":    u.AvatarURL,
			"role":          m.Role,
			"online_status": s.OnlineStatus,
			"busy_mode":     s.BusyMode,
		}
	}

	var seats []model.Seat
	db.Where("room_id = ?", roomID).Find(&seats)

	seatUserIDs := make([]uint, 0)
	for _, s := range seats {
		if s.UserID != nil {
			seatUserIDs = append(seatUserIDs, *s.UserID)
		}
	}

	var seatUsers []model.User
	if len(seatUserIDs) > 0 {
		db.Where("id IN ?", seatUserIDs).Find(&seatUsers)
	}

	seatUserMap := make(map[uint]model.User)
	for _, u := range seatUsers {
		seatUserMap[u.ID] = u
	}

	seatList := make([]map[string]interface{}, len(seats))
	for i, seat := range seats {
		seatData := map[string]interface{}{
			"id":          seat.ID,
			"seat_number": seat.SeatNumber,
			"pos_x":       seat.PositionX,
			"pos_y":       seat.PositionY,
			"is_occupied": seat.IsOccupied,
		}
		if seat.UserID != nil {
			u := seatUserMap[*seat.UserID]
			seatData["user_id"] = seat.UserID
			seatData["nickname"] = u.Nickname
			seatData["avatar_url"] = u.AvatarURL
		}
		seatList[i] = seatData
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"id":           room.ID,
			"name":         room.Name,
			"description":  room.Description,
			"type":         room.Type,
			"max_capacity": room.MaxCapacity,
			"owner_id":     room.OwnerID,
			"is_public":    room.IsPublic,
			"members":      memberList,
			"seats":        seatList,
		},
	})
}

func ListSeats(c *gin.Context) {
	roomID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var seats []model.Seat
	if err := db.Where("room_id = ?", roomID).Find(&seats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, model.Response{Code: 500, Message: "failed to query seats"})
		return
	}

	userIDs := make([]uint, 0)
	for _, s := range seats {
		if s.UserID != nil {
			userIDs = append(userIDs, *s.UserID)
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

	result := make([]map[string]interface{}, len(seats))
	for i, seat := range seats {
		result[i] = map[string]interface{}{
			"id":          seat.ID,
			"seat_number": seat.SeatNumber,
			"pos_x":       seat.PositionX,
			"pos_y":       seat.PositionY,
			"user_id":     seat.UserID,
			"is_occupied": seat.IsOccupied,
		}
		if seat.UserID != nil {
			u := userMap[*seat.UserID]
			result[i]["nickname"] = u.Nickname
			result[i]["avatar_url"] = u.AvatarURL
		}
	}

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
		Data:    result,
	})
}

func OccupySeat(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)
	seatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var seat model.Seat
	if err := db.First(&seat, seatID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "seat not found"})
		return
	}

	var member model.RoomMember
	if err := db.Where("room_id = ? AND user_id = ?", seat.RoomID, userID).First(&member).Error; err != nil {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "please join the room first"})
		return
	}

	if seat.IsOccupied == 1 {
		if seat.UserID != nil && *seat.UserID == uint(userID) {
			c.JSON(http.StatusOK, model.Response{Code: 0, Message: "already occupied this seat"})
			return
		}
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "seat is occupied"})
		return
	}

	var existingSeat model.Seat
	if db.Where("user_id = ? AND is_occupied = 1", userID).First(&existingSeat).Error == nil {
		existingSeat.UserID = nil
		existingSeat.IsOccupied = 0
		db.Save(&existingSeat)
		CreateActivity(uint(userID), 4, "", &existingSeat.RoomID, nil)
	}

	uid := uint(userID)
	seat.UserID = &uid
	seat.IsOccupied = 1
	db.Save(&seat)

	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Update("current_seat_id", seatID)

	var user model.User
	db.First(&user, userID)
	hub.BroadcastToRoom(seat.RoomID, map[string]interface{}{
		"type": "seat_occupied",
		"seat_id": seat.ID,
		"user_id": user.ID,
		"nickname": user.Nickname,
		"avatar_url": user.AvatarURL,
	})

	CreateActivity(uint(userID), 3, "", &seat.RoomID, nil)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}

func LeaveSeat(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := strconv.ParseUint(userIDStr.(string), 10, 64)
	seatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var seat model.Seat
	if err := db.First(&seat, seatID).Error; err != nil {
		c.JSON(http.StatusNotFound, model.Response{Code: 404, Message: "seat not found"})
		return
	}

	if seat.UserID == nil || *seat.UserID != uint(userID) {
		c.JSON(http.StatusBadRequest, model.Response{Code: 400, Message: "not your seat"})
		return
	}

	seat.UserID = nil
	seat.IsOccupied = 0
	db.Save(&seat)

	db.Model(&model.UserStatus{}).Where("user_id = ?", userID).Update("current_seat_id", nil)

	var user model.User
	db.First(&user, userID)
	hub.BroadcastToRoom(seat.RoomID, map[string]interface{}{
		"type": "seat_left",
		"seat_id": seat.ID,
		"user_id": user.ID,
		"nickname": user.Nickname,
	})

	CreateActivity(uint(userID), 4, "", &seat.RoomID, nil)

	c.JSON(http.StatusOK, model.Response{
		Code:    0,
		Message: "success",
	})
}
