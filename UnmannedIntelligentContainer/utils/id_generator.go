package utils

import (
	"fmt"
	"strconv"
	"time"
)

func GenerateOrderNo() string {
	now := time.Now()
	return fmt.Sprintf("ORD%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func GenerateTaskNo() string {
	now := time.Now()
	return fmt.Sprintf("TASK%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func GenerateCheckNo() string {
	now := time.Now()
	return fmt.Sprintf("CHK%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func GenerateDamageNo() string {
	now := time.Now()
	return fmt.Sprintf("DMG%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func ParseUint(s string) uint64 {
	if s == "" {
		return 0
	}
	val, _ := strconv.ParseUint(s, 10, 64)
	return val
}

func ParseInt(s string) int {
	if s == "" {
		return 0
	}
	val, _ := strconv.Atoi(s)
	return val
}
