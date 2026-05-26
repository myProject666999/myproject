package models

import (
	"time"
)

type CartItem struct {
	ID        uint64    `gorm:"column:id;primaryKey;autoIncrement" json:"id"`
	UserID    uint64    `gorm:"column:user_id;not null;index" json:"user_id"`
	ProductID uint64    `gorm:"column:product_id;not null;index" json:"product_id"`
	Quantity  float64   `gorm:"column:quantity;type:decimal(10,2);not null" json:"quantity"`
	Selected  bool      `gorm:"column:selected;default:true" json:"selected"`
	CreatedAt time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	Product   *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

func (CartItem) TableName() string {
	return "cart_items"
}

type CartAddRequest struct {
	ProductID uint64  `json:"product_id" validate:"required"`
	Quantity  float64 `json:"quantity" validate:"required,gt=0"`
}

type CartUpdateRequest struct {
	Quantity float64 `json:"quantity" validate:"required,gt=0"`
	Selected *bool   `json:"selected"`
}

type CartBatchUpdateRequest struct {
	Selected *bool `json:"selected"`
}

type CartItemResponse struct {
	ID        uint64         `json:"id"`
	ProductID uint64         `json:"product_id"`
	Quantity  float64        `json:"quantity"`
	Selected  bool           `json:"selected"`
	Product   *ProductSimple `json:"product"`
}

type ProductSimple struct {
	ID         uint64  `json:"id"`
	Name       string  `json:"name"`
	ImageURL   string  `json:"image_url"`
	PriceUnit  string  `json:"price_unit"`
	Price      float64 `json:"price"`
	UnitWeight float64 `json:"unit_weight"`
	Origin     string  `json:"origin"`
}

func (c *CartItem) ToResponse() *CartItemResponse {
	resp := &CartItemResponse{
		ID:        c.ID,
		ProductID: c.ProductID,
		Quantity:  c.Quantity,
		Selected:  c.Selected,
	}
	if c.Product != nil {
		resp.Product = &ProductSimple{
			ID:         c.Product.ID,
			Name:       c.Product.Name,
			ImageURL:   c.Product.ImageURL,
			PriceUnit:  c.Product.PriceUnit,
			Price:      c.Product.Price,
			UnitWeight: c.Product.UnitWeight,
			Origin:     c.Product.Origin,
		}
	}
	return resp
}
