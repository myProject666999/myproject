package utils

import (
	"math"
	"math/rand"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateOrderNo() string {
	timestamp := time.Now().Format("20060102150405")
	random := randomString(6)
	return "ORD" + timestamp + random
}

func GenerateSignCode() string {
	rand.New(rand.NewSource(time.Now().UnixNano()))
	code := ""
	for i := 0; i < 6; i++ {
		code += string(rune(rand.Intn(10) + '0'))
	}
	return code
}

func randomString(n int) string {
	const letterBytes = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	radLat1 := math.Pi / 180 * lat1
	radLat2 := math.Pi / 180 * lat2
	a := radLat1 - radLat2
	b := math.Pi / 180 * (lng1 - lng2)
	s := 2 * math.Asin(math.Sqrt(math.Pow(math.Sin(a/2), 2)+
		math.Cos(radLat1)*math.Cos(radLat2)*math.Pow(math.Sin(b/2), 2)))
	s = s * 6378.137
	s = math.Round(s*10000) / 10000
	return s
}

func CalculateEstimatedTime(distance float64) int {
	avgSpeed := 15.0
	estimatedTime := int(math.Ceil(distance / avgSpeed * 60))
	if estimatedTime < 15 {
		estimatedTime = 15
	}
	return estimatedTime
}

func IsPeakTime() bool {
	now := time.Now()
	hour := now.Hour()
	return (hour >= 7 && hour <= 9) || (hour >= 11 && hour <= 13) || (hour >= 17 && hour <= 19)
}

func IsNightTime() bool {
	now := time.Now()
	hour := now.Hour()
	return hour >= 22 || hour < 6
}
