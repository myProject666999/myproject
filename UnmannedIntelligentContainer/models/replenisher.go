package models

type Replenisher struct {
	BaseModel
	EmployeeNo string `gorm:"column:employee_no;size:64;uniqueIndex;not null" json:"employee_no"`
	Name       string `gorm:"column:name;size:64;not null" json:"name"`
	Phone      string `gorm:"column:phone;size:32;not null" json:"phone"`
	Area       string `gorm:"column:area;size:64;index" json:"area"`
	Status     int8   `gorm:"column:status;default:1" json:"status"`
}

func (Replenisher) TableName() string {
	return "replenishers"
}

type ReplenisherQuery struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Keyword  string `form:"keyword" json:"keyword"`
	Area     string `form:"area" json:"area"`
	Status   *int8  `form:"status" json:"status"`
}

type ReplenisherCreate struct {
	EmployeeNo string `json:"employee_no" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Phone      string `json:"phone" binding:"required"`
	Area       string `json:"area"`
	Status     int8   `json:"status"`
}

type ReplenisherUpdate struct {
	Name   string `json:"name"`
	Phone  string `json:"phone"`
	Area   string `json:"area"`
	Status *int8  `json:"status"`
}
