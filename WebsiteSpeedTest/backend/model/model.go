package model

import "time"

type SpeedTestResult struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	URL          string         `gorm:"index;not null" json:"url"`
	Region       string         `gorm:"index;not null" json:"region"`
	RegionName   string         `json:"regionName"`
	DNSLookup    int64          `json:"dnsLookup"`
	TCPConnect   int64          `json:"tcpConnect"`
	TLSHandshake int64          `json:"tlsHandshake"`
	TTFB         int64          `json:"ttfb"`
	ContentDL    int64          `json:"contentDownload"`
	DOMReady     int64          `json:"domReady"`
	LoadComplete int64          `json:"loadComplete"`
	TotalTime    int64          `json:"totalTime"`
	StatusCode   int            `json:"statusCode"`
	Error        string         `json:"error,omitempty"`
	CreatedAt    time.Time      `gorm:"index" json:"createdAt"`
}

type MonitorTask struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	URL       string         `gorm:"index;not null" json:"url"`
	Region    string         `gorm:"not null" json:"region"`
	RegionName string        `json:"regionName"`
	Interval  int            `json:"interval"`
	Enabled   bool           `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
}

type Region struct {
	Code string `json:"code"`
	Name string `json:"name"`
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
}
