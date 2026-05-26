package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var allowedExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".gif":  true,
	".webp": true,
}

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Allowed types: jpg, jpeg, png, gif, webp"})
		return
	}

	maxSize := int64(10 * 1024 * 1024)
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum size is 10MB"})
		return
	}

	fileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	savePath := filepath.Join("uploads", fileName)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
		return
	}

	imageURL := fmt.Sprintf("/uploads/%s", fileName)

	c.JSON(http.StatusOK, gin.H{
		"code": 0,
		"data": gin.H{
			"url":      imageURL,
			"filename": fileName,
		},
	})
}
