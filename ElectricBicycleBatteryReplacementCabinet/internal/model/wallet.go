package model

import (
	"time"
)

const (
	TransTypeRecharge = 1
	TransTypeConsume  = 2
	TransTypeRefund   = 3
)

type Wallet struct {
	ID            uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID        uint64    `gorm:"uniqueIndex" json:"user_id"`
	Balance       float64   `gorm:"type:decimal(10,2)" json:"balance"`
	FrozenAmount  float64   `gorm:"type:decimal(10,2)" json:"frozen_amount"`
	TotalRecharge float64   `gorm:"type:decimal(10,2)" json:"total_recharge"`
	TotalConsume  float64   `gorm:"type:decimal(10,2)" json:"total_consume"`
	Version       int       `gorm:"type:int unsigned" json:"version"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (Wallet) TableName() string {
	return "wallet"
}

type WalletTransaction struct {
	ID               uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	TransNo          string    `gorm:"size:64;uniqueIndex" json:"trans_no"`
	UserID           uint64    `gorm:"index:idx_user_time" json:"user_id"`
	WalletID         uint64    `json:"wallet_id"`
	Type             int       `gorm:"type:tinyint" json:"type"`
	Amount           float64   `gorm:"type:decimal(10,2)" json:"amount"`
	BalanceBefore    float64   `gorm:"type:decimal(10,2)" json:"balance_before"`
	BalanceAfter     float64   `gorm:"type:decimal(10,2)" json:"balance_after"`
	RelatedOrderNo   *string   `gorm:"size:64" json:"related_order_no"`
	IdempotentKey    string    `gorm:"size:128;uniqueIndex" json:"idempotent_key"`
	Remark           *string   `gorm:"size:256" json:"remark"`
	CreatedAt        time.Time `gorm:"index:idx_user_time" json:"created_at"`
}

func (WalletTransaction) TableName() string {
	return "wallet_transaction"
}

type WalletRechargeReq struct {
	UserID  uint64  `json:"user_id" binding:"required"`
	Amount  float64 `json:"amount" binding:"required,min=0.01"`
	PayType int     `json:"pay_type" binding:"required"`
}

type WalletRechargeResp struct {
	TransNo       string  `json:"trans_no"`
	Amount        float64 `json:"amount"`
	BalanceBefore float64 `json:"balance_before"`
	BalanceAfter  float64 `json:"balance_after"`
}

type WalletConsumeReq struct {
	UserID         uint64  `json:"user_id" binding:"required"`
	Amount         float64 `json:"amount" binding:"required,min=0.01"`
	RelatedOrderNo string  `json:"related_order_no"`
	Remark         string  `json:"remark"`
	IdempotentKey  string  `json:"idempotent_key" binding:"required"`
}

type TransactionListReq struct {
	Page      int       `form:"page,default=1"`
	PageSize  int       `form:"page_size,default=10"`
	UserID    *uint64   `form:"user_id"`
	Type      *int      `form:"type"`
	StartTime *time.Time `form:"start_time"`
	EndTime   *time.Time `form:"end_time"`
}
