package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"simple-chat-room/config"
)

type Room struct {
	ID              string     `json:"id"`
	Name            string     `json:"name"`
	CreatorNickname string     `json:"creator_nickname"`
	CreatedAt       time.Time  `json:"created_at"`
	ExpiresAt       *time.Time `json:"expires_at,omitempty"`
	IsDestroyed     bool       `json:"is_destroyed"`
}

func CreateRoom(name, creatorNickname string, expiresInHours *int) (*Room, error) {
	id := uuid.New().String()
	now := time.Now()

	var expiresAt *time.Time
	if expiresInHours != nil && *expiresInHours > 0 {
		expTime := now.Add(time.Duration(*expiresInHours) * time.Hour)
		expiresAt = &expTime
	}

	query := `INSERT INTO rooms (id, name, creator_nickname, created_at, expires_at, is_destroyed)
	          VALUES (?, ?, ?, ?, ?, 0)`

	_, err := config.DB.Exec(query, id, name, creatorNickname, now, expiresAt)
	if err != nil {
		return nil, err
	}

	return &Room{
		ID:              id,
		Name:            name,
		CreatorNickname: creatorNickname,
		CreatedAt:       now,
		ExpiresAt:       expiresAt,
		IsDestroyed:     false,
	}, nil
}

func GetActiveRooms() ([]Room, error) {
	query := `SELECT id, name, creator_nickname, created_at, expires_at, is_destroyed
	          FROM rooms
	          WHERE is_destroyed = 0 AND (expires_at IS NULL OR expires_at > NOW())
	          ORDER BY created_at DESC`

	rows, err := config.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rooms []Room
	for rows.Next() {
		var room Room
		var expiresAt sql.NullTime
		err := rows.Scan(&room.ID, &room.Name, &room.CreatorNickname, &room.CreatedAt, &expiresAt, &room.IsDestroyed)
		if err != nil {
			return nil, err
		}
		if expiresAt.Valid {
			room.ExpiresAt = &expiresAt.Time
		}
		rooms = append(rooms, room)
	}

	return rooms, nil
}

func GetRoomByID(id string) (*Room, error) {
	query := `SELECT id, name, creator_nickname, created_at, expires_at, is_destroyed
	          FROM rooms WHERE id = ?`

	var room Room
	var expiresAt sql.NullTime
	err := config.DB.QueryRow(query, id).Scan(&room.ID, &room.Name, &room.CreatorNickname, &room.CreatedAt, &expiresAt, &room.IsDestroyed)
	if err != nil {
		return nil, err
	}
	if expiresAt.Valid {
		room.ExpiresAt = &expiresAt.Time
	}

	return &room, nil
}

func DestroyRoom(id string) error {
	query := `UPDATE rooms SET is_destroyed = 1 WHERE id = ?`
	_, err := config.DB.Exec(query, id)
	return err
}

func IsRoomActive(id string) (bool, error) {
	query := `SELECT is_destroyed, expires_at FROM rooms WHERE id = ?`

	var isDestroyed bool
	var expiresAt sql.NullTime
	err := config.DB.QueryRow(query, id).Scan(&isDestroyed, &expiresAt)
	if err != nil {
		return false, err
	}

	if isDestroyed {
		return false, nil
	}

	if expiresAt.Valid && expiresAt.Time.Before(time.Now()) {
		return false, nil
	}

	return true, nil
}
