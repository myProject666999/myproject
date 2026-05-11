package utils

import (
	"fmt"
	"time"
)

func GenerateOrderNo() string {
	now := time.Now()
	nanosecond := now.UnixNano()
	return fmt.Sprintf("ORD%s%09d", now.Format("20060102150405"), nanosecond%1000000000)
}
