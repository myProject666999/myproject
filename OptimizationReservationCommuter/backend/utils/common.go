package utils

import (
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"math/rand"
	"shuttle-booking/database"
	"shuttle-booking/models"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

func GenerateNo(prefix string) string {
	uuidStr := uuid.New().String()
	return prefix + strings.ToUpper(uuidStr[:8])
}

func GenerateQRToken(reservationID int) string {
	hash := md5.New()
	hash.Write([]byte(fmt.Sprintf("%d-%s-%d", reservationID, time.Now().String(), rand.Intn(10000))))
	return hex.EncodeToString(hash.Sum(nil))
}

func GetSystemConfig(key string) (string, error) {
	var config models.SystemConfig
	result := database.DB.Where("config_key = ?", key).First(&config)
	if result.Error != nil {
		return "", result.Error
	}
	return config.ConfigValue, nil
}

func ParseInt(s string, defaultVal int) int {
	v, err := strconv.Atoi(s)
	if err != nil {
		return defaultVal
	}
	return v
}

func ParseFloat(s string, defaultVal float64) float64 {
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return defaultVal
	}
	return v
}
