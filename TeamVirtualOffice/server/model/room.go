package model

import "time"

type Room struct {
	ID           uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	Description  string    `gorm:"type:text" json:"description"`
	Type         int8      `gorm:"type:tinyint;default:1" json:"type"`
	MaxCapacity  int       `gorm:"default:10" json:"max_capacity"`
	OwnerID      uint      `gorm:"not null" json:"owner_id"`
	IsPublic     int8      `gorm:"type:tinyint;default:1" json:"is_public"`
	Password     string    `gorm:"type:varchar(50)" json:"-"`
	Status       int8      `gorm:"type:tinyint;default:1" json:"status"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (Room) TableName() string {
	return "rooms"
}

type Seat struct {
	ID         uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	RoomID     uint      `gorm:"not null;uniqueIndex:uk_room_seat" json:"room_id"`
	SeatNumber string    `gorm:"type:varchar(20);not null;uniqueIndex:uk_room_seat" json:"seat_number"`
	PositionX  int       `gorm:"default:0" json:"position_x"`
	PositionY  int       `gorm:"default:0" json:"position_y"`
	UserID     *uint     `json:"user_id"`
	IsOccupied int8      `gorm:"type:tinyint;default:0" json:"is_occupied"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (Seat) TableName() string {
	return "seats"
}

type RoomMember struct {
	ID       uint      `gorm:"primarykey;bigint unsigned;autoIncrement" json:"id"`
	RoomID   uint      `gorm:"not null;uniqueIndex:uk_room_user" json:"room_id"`
	UserID   uint      `gorm:"not null;uniqueIndex:uk_room_user" json:"user_id"`
	Role     int8      `gorm:"type:tinyint;default:2" json:"role"`
	JoinedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"joined_at"`
}

func (RoomMember) TableName() string {
	return "room_members"
}
