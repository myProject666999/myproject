package utils

import (
	"chain-store-inspection/config"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

var allowedImageTypes = map[string]bool{
	"image/jpeg": true,
	"image/jpg":  true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

func UploadPhoto(c *gin.Context, formFieldName string) (string, int64, error) {
	file, header, err := c.Request.FormFile(formFieldName)
	if err != nil {
		return "", 0, errors.New("failed to get file from request")
	}
	defer file.Close()

	if header.Size > config.AppConfig.Upload.MaxSize {
		return "", 0, fmt.Errorf("file size exceeds maximum limit of %d MB", config.AppConfig.Upload.MaxSize/1024/1024)
	}

	buffer := make([]byte, 512)
	_, err = file.Read(buffer)
	if err != nil {
		return "", 0, errors.New("failed to read file header")
	}

	fileType := http.DetectContentType(buffer)
	if !allowedImageTypes[fileType] {
		return "", 0, errors.New("invalid file type, only images are allowed")
	}

	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		return "", 0, errors.New("failed to reset file pointer")
	}

	uploadDir := config.AppConfig.Upload.PhotoPath
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", 0, errors.New("failed to create upload directory")
	}

	now := time.Now()
	dateDir := now.Format("2006/01/02")
	fullDir := filepath.Join(uploadDir, dateDir)
	if err := os.MkdirAll(fullDir, 0755); err != nil {
		return "", 0, errors.New("failed to create date directory")
	}

	fileExt := filepath.Ext(header.Filename)
	fileExt = strings.ToLower(fileExt)

	hash := md5.New()
	hash.Write([]byte(header.Filename + now.String()))
	fileName := hex.EncodeToString(hash.Sum(nil)) + fileExt

	filePath := filepath.Join(fullDir, fileName)
	dst, err := os.Create(filePath)
	if err != nil {
		return "", 0, errors.New("failed to create destination file")
	}
	defer dst.Close()

	fileSize, err := io.Copy(dst, file)
	if err != nil {
		os.Remove(filePath)
		return "", 0, errors.New("failed to save file")
	}

	urlPath := filepath.ToSlash(filepath.Join("/uploads/photos", dateDir, fileName))
	return urlPath, fileSize, nil
}

func DeletePhoto(photoURL string) error {
	if photoURL == "" {
		return nil
	}

	relativePath := strings.TrimPrefix(photoURL, "/")
	fullPath := filepath.Join(".", relativePath)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil
	}

	return os.Remove(fullPath)
}

func GetPhotoFullPath(photoURL string) string {
	if photoURL == "" {
		return ""
	}
	relativePath := strings.TrimPrefix(photoURL, "/")
	return filepath.Join(".", relativePath)
}
