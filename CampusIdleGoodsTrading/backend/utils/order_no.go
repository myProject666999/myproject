package utils

import (
	"fmt"
	"math/rand"
	"time"
)

func GenerateOrderNo() string {
	now := time.Now()
	random := rand.Intn(1000000)
	return fmt.Sprintf("%s%06d", now.Format("20060102150405"), random)
}

func GeneratePaymentNo() string {
	now := time.Now()
	random := rand.Intn(1000000)
	return fmt.Sprintf("P%s%06d", now.Format("20060102150405"), random)
}
