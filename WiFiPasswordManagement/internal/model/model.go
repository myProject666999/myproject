package model

import "time"

type Network struct {
	ID           string    `json:"id"`
	SSID         string    `json:"ssid"`
	Security     string    `json:"security"`
	Password     string    `json:"password,omitempty"`
	Notes        string    `json:"notes"`
	Owner        string    `json:"owner"`
	ExpiresAt    *string   `json:"expiresAt"`
	Expired      bool      `json:"expired"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Share struct {
	ID          string     `json:"id"`
	NetworkID   string     `json:"networkId"`
	Token       string     `json:"token"`
	ExpiresAt   *string    `json:"expiresAt"`
	VisitCount  int        `json:"visitCount"`
	CreatedAt   time.Time  `json:"createdAt"`
}
