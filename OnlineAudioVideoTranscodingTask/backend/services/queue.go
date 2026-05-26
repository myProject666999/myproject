package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"transcoding-service/models"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

const (
	TaskQueueKey   = "transcoding:task:queue"
	TaskLockPrefix = "transcoding:task:lock:"
	WorkerCount    = 3
)

type QueueService struct {
	db      *gorm.DB
	rdb     *redis.Client
	ffmpeg  *FFmpegService
	output  string
}

func NewQueueService(db *gorm.DB, rdb *redis.Client, ffmpeg *FFmpegService, outputDir string) *QueueService {
	return &QueueService{
		db:     db,
		rdb:    rdb,
		ffmpeg: ffmpeg,
		output: outputDir,
	}
}

func (q *QueueService) Enqueue(ctx context.Context, taskID uint64) error {
	payload, _ := json.Marshal(map[string]uint64{"task_id": taskID})
	return q.rdb.LPush(ctx, TaskQueueKey, payload).Err()
}

func (q *QueueService) StartWorkers(ctx context.Context) {
	for i := 0; i < WorkerCount; i++ {
		go q.worker(ctx, i)
	}
	log.Printf("已启动 %d 个转码工作协程", WorkerCount)
}

func (q *QueueService) worker(ctx context.Context, id int) {
	log.Printf("工作协程 #%d 启动", id)
	for {
		select {
		case <-ctx.Done():
			return
		default:
		}

		result, err := q.rdb.BRPop(ctx, 0, TaskQueueKey).Result()
		if err != nil {
			if err != redis.Nil {
				log.Printf("工作协程 #%d 从队列读取失败: %v", id, err)
			}
			continue
		}

		if len(result) < 2 {
			continue
		}

		var payload map[string]uint64
		if err := json.Unmarshal([]byte(result[1]), &payload); err != nil {
			log.Printf("工作协程 #%d 解析任务数据失败: %v", id, err)
			continue
		}

		taskID := payload["task_id"]
		q.processTask(ctx, id, taskID)
	}
}

func (q *QueueService) processTask(ctx context.Context, workerID int, taskID uint64) {
	log.Printf("工作协程 #%d 开始处理任务 #%d", workerID, taskID)

	var task models.Task
	if err := q.db.First(&task, taskID).Error; err != nil {
		log.Printf("任务 #%d 未找到: %v", taskID, err)
		return
	}

	if task.Status == models.StatusCompleted {
		log.Printf("任务 #%d 已完成，跳过", taskID)
		return
	}

	if task.RetryCount >= task.MaxRetries {
		log.Printf("任务 #%d 已达最大重试次数，标记为失败", taskID)
		q.db.Model(&task).Updates(map[string]interface{}{
			"status":        models.StatusFailed,
			"error_message": "超过最大重试次数",
		})
		return
	}

	q.db.Model(&task).Updates(map[string]interface{}{
		"status":      models.StatusProcessing,
		"progress":    0,
		"retry_count": task.RetryCount + 1,
	})

	outputPath := fmt.Sprintf("%s/%d.%s", q.output, task.ID, task.OutputFormat)

	err := q.ffmpeg.Transcode(&task, outputPath, func(progress int) {
		q.db.Model(&task).Update("progress", progress)
	})

	if err != nil {
		log.Printf("任务 #%d 转码失败: %v", taskID, err)
		q.db.Model(&task).Updates(map[string]interface{}{
			"status":        models.StatusFailed,
			"error_message": err.Error(),
		})

		if task.RetryCount < task.MaxRetries {
			log.Printf("任务 #%d 重新入队 (重试 %d/%d)", taskID, task.RetryCount, task.MaxRetries)
			q.Enqueue(context.Background(), taskID)
		}
		return
	}

	fileInfo, _ := GetFileInfo(outputPath)
	q.db.Model(&task).Updates(map[string]interface{}{
		"status":      models.StatusCompleted,
		"progress":    100,
		"output_path": outputPath,
		"output_size": uint64(fileInfo.Size),
	})

	log.Printf("任务 #%d 转码完成", taskID)
}

type FileInfo struct {
	Size int64
	Name string
}

func GetFileInfo(path string) (FileInfo, error) {
	info := FileInfo{}
	stat, err := os.Stat(path)
	if err != nil {
		return info, err
	}
	info.Size = stat.Size()
	info.Name = stat.Name()
	return info, nil
}
