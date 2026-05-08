package handlers

import (
	"fmt"
	"net/http"
	"path/filepath"
	"time"

	"campus-volunteer-system/config"

	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	cfg, _ := config.LoadConfig()
	
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "请选择要上传的文件",
		})
		return
	}

	ext := filepath.Ext(file.Filename)
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "不支持的文件格式，仅支持 jpg、jpeg、png、gif、webp",
		})
		return
	}

	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filepath := filepath.Join(cfg.UploadDir, filename)

	if err := c.SaveUploadedFile(file, filepath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "文件保存失败",
		})
		return
	}

	url := fmt.Sprintf("/uploads/%s", filename)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "上传成功",
		"data": gin.H{
			"url":  url,
			"name": filename,
		},
	})
}
