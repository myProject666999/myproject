package utils

import (
	"battery-cabinet/internal/pkg/database"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

const (
	IdempotentStatusProcessing = 1
	IdempotentStatusSuccess    = 2
	IdempotentStatusFailed     = 3
)

type IdempotentRecord struct {
	ID             uint64    `gorm:"primaryKey;autoIncrement" json:"id"`
	IdempotentKey  string    `gorm:"size:128;uniqueIndex" json:"idempotent_key"`
	BizType        string    `gorm:"size:32" json:"biz_type"`
	BizID          string    `gorm:"size:64" json:"biz_id"`
	Status         int       `gorm:"type:tinyint;default:1" json:"status"`
	RequestData    string    `gorm:"type:text" json:"request_data"`
	ResponseData   string    `gorm:"type:text" json:"response_data"`
	ExpireAt       time.Time `json:"expire_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (IdempotentRecord) TableName() string {
	return "idempotent_record"
}

func GenerateIdempotentKey(bizType string, params ...interface{}) string {
	data := fmt.Sprintf("%s:%v", bizType, params)
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

func CheckIdempotent(key, bizType string, requestData interface{}) (*IdempotentRecord, error) {
	var record IdempotentRecord
	err := database.DB.Where("idempotent_key = ?", key).First(&record).Error
	if err == nil {
		if record.Status == IdempotentStatusProcessing {
			return nil, errors.New("request is processing, please try again later")
		}
		return &record, nil
	}

	reqData, _ := json.Marshal(requestData)
	record = IdempotentRecord{
		IdempotentKey: key,
		BizType:       bizType,
		Status:        IdempotentStatusProcessing,
		RequestData:   string(reqData),
		ExpireAt:      time.Now().Add(24 * time.Hour),
	}

	err = database.DB.Create(&record).Error
	if err != nil {
		var existing IdempotentRecord
		if err2 := database.DB.Where("idempotent_key = ?", key).First(&existing).Error; err2 == nil {
			if existing.Status == IdempotentStatusProcessing {
				return nil, errors.New("request is processing, please try again later")
			}
			return &existing, nil
		}
		return nil, err
	}

	return nil, nil
}

func SetIdempotentSuccess(key string, bizID string, responseData interface{}) error {
	respData, _ := json.Marshal(responseData)
	return database.DB.Model(&IdempotentRecord{}).
		Where("idempotent_key = ?", key).
		Updates(map[string]interface{}{
			"status":        IdempotentStatusSuccess,
			"biz_id":        bizID,
			"response_data": string(respData),
		}).Error
}

func SetIdempotentFailed(key string, errMsg string) error {
	return database.DB.Model(&IdempotentRecord{}).
		Where("idempotent_key = ?", key).
		Updates(map[string]interface{}{
			"status":        IdempotentStatusFailed,
			"response_data": errMsg,
		}).Error
}

func GenerateOrderNo(prefix string) string {
	now := time.Now()
	return fmt.Sprintf("%s%s%06d", prefix, now.Format("20060102150405"), now.Nanosecond()/1000%1000000)
}
