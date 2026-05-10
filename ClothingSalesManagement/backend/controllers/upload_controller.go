package controllers

import (
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type UploadController struct{}

func NewUploadController() *UploadController {
	return &UploadController{}
}

func (uc *UploadController) UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		utils.BadRequest(c, "请选择文件")
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	if !allowExts[ext] {
		utils.BadRequest(c, "不支持的文件格式，仅支持jpg、jpeg、png、gif、webp")
		return
	}

	fileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join("uploads", fileName)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		utils.InternalError(c, "上传失败")
		return
	}

	url := "/uploads/" + fileName
	utils.Success(c, gin.H{
		"url":  url,
		"name": file.Filename,
	})
}
