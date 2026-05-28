package models

type Product struct {
	BaseModel
	ProductCode string  `gorm:"column:product_code;size:64;uniqueIndex;not null" json:"product_code"`
	Name        string  `gorm:"column:name;size:128;not null" json:"name"`
	Category    string  `gorm:"column:category;size:64;index;not null" json:"category"`
	Price       float64 `gorm:"column:price;type:decimal(10,2);not null" json:"price"`
	Cost        float64 `gorm:"column:cost;type:decimal(10,2);not null" json:"cost"`
	Spec        string  `gorm:"column:spec;size:128" json:"spec"`
	ImageURL    string  `gorm:"column:image_url;size:256" json:"image_url"`
	Status      int8    `gorm:"column:status;default:1;index" json:"status"`
}

func (Product) TableName() string {
	return "products"
}

type ProductQuery struct {
	Page     int    `form:"page" json:"page"`
	PageSize int    `form:"page_size" json:"page_size"`
	Keyword  string `form:"keyword" json:"keyword"`
	Category string `form:"category" json:"category"`
	Status   *int8  `form:"status" json:"status"`
}

type ProductCreate struct {
	ProductCode string  `json:"product_code" binding:"required"`
	Name        string  `json:"name" binding:"required"`
	Category    string  `json:"category" binding:"required"`
	Price       float64 `json:"price" binding:"required,min=0"`
	Cost        float64 `json:"cost" binding:"required,min=0"`
	Spec        string  `json:"spec"`
	ImageURL    string  `json:"image_url"`
	Status      int8    `json:"status"`
}

type ProductUpdate struct {
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Price    float64 `json:"price" binding:"omitempty,min=0"`
	Cost     float64 `json:"cost" binding:"omitempty,min=0"`
	Spec     string  `json:"spec"`
	ImageURL string  `json:"image_url"`
	Status   *int8   `json:"status"`
}
