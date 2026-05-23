package model

import "time"

type Device struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	IP          string     `gorm:"index;not null" json:"ip"`
	MAC         string     `gorm:"index;not null" json:"mac"`
	Vendor      string     `json:"vendor"`
	Hostname    string     `json:"hostname"`
	Name        string     `json:"name"`
	Note        string     `json:"note"`
	Status      string     `gorm:"index;not null;default:online" json:"status"`
	FirstSeenAt time.Time  `json:"firstSeenAt"`
	LastSeenAt  time.Time  `json:"lastSeenAt"`
}

func (Device) TableName() string {
	return "devices"
}

type ScanLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	DeviceID   uint      `gorm:"index;not null" json:"deviceId"`
	ScannedAt  time.Time `json:"scannedAt"`
	CIDR       string    `json:"cidr"`
}

func (ScanLog) TableName() string {
	return "scan_logs"
}

type OUI struct {
	Prefix string `gorm:"primaryKey" json:"prefix"`
	Vendor string `json:"vendor"`
}

func (OUI) TableName() string {
	return "ouis"
}
