package handler

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type MediaReq struct {
	TaskID           uint64  `json:"task_id" binding:"required"`
	FileName         string  `json:"file_name" binding:"required"`
	FileType         int8    `json:"file_type"`
	MimeType         string  `json:"mime_type"`
	FileSize         uint64  `json:"file_size"`
	FileHash         string  `json:"file_hash"`
	Width            int     `json:"width"`
	Height           int     `json:"height"`
	Duration         float64 `json:"duration"`
	CaptureLng       *float64 `json:"capture_lng"`
	CaptureLat       *float64 `json:"capture_lat"`
	CaptureAltitude  float64 `json:"capture_altitude"`
	CaptureHeading   float64 `json:"capture_heading"`
	CaptureGimbalPitch float64 `json:"capture_gimbal_pitch"`
	CaptureTime      *string  `json:"capture_time"`
	RoutePointID     *uint64  `json:"route_point_id"`
	ChunkCount       int     `json:"chunk_count"`
}

func CreateMedia(c *gin.Context) {
	var req MediaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	storagePath := filepath.Join("uploads", "media", req.FileName)
	media := model.MediaFile{
		TaskID:             req.TaskID,
		FileName:           req.FileName,
		FileType:           req.FileType,
		MimeType:           req.MimeType,
		FileSize:           req.FileSize,
		StoragePath:        storagePath,
		FileHash:           req.FileHash,
		Width:              req.Width,
		Height:             req.Height,
		Duration:           req.Duration,
		CaptureLng:         req.CaptureLng,
		CaptureLat:         req.CaptureLat,
		CaptureAltitude:    req.CaptureAltitude,
		CaptureHeading:     req.CaptureHeading,
		CaptureGimbalPitch: req.CaptureGimbalPitch,
		RoutePointID:       req.RoutePointID,
		UploadStatus:       0,
		ChunkCount:         req.ChunkCount,
	}
	if req.CaptureTime != nil {
		t, err := time.Parse("2006-01-02 15:04:05", *req.CaptureTime)
		if err == nil {
			media.CaptureTime = &t
		}
	}
	if err := database.DB.Create(&media).Error; err != nil {
		utils.Fail(c, 500, "failed to create media")
		return
	}
	utils.Success(c, media)
}

func GetMedia(c *gin.Context) {
	id := c.Param("id")
	var media model.MediaFile
	if err := database.DB.First(&media, id).Error; err != nil {
		utils.Fail(c, 404, "media not found")
		return
	}
	utils.Success(c, media)
}

func UpdateMedia(c *gin.Context) {
	id := c.Param("id")
	var media model.MediaFile
	if err := database.DB.First(&media, id).Error; err != nil {
		utils.Fail(c, 404, "media not found")
		return
	}
	var req MediaReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&media).Updates(map[string]interface{}{
		"file_name":            req.FileName,
		"file_type":            req.FileType,
		"mime_type":            req.MimeType,
		"file_hash":            req.FileHash,
		"width":                req.Width,
		"height":               req.Height,
		"duration":             req.Duration,
		"capture_altitude":     req.CaptureAltitude,
		"capture_heading":      req.CaptureHeading,
		"capture_gimbal_pitch": req.CaptureGimbalPitch,
	})
	utils.Success(c, media)
}

func DeleteMedia(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.MediaFile{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete media")
		return
	}
	utils.Success(c, nil)
}

func ListMedia(c *gin.Context) {
	var mediaList []model.MediaFile
	query := database.DB.Model(&model.MediaFile{})
	if taskID := c.Query("task_id"); taskID != "" {
		query = query.Where("task_id = ?", taskID)
	}
	if fileType := c.Query("file_type"); fileType != "" {
		query = query.Where("file_type = ?", fileType)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at DESC").Find(&mediaList)
	utils.Success(c, gin.H{"total": total, "list": mediaList})
}

type InitUploadReq struct {
	FileName   string `json:"file_name" binding:"required"`
	FileSize   uint64 `json:"file_size" binding:"required"`
	ChunkCount int    `json:"chunk_count" binding:"required"`
	FileHash   string `json:"file_hash"`
}

func InitChunkUpload(c *gin.Context) {
	var req InitUploadReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	uploadID := uuid.New().String()
	media := model.MediaFile{
		TaskID:       0,
		FileName:     req.FileName,
		FileSize:     req.FileSize,
		StoragePath:  filepath.Join("uploads", "media", req.FileName),
		FileHash:     req.FileHash,
		UploadStatus: 0,
		ChunkCount:   req.ChunkCount,
		UploadedChunks: "",
	}
	if err := database.DB.Create(&media).Error; err != nil {
		utils.Fail(c, 500, "failed to init upload")
		return
	}
	utils.Success(c, gin.H{
		"upload_id": uploadID,
		"media_id":  media.ID,
	})
}

func UploadChunk(c *gin.Context) {
	uploadID := c.PostForm("upload_id")
	chunkIndexStr := c.PostForm("chunk_index")
	chunkIndex, _ := strconv.Atoi(chunkIndexStr)
	file, header, err := c.Request.FormFile("chunk")
	if err != nil {
		utils.Fail(c, 400, "failed to read chunk")
		return
	}
	defer file.Close()
	chunkDir := filepath.Join("uploads", "chunks", uploadID)
	os.MkdirAll(chunkDir, 0755)
	chunkPath := filepath.Join(chunkDir, fmt.Sprintf("%d", chunkIndex))
	dst, err := os.Create(chunkPath)
	if err != nil {
		utils.Fail(c, 500, "failed to save chunk")
		return
	}
	defer dst.Close()
	chunkSize, _ := io.Copy(dst, file)
	chunk := model.UploadChunk{
		UploadID:    uploadID,
		FileName:    header.Filename,
		ChunkIndex:  uint(chunkIndex),
		ChunkSize:   uint64(chunkSize),
		StoragePath: chunkPath,
	}
	database.DB.Create(&chunk)
	utils.Success(c, gin.H{
		"upload_id":   uploadID,
		"chunk_index": chunkIndex,
	})
}

func MergeChunks(c *gin.Context) {
	var req struct {
		UploadID string `json:"upload_id" binding:"required"`
		MediaID  uint64 `json:"media_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	var chunks []model.UploadChunk
	database.DB.Where("upload_id = ?", req.UploadID).Order("chunk_index ASC").Find(&chunks)
	var media model.MediaFile
	if err := database.DB.First(&media, req.MediaID).Error; err != nil {
		utils.Fail(c, 404, "media not found")
		return
	}
	mediaDir := filepath.Join("uploads", "media")
	os.MkdirAll(mediaDir, 0755)
	dstPath := filepath.Join(mediaDir, media.FileName)
	dst, err := os.Create(dstPath)
	if err != nil {
		utils.Fail(c, 500, "failed to create merged file")
		return
	}
	defer dst.Close()
	for _, ch := range chunks {
		f, err := os.Open(ch.StoragePath)
		if err != nil {
			utils.Fail(c, 500, "failed to open chunk")
			return
		}
		io.Copy(dst, f)
		f.Close()
		os.Remove(ch.StoragePath)
	}
	chunkDir := filepath.Join("uploads", "chunks", req.UploadID)
	os.RemoveAll(chunkDir)
	database.DB.Where("upload_id = ?", req.UploadID).Delete(&model.UploadChunk{})
	now := time.Now()
	database.DB.Model(&media).Updates(map[string]interface{}{
		"upload_status":  1,
		"storage_path":   dstPath,
		"archived_at":    now,
	})
	utils.Success(c, media)
}

func CompleteUpload(c *gin.Context) {
	id := c.Param("id")
	mediaID, _ := strconv.ParseUint(id, 10, 64)
	var media model.MediaFile
	if err := database.DB.First(&media, mediaID).Error; err != nil {
		utils.Fail(c, 404, "media not found")
		return
	}
	now := time.Now()
	database.DB.Model(&media).Updates(map[string]interface{}{
		"upload_status": 1,
		"archived_at":   now,
	})
	utils.Success(c, media)
}
