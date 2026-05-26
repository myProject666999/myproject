package services

import (
	"fmt"
	"offlinedownloader/app/models"
	"offlinedownloader/config"
	"offlinedownloader/database"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

type DownloadService struct{}

func NewDownloadService() *DownloadService {
	return &DownloadService{}
}

func (s *DownloadService) AddDownload(url string, title string) (*models.DownloadTask, error) {
	if url == "" {
		return nil, fmt.Errorf("download URL cannot be empty")
	}

	taskType := models.TaskTypeHTTP
	infoHash := ""
	if IsMagnetLink(url) {
		taskType = models.TaskTypeMagnet
		infoHash = ParseInfoHash(url)
	} else if IsED2KLink(url) {
		taskType = models.TaskTypeED2K
		if title == "" {
			title = ParseED2KFileName(url)
		}
	}

	downloadDir := config.AppConfig.DownloadPath
	if err := os.MkdirAll(downloadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create download directory: %v", err)
	}

	options := map[string]interface{}{
		"dir": downloadDir,
	}

	gid, err := Aria2.AddURI(url, options)
	if err != nil {
		return nil, fmt.Errorf("failed to add download to aria2: %v", err)
	}

	if title == "" {
		title = fmt.Sprintf("下载任务 - %s", gid[:8])
	}

	task := &models.DownloadTask{
		TaskID:   gid,
		Title:    title,
		URL:      url,
		Type:     int8(taskType),
		Status:   models.TaskStatusWaiting,
		InfoHash: infoHash,
		SavePath: downloadDir,
	}

	if err := database.DB.Create(task).Error; err != nil {
		Aria2.ForceRemove(gid)
		return nil, fmt.Errorf("failed to save task to database: %v", err)
	}

	go s.UpdateTaskStatusPeriodically(task.ID)

	return task, nil
}

func (s *DownloadService) GetTaskList(status int8, page, pageSize int) ([]models.DownloadTask, int64, error) {
	var tasks []models.DownloadTask
	var total int64

	query := database.DB.Model(&models.DownloadTask{}).Where("status != ?", models.TaskStatusDeleted)

	if status >= 0 {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	for i := range tasks {
		s.updateTaskFromAria2(&tasks[i])
	}

	return tasks, total, nil
}

func (s *DownloadService) GetTaskByID(id uint64) (*models.DownloadTask, error) {
	var task models.DownloadTask
	if err := database.DB.First(&task, id).Error; err != nil {
		return nil, err
	}

	s.updateTaskFromAria2(&task)

	return &task, nil
}

func (s *DownloadService) PauseTask(id uint64) error {
	task, err := s.GetTaskByID(id)
	if err != nil {
		return err
	}

	if task.Status == models.TaskStatusDownloading || task.Status == models.TaskStatusWaiting {
		if err := Aria2.Pause(task.TaskID); err != nil {
			return fmt.Errorf("failed to pause task in aria2: %v", err)
		}

		task.Status = models.TaskStatusPaused
		database.DB.Save(task)
	}

	return nil
}

func (s *DownloadService) ResumeTask(id uint64) error {
	task, err := s.GetTaskByID(id)
	if err != nil {
		return err
	}

	if task.Status == models.TaskStatusPaused {
		if err := Aria2.Resume(task.TaskID); err != nil {
			return fmt.Errorf("failed to resume task in aria2: %v", err)
		}

		task.Status = models.TaskStatusWaiting
		database.DB.Save(task)
	}

	return nil
}

func (s *DownloadService) DeleteTask(id uint64, deleteFiles bool) error {
	task, err := s.GetTaskByID(id)
	if err != nil {
		return err
	}

	if task.Status == models.TaskStatusDownloading || task.Status == models.TaskStatusWaiting {
		if err := Aria2.ForceRemove(task.TaskID); err != nil {
			return fmt.Errorf("failed to remove task from aria2: %v", err)
		}
	}

	Aria2.RemoveDownloadResult(task.TaskID)

	if deleteFiles && task.SavePath != "" {
		fileService := NewFileService()
		files, err := fileService.GetFilesByTaskID(id)
		if err == nil {
			for _, file := range files {
				os.Remove(file.Path)
			}
		}
	}

	task.Status = models.TaskStatusDeleted
	database.DB.Save(task)

	database.DB.Where("task_id = ?", id).Delete(&models.File{})

	return nil
}

func (s *DownloadService) PauseAll() error {
	return Aria2.PauseAll()
}

func (s *DownloadService) ResumeAll() error {
	return Aria2.ResumeAll()
}

func (s *DownloadService) ClearCompleted() error {
	var tasks []models.DownloadTask
	database.DB.Where("status = ?", models.TaskStatusCompleted).Find(&tasks)

	for _, task := range tasks {
		Aria2.RemoveDownloadResult(task.TaskID)
	}

	return nil
}

func (s *DownloadService) updateTaskFromAria2(task *models.DownloadTask) {
	if task.Status == models.TaskStatusCompleted || task.Status == models.TaskStatusError || task.Status == models.TaskStatusDeleted {
		return
	}

	status, err := Aria2.TellStatus(task.TaskID)
	if err != nil {
		task.Status = models.TaskStatusError
		task.ErrorMessage = err.Error()
		database.DB.Save(task)
		return
	}

	var statusMap = map[string]int8{
		"active":   models.TaskStatusDownloading,
		"waiting":  models.TaskStatusWaiting,
		"paused":   models.TaskStatusPaused,
		"complete": models.TaskStatusCompleted,
		"error":    models.TaskStatusError,
		"removed":  models.TaskStatusDeleted,
	}

	if newStatus, ok := statusMap[status.Status]; ok {
		task.Status = newStatus
	}

	totalLength, _ := strconv.ParseUint(status.TotalLength, 10, 64)
	completedLength, _ := strconv.ParseUint(status.CompletedLength, 10, 64)
	downloadSpeed, _ := strconv.ParseUint(status.DownloadSpeed, 10, 64)

	task.TotalSize = totalLength
	task.DownloadedSize = completedLength
	task.Speed = downloadSpeed

	if totalLength > 0 {
		task.Progress = float64(completedLength) / float64(totalLength) * 100
	}

	task.FileCount = uint(status.GetFileCount())
	task.FileName = status.GetMainFileName()
	task.SavePath = status.Dir

	if status.InfoHash != "" {
		task.InfoHash = status.InfoHash
	}

	if status.ErrorMessage != "" {
		task.ErrorMessage = status.ErrorMessage
	}

	if task.Status == models.TaskStatusCompleted && task.CompletedAt == nil {
		now := time.Now()
		task.CompletedAt = &now
		go s.syncTaskFiles(task)
	}

	database.DB.Save(task)
}

func (s *DownloadService) syncTaskFiles(task *models.DownloadTask) {
	status, err := Aria2.TellStatus(task.TaskID)
	if err != nil {
		return
	}

	fileService := NewFileService()

	for _, aria2File := range status.Files {
		completed, _ := strconv.ParseUint(aria2File.CompletedLength, 10, 64)
		if completed == 0 {
			continue
		}

		size, _ := strconv.ParseUint(aria2File.Length, 10, 64)
		filePath := aria2File.Path
		fileName := filepath.Base(filePath)

		var existingFile models.File
		result := database.DB.Where("path = ?", filePath).First(&existingFile)

		taskID := task.ID
		file := models.File{
			TaskID:     &taskID,
			Name:       fileName,
			Path:       filePath,
			Size:       size,
			Downloaded: 1,
		}
		file.AutoDetectType()

		if result.Error != nil {
			database.DB.Create(&file)
		} else {
			file.ID = existingFile.ID
			database.DB.Save(&file)
		}

		fileService.GenerateThumbnail(&file)
	}
}

func (s *DownloadService) UpdateTaskStatusPeriodically(taskID uint64) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		task, err := s.GetTaskByID(taskID)
		if err != nil {
			return
		}

		if task.Status == models.TaskStatusCompleted || task.Status == models.TaskStatusError || task.Status == models.TaskStatusDeleted {
			return
		}
	}
}

func (s *DownloadService) RefreshAllTasks() {
	var tasks []models.DownloadTask
	database.DB.Where("status IN (0,1,2)").Find(&tasks)

	for _, task := range tasks {
		go s.updateTaskFromAria2(&task)
	}
}

func (s *DownloadService) StartStatusMonitor() {
	go func() {
		ticker := time.NewTicker(10 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			s.RefreshAllTasks()
		}
	}()
}
