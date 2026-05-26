package utils

import (
	"fmt"
	"strconv"
	"strings"
)

func FormatFileSize(bytes uint64) string {
	if bytes == 0 {
		return "0 B"
	}

	units := []string{"B", "KB", "MB", "GB", "TB", "PB"}
	unitIndex := 0
	size := float64(bytes)

	for size >= 1024 && unitIndex < len(units)-1 {
		size /= 1024
		unitIndex++
	}

	return fmt.Sprintf("%.2f %s", size, units[unitIndex])
}

func FormatSpeed(bytesPerSec uint64) string {
	if bytesPerSec == 0 {
		return "0 B/s"
	}

	units := []string{"B/s", "KB/s", "MB/s", "GB/s"}
	unitIndex := 0
	speed := float64(bytesPerSec)

	for speed >= 1024 && unitIndex < len(units)-1 {
		speed /= 1024
		unitIndex++
	}

	return fmt.Sprintf("%.2f %s", speed, units[unitIndex])
}

func ParseUint64(str string, defaultValue uint64) uint64 {
	if str == "" {
		return defaultValue
	}
	value, err := strconv.ParseUint(str, 10, 64)
	if err != nil {
		return defaultValue
	}
	return value
}

func ParseInt(str string, defaultValue int) int {
	if str == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(str)
	if err != nil {
		return defaultValue
	}
	return value
}

func ParseInt8(str string, defaultValue int8) int8 {
	if str == "" {
		return defaultValue
	}
	value, err := strconv.ParseInt(str, 10, 8)
	if err != nil {
		return defaultValue
	}
	return int8(value)
}

func IsValidURL(url string) bool {
	if url == "" {
		return false
	}
	if strings.HasPrefix(url, "http://") || strings.HasPrefix(url, "https://") {
		return true
	}
	lowerURL := strings.ToLower(url)
	if strings.HasPrefix(lowerURL, "magnet:") {
		return true
	}
	if strings.HasPrefix(lowerURL, "ed2k://") {
		return true
	}
	return false
}

func GetPageInfo(pageStr string, pageSizeStr string) (int, int) {
	page := ParseInt(pageStr, 1)
	pageSize := ParseInt(pageSizeStr, 20)

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	return page, pageSize
}
