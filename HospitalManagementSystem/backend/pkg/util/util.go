package util

import (
	"fmt"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 10)
	return string(bytes), err
}

func CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func GenerateNo(prefix string) string {
	now := time.Now()
	return fmt.Sprintf("%s%s%06d", prefix, now.Format("200601021504"), now.Unix()%1000000)
}

func GenerateMedicalRecordNo() string {
	now := time.Now()
	return fmt.Sprintf("MR%s%04d", now.Format("200601"), now.Unix()%10000)
}
