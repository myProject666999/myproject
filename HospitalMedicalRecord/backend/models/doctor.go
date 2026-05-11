package models

import "time"

type Doctor struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     *uint     `json:"user_id"`
	EmployeeNo string    `gorm:"uniqueIndex;size:50;not null" json:"employee_no" binding:"required"`
	Department string    `gorm:"size:50;not null" json:"department" binding:"required"`
	Title      string    `gorm:"size:50" json:"title"`
	Specialty  string    `gorm:"size:100" json:"specialty"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	User       *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (Doctor) TableName() string {
	return "doctors"
}
