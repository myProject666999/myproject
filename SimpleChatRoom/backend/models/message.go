package models

import (
	"time"

	"simple-chat-room/config"
)

const (
	MessageTypeText  = 1
	MessageTypeImage = 2
)

type Message struct {
	ID          int64     `json:"id"`
	RoomID      string    `json:"room_id"`
	Nickname    string    `json:"nickname"`
	Content     string    `json:"content,omitempty"`
	ImageURL    string    `json:"image_url,omitempty"`
	MessageType int       `json:"message_type"`
	CreatedAt   time.Time `json:"created_at"`
}

func CreateMessage(roomID, nickname, content, imageURL string, messageType int) (*Message, error) {
	now := time.Now()

	query := `INSERT INTO messages (room_id, nickname, content, image_url, message_type, created_at)
	          VALUES (?, ?, ?, ?, ?, ?)`

	result, err := config.DB.Exec(query, roomID, nickname, content, imageURL, messageType, now)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return &Message{
		ID:          id,
		RoomID:      roomID,
		Nickname:    nickname,
		Content:     content,
		ImageURL:    imageURL,
		MessageType: messageType,
		CreatedAt:   now,
	}, nil
}

func GetMessagesByRoomID(roomID string, limit int) ([]Message, error) {
	if limit <= 0 {
		limit = 100
	}

	query := `SELECT id, room_id, nickname, content, image_url, message_type, created_at
	          FROM messages
	          WHERE room_id = ?
	          ORDER BY created_at DESC
	          LIMIT ?`

	rows, err := config.DB.Query(query, roomID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []Message
	for rows.Next() {
		var msg Message
		err := rows.Scan(&msg.ID, &msg.RoomID, &msg.Nickname, &msg.Content, &msg.ImageURL, &msg.MessageType, &msg.CreatedAt)
		if err != nil {
			return nil, err
		}
		messages = append(messages, msg)
	}

	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nil
}
