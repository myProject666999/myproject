package models

import (
	"time"
)

type Pet struct {
	ID            uint       `gorm:"primary_key" json:"id"`
	Name          string     `gorm:"not null" json:"name"`
	PetCategoryID uint       `json:"pet_category_id"`
	PetCategory   PetCategory `gorm:"foreignKey:PetCategoryID" json:"pet_category"`
	Age           string     `json:"age"`
	Gender        string     `json:"gender"`
	Breed         string     `json:"breed"`
	Description   string     `json:"description"`
	Images        string     `json:"images"`
	CoverImage    string     `json:"cover_image"`
	Status        int        `gorm:"default:1" json:"status"`
	Adopted       bool       `gorm:"default:false" json:"adopted"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	DeletedAt     *time.Time `sql:"index" json:"-"`
}

type Adoption struct {
	ID        uint       `gorm:"primary_key" json:"id"`
	PetID     uint       `json:"pet_id"`
	Pet       Pet        `gorm:"foreignKey:PetID" json:"pet"`
	UserID    uint       `json:"user_id"`
	User      User       `gorm:"foreignKey:UserID" json:"user"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Address   string     `json:"address"`
	Reason    string     `json:"reason"`
	Status    string     `gorm:"default:'pending'" json:"status"`
	Remark    string     `json:"remark"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `sql:"index" json:"-"`
}
