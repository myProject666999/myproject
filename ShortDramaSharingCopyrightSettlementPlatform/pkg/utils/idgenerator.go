package utils

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

func GenerateNo(prefix string) string {
	now := time.Now()
	timestamp := now.Format("20060102150405")
	uuidStr := strings.ReplaceAll(uuid.New().String(), "-", "")
	if len(uuidStr) > 8 {
		uuidStr = uuidStr[:8]
	}
	return fmt.Sprintf("%s%s%s", strings.ToUpper(prefix), timestamp, strings.ToUpper(uuidStr))
}

func GenerateIdempotentKey(keys ...string) string {
	return strings.Join(keys, "_")
}
