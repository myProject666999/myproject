package services

import (
	"io"
	"mime/multipart"
	"time"

	"mooc-platform/models"

	"gorm.io/gorm"
)

type VideoService struct {
	DB *gorm.DB
}

func NewVideoService(db *gorm.DB) *VideoService {
	return &VideoService{DB: db}
}

func (s *VideoService) Upload(userID, courseID, chapterID uint64, title string, file io.Reader, header *multipart.FileHeader) (*models.Video, error) {
	now := time.Now()
	video := models.Video{
		FileName:   header.Filename,
		FileSize:   uint64(header.Size),
		StorageKey: "uploads/" + header.Filename,
		Format:     "mp4",
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := s.DB.Create(&video).Error; err != nil {
		return nil, err
	}
	return &video, nil
}

func (s *VideoService) GetByID(id uint64) (*models.Video, error) {
	var video models.Video
	err := s.DB.First(&video, id).Error
	if err != nil {
		return nil, err
	}
	return &video, nil
}

func (s *VideoService) InitChunkUpload(userID, courseID, chapterID uint64, title, filename string, totalSize, chunkSize int64, totalChunk int) (string, error) {
	return "upload_" + time.Now().Format("20060102150405"), nil
}

func (s *VideoService) UploadChunk(uploadID string, chunkIndex int, file io.Reader) error {
	return nil
}

func (s *VideoService) CompleteChunkUpload(uploadID string) (*models.Video, error) {
	now := time.Now()
	video := models.Video{
		FileName:   uploadID,
		StorageKey: "uploads/" + uploadID,
		Format:     "mp4",
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := s.DB.Create(&video).Error; err != nil {
		return nil, err
	}
	return &video, nil
}

func (s *VideoService) GetPlaySign(videoID, userID uint64) (map[string]interface{}, error) {
	var video models.Video
	if err := s.DB.First(&video, videoID).Error; err != nil {
		return nil, err
	}

	token := "play_" + time.Now().Format("20060102150405")
	expireAt := time.Now().Add(2 * time.Hour)

	vt := models.VideoToken{
		VideoID:   videoID,
		UserID:    userID,
		Token:     token,
		ExpireAt:  expireAt,
		CreatedAt: time.Now(),
	}
	s.DB.Create(&vt)

	return map[string]interface{}{
		"play_url":   video.CdnURL,
		"token":      token,
		"expire_at":  expireAt,
		"video_id":   videoID,
	}, nil
}
