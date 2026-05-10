package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"unique;not null;size:50" json:"username"`
	Password  string         `gorm:"not null" json:"-"`
	Email     string         `gorm:"unique;size:100" json:"email"`
	Phone     string         `gorm:"size:20" json:"phone"`
	Nickname  string         `gorm:"size:50" json:"nickname"`
	Avatar    string         `gorm:"size:255" json:"avatar"`
	Role      string         `gorm:"default:user;size:20" json:"role"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type ScriptType struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"unique;not null;size:50" json:"name"`
	Desc      string         `gorm:"size:255" json:"desc"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Script struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Title       string         `gorm:"not null;size:100" json:"title"`
	TypeID      uint           `gorm:"not null" json:"type_id"`
	Type        ScriptType     `gorm:"foreignKey:TypeID" json:"type"`
	Price       float64        `gorm:"not null;default:0" json:"price"`
	Description string         `gorm:"type:text" json:"description"`
	Players     int            `gorm:"not null;default:4" json:"players"`
	Duration    int            `gorm:"not null;default:120" json:"duration"`
	Cover       string         `gorm:"size:255" json:"cover"`
	Images      string         `gorm:"type:text" json:"images"`
	Status      int            `gorm:"default:1" json:"status"`
	Hot         int            `gorm:"default:0" json:"hot"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Room struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"unique;not null;size:50" json:"name"`
	Capacity  int            `gorm:"not null;default:4" json:"capacity"`
	Desc      string         `gorm:"size:255" json:"desc"`
	Status    int            `gorm:"default:1" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Order struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	OrderNo     string         `gorm:"unique;not null;size:50" json:"order_no"`
	UserID      uint           `gorm:"not null" json:"user_id"`
	User        User           `gorm:"foreignKey:UserID" json:"user"`
	ScriptID    uint           `gorm:"not null" json:"script_id"`
	Script      Script         `gorm:"foreignKey:ScriptID" json:"script"`
	RoomID      uint           `gorm:"not null" json:"room_id"`
	Room        Room           `gorm:"foreignKey:RoomID" json:"room"`
	PlayDate    string         `gorm:"not null;size:20" json:"play_date"`
	PlayTime    string         `gorm:"not null;size:20" json:"play_time"`
	Players     int            `gorm:"not null;default:1" json:"players"`
	TotalAmount float64        `gorm:"not null;default:0" json:"total_amount"`
	Status      int            `gorm:"default:0" json:"status"`
	Remark      string         `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Discussion struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"not null;size:100" json:"title"`
	Content   string         `gorm:"type:text" json:"content"`
	UserID    uint           `gorm:"not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user"`
	ScriptID  uint           `json:"script_id"`
	Script    Script         `gorm:"foreignKey:ScriptID" json:"script"`
	Views     int            `gorm:"default:0" json:"views"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type News struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"not null;size:100" json:"title"`
	Content   string         `gorm:"type:text" json:"content"`
	Author    string         `gorm:"size:50" json:"author"`
	Cover     string         `gorm:"size:255" json:"cover"`
	Views     int            `gorm:"default:0" json:"views"`
	Status    int            `gorm:"default:1" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Carousel struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"size:100" json:"title"`
	Image     string         `gorm:"not null;size:255" json:"image"`
	Link      string         `gorm:"size:255" json:"link"`
	Sort      int            `gorm:"default:0" json:"sort"`
	Status    int            `gorm:"default:1" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&User{},
		&ScriptType{},
		&Script{},
		&Room{},
		&Order{},
		&Discussion{},
		&News{},
		&Carousel{},
	)
}
