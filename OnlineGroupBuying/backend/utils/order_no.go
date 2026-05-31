package utils

import (
	"fmt"
	"time"
)

func GenerateOrderNo(userID uint) string {
	now := time.Now()
	return fmt.Sprintf("GB%d%04d%02d%02d%02d%02d%02d%06d",
		userID,
		now.Year(), now.Month(), now.Day(),
		now.Hour(), now.Minute(), now.Second(),
		now.Nanosecond()%1000000)
}
