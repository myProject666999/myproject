package models

type Container struct {
	BaseModel
	ContainerNo string  `gorm:"column:container_no;size:64;uniqueIndex;not null" json:"container_no"`
	Name        string  `gorm:"column:name;size:128;not null" json:"name"`
	Address     string  `gorm:"column:address;size:256;not null" json:"address"`
	Longitude   float64 `gorm:"column:longitude;type:decimal(10,6);not null" json:"longitude"`
	Latitude    float64 `gorm:"column:latitude;type:decimal(10,6);not null" json:"latitude"`
	Area        string  `gorm:"column:area;size:64;index;not null" json:"area"`
	Status      int8    `gorm:"column:status;default:1;index" json:"status"`
	Capacity    int     `gorm:"column:capacity;default:100" json:"capacity"`
}

func (Container) TableName() string {
	return "containers"
}

type ContainerQuery struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Keyword  string `form:"keyword" json:"keyword"`
	Area     string `form:"area" json:"area"`
	Status   *int8  `form:"status" json:"status"`
}

type ContainerCreate struct {
	ContainerNo string  `json:"container_no" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Address     string  `json:"address" binding:"required"`
	Longitude   float64 `json:"longitude" binding:"required"`
	Latitude    float64 `json:"latitude" binding:"required"`
	Area        string  `json:"area" binding:"required"`
	Status      int8    `json:"status"`
	Capacity    int     `json:"capacity"`
}

type ContainerUpdate struct {
	Name        string  `json:"name"`
	Address     string  `json:"address"`
	Longitude   float64 `json:"longitude"`
	Latitude    float64 `json:"latitude"`
	Area        string  `json:"area"`
	Status      *int8   `json:"status"`
	Capacity    int     `json:"capacity"`
}
