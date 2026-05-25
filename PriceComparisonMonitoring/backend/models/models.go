package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	Username  string         `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	Email     string         `gorm:"size:100" json:"email"`
	Phone     string         `gorm:"size:20" json:"phone"`
	Avatar    string         `gorm:"size:255" json:"avatar"`
	Status    int8           `gorm:"default:1;not null" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (User) TableName() string {
	return "users"
}

type ProductGroup struct {
	ID          uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint64         `gorm:"index;not null" json:"user_id"`
	Name        string         `gorm:"size:50;not null" json:"name"`
	Description string         `gorm:"size:255" json:"description"`
	Icon        string         `gorm:"size:50" json:"icon"`
	Sort        int            `gorm:"default:0;not null" json:"sort"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ProductGroup) TableName() string {
	return "product_groups"
}

type Product struct {
	ID             uint64         `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint64         `gorm:"index;not null" json:"user_id"`
	GroupID        *uint64        `gorm:"index" json:"group_id"`
	Title          string         `gorm:"size:255;not null" json:"title"`
	ProductURL     string         `gorm:"size:500;not null" json:"product_url"`
	Platform       string         `gorm:"size:50" json:"platform"`
	ImageURL       string         `gorm:"size:500" json:"image_url"`
	CurrentPrice   *float64       `gorm:"type:decimal(10,2)" json:"current_price"`
	OriginalPrice  *float64       `gorm:"type:decimal(10,2)" json:"original_price"`
	LowestPrice    *float64       `gorm:"type:decimal(10,2)" json:"lowest_price"`
	HighestPrice   *float64       `gorm:"type:decimal(10,2)" json:"highest_price"`
	Currency       string         `gorm:"size:10;default:CNY;not null" json:"currency"`
	Status         int8           `gorm:"default:1;not null" json:"status"`
	IsFavorite     int8           `gorm:"default:0;not null" json:"is_favorite"`
	CrawlInterval  int            `gorm:"default:3600;not null" json:"crawl_interval"`
	LastCrawlAt    *time.Time     `json:"last_crawl_at"`
	NextCrawlAt    *time.Time     `gorm:"index" json:"next_crawl_at"`
	Remark         string         `gorm:"size:500" json:"remark"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
	PriceHistories []PriceHistory `gorm:"foreignKey:ProductID" json:"price_histories,omitempty"`
}

func (Product) TableName() string {
	return "products"
}

type PriceHistory struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID     uint64    `gorm:"index;not null" json:"product_id"`
	Price         float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	OriginalPrice *float64  `gorm:"type:decimal(10,2)" json:"original_price"`
	Discount      *float64  `gorm:"type:decimal(5,2)" json:"discount"`
	StockStatus   string    `gorm:"size:20" json:"stock_status"`
	CrawledAt     time.Time `gorm:"index;not null;default:CURRENT_TIMESTAMP" json:"crawled_at"`
	Source        string    `gorm:"size:20;default:auto" json:"source"`
}

func (PriceHistory) TableName() string {
	return "price_history"
}

type AlertSetting struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID           uint64    `gorm:"index;not null" json:"user_id"`
	ProductID        uint64    `gorm:"index;not null" json:"product_id"`
	AlertType        string    `gorm:"size:20;not null" json:"alert_type"`
	ThresholdPrice   *float64  `gorm:"type:decimal(10,2)" json:"threshold_price"`
	ThresholdPercent *float64  `gorm:"type:decimal(5,2)" json:"threshold_percent"`
	NotifyEmail      int8      `gorm:"default:1;not null" json:"notify_email"`
	NotifySMS        int8      `gorm:"default:0;not null" json:"notify_sms"`
	NotifyWechat     int8      `gorm:"default:0;not null" json:"notify_wechat"`
	NotifyWebpush    int8      `gorm:"default:1;not null" json:"notify_webpush"`
	Status           int8      `gorm:"default:1;not null" json:"status"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (AlertSetting) TableName() string {
	return "alert_settings"
}

type AlertLog struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID         uint64    `gorm:"index;not null" json:"user_id"`
	ProductID      uint64    `gorm:"index;not null" json:"product_id"`
	AlertType      string    `gorm:"size:20;not null" json:"alert_type"`
	OldPrice       *float64  `gorm:"type:decimal(10,2)" json:"old_price"`
	NewPrice       *float64  `gorm:"type:decimal(10,2)" json:"new_price"`
	ChangeAmount   *float64  `gorm:"type:decimal(10,2)" json:"change_amount"`
	ChangePercent  *float64  `gorm:"type:decimal(5,2)" json:"change_percent"`
	Message        string    `gorm:"size:500" json:"message"`
	NotifyChannels string    `gorm:"size:100" json:"notify_channels"`
	IsRead         int8      `gorm:"default:0;index;not null" json:"is_read"`
	CreatedAt      time.Time `gorm:"index;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (AlertLog) TableName() string {
	return "alert_logs"
}

type CrawlLog struct {
	ID           uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	ProductID    uint64    `gorm:"index;not null" json:"product_id"`
	Status       string    `gorm:"size:20;index;not null" json:"status"`
	ResponseCode *int      `json:"response_code"`
	ResponseTime *int      `json:"response_time"`
	ErrorMessage string    `gorm:"size:500" json:"error_message"`
	UserAgent    string    `gorm:"size:255" json:"user_agent"`
	ProxyUsed    string    `gorm:"size:100" json:"proxy_used"`
	CreatedAt    time.Time `gorm:"index;not null;default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (CrawlLog) TableName() string {
	return "crawl_logs"
}

type AntiCrawlConfig struct {
	ID              uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	Platform        string    `gorm:"size:50;uniqueIndex;not null" json:"platform"`
	BaseURL         string    `gorm:"size:255;not null" json:"base_url"`
	MinInterval     int       `gorm:"default:5;not null" json:"min_interval"`
	MaxInterval     int       `gorm:"default:60;not null" json:"max_interval"`
	RetryCount      int       `gorm:"default:3;not null" json:"retry_count"`
	RetryDelay      int       `gorm:"default:10;not null" json:"retry_delay"`
	Timeout         int       `gorm:"default:30;not null" json:"timeout"`
	UserAgents      string    `gorm:"type:text" json:"user_agents"`
	Proxies         string    `gorm:"type:text" json:"proxies"`
	CookieStrategy  string    `gorm:"size:20;default:random" json:"cookie_strategy"`
	Cookies         string    `gorm:"type:text" json:"cookies"`
	Headers         string    `gorm:"type:text" json:"headers"`
	JsRender        int8      `gorm:"default:0;not null" json:"js_render"`
	Status          int8      `gorm:"default:1;not null" json:"status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (AntiCrawlConfig) TableName() string {
	return "anti_crawl_config"
}
