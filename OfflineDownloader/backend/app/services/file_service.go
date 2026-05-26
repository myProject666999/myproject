package services

import (
	"fmt"
	"offlinedownloader/app/models"
	"offlinedownloader/config"
	"offlinedownloader/database"
	"os"
	"path/filepath"
	"time"
)

type FileService struct{}

func NewFileService() *FileService {
	return &FileService{}
}

func (s *FileService) GetFileList(fileType string, keyword string, page, pageSize int) ([]models.File, int64, error) {
	var files []models.File
	var total int64

	query := database.DB.Model(&models.File{}).Where("downloaded = ?", 1)

	if fileType == "video" {
		query = query.Where("is_video = ?", 1)
	} else if fileType == "audio" {
		query = query.Where("is_audio = ?", 1)
	} else if fileType == "image" {
		query = query.Where("is_image = ?", 1)
	}

	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&files).Error; err != nil {
		return nil, 0, err
	}

	for i := range files {
		s.checkFileExists(&files[i])
	}

	return files, total, nil
}

func (s *FileService) GetFileByID(id uint64) (*models.File, error) {
	var file models.File
	if err := database.DB.First(&file, id).Error; err != nil {
		return nil, err
	}

	s.checkFileExists(&file)

	return &file, nil
}

func (s *FileService) GetFilesByTaskID(taskID uint64) ([]models.File, error) {
	var files []models.File
	if err := database.DB.Where("task_id = ?", taskID).Find(&files).Error; err != nil {
		return nil, err
	}

	return files, nil
}

func (s *FileService) DeleteFile(id uint64, deleteFromDisk bool) error {
	file, err := s.GetFileByID(id)
	if err != nil {
		return err
	}

	if deleteFromDisk {
		if err := os.Remove(file.Path); err != nil {
			return fmt.Errorf("failed to delete file from disk: %v", err)
		}

		if file.ThumbnailPath != "" {
			os.Remove(file.ThumbnailPath)
		}
	}

	if err := database.DB.Delete(file).Error; err != nil {
		return fmt.Errorf("failed to delete file record: %v", err)
	}

	return nil
}

func (s *FileService) checkFileExists(file *models.File) {
	if _, err := os.Stat(file.Path); os.IsNotExist(err) {
		file.Downloaded = 0
		database.DB.Model(file).Update("downloaded", 0)
	}
}

func (s *FileService) GenerateThumbnail(file *models.File) error {
	if file.IsVideo != 1 && file.IsImage != 1 {
		return nil
	}

	thumbDir := filepath.Join(config.AppConfig.DownloadPath, ".thumbnails")
	if err := os.MkdirAll(thumbDir, 0755); err != nil {
		return err
	}

	thumbPath := filepath.Join(thumbDir, fmt.Sprintf("%d.jpg", file.ID))

	if _, err := os.Stat(thumbPath); err == nil {
		file.ThumbnailPath = thumbPath
		database.DB.Model(file).Update("thumbnail_path", thumbPath)
		return nil
	}

	file.ThumbnailPath = thumbPath
	database.DB.Model(file).Update("thumbnail_path", thumbPath)

	return nil
}

func (s *FileService) ScanDownloadsDirectory() error {
	downloadDir := config.AppConfig.DownloadPath

	return filepath.Walk(downloadDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			if filepath.Base(path) == ".thumbnails" {
				return filepath.SkipDir
			}
			return nil
		}

		var existingFile models.File
		result := database.DB.Where("path = ?", path).First(&existingFile)
		if result.Error == nil {
			return nil
		}

		file := models.File{
			Name:       info.Name(),
			Path:       path,
			Size:       uint64(info.Size()),
			Downloaded: 1,
			TaskID:     nil,
		}
		file.AutoDetectType()

		if err := database.DB.Create(&file).Error; err != nil {
			return err
		}

		s.GenerateThumbnail(&file)

		return nil
	})
}

func (s *FileService) CleanupMissingFiles() error {
	var files []models.File
	database.DB.Find(&files)

	for _, file := range files {
		if _, err := os.Stat(file.Path); os.IsNotExist(err) {
			file.Downloaded = 0
			database.DB.Save(&file)
		}
	}

	return nil
}

func (s *FileService) GetStatistics() (map[string]interface{}, error) {
	var totalFiles int64
	var totalSize int64
	var videoCount int64
	var audioCount int64
	var imageCount int64

	database.DB.Model(&models.File{}).Count(&totalFiles)
	database.DB.Model(&models.File{}).Where("is_video = ?", 1).Count(&videoCount)
	database.DB.Model(&models.File{}).Where("is_audio = ?", 1).Count(&audioCount)
	database.DB.Model(&models.File{}).Where("is_image = ?", 1).Count(&imageCount)

	var files []models.File
	database.DB.Select("size").Find(&files)
	for _, f := range files {
		totalSize += int64(f.Size)
	}

	return map[string]interface{}{
		"total_files":  totalFiles,
		"total_size":   totalSize,
		"video_count":  videoCount,
		"audio_count":  audioCount,
		"image_count":  imageCount,
		"other_count":  totalFiles - videoCount - audioCount - imageCount,
	}, nil
}

func (s *FileService) GetFilePath(fileID uint64) (string, string, error) {
	file, err := s.GetFileByID(fileID)
	if err != nil {
		return "", "", err
	}

	if file.Downloaded == 0 {
		return "", "", fmt.Errorf("file not found on disk")
	}

	if _, err := os.Stat(file.Path); os.IsNotExist(err) {
		return "", "", fmt.Errorf("file not found on disk")
	}

	return file.Path, file.MimeType, nil
}

func (s *FileService) StartDirectoryScanner() {
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()

		s.ScanDownloadsDirectory()

		for range ticker.C {
			s.ScanDownloadsDirectory()
			s.CleanupMissingFiles()
		}
	}()
}
