package scheduler

import (
	"context"
	"fmt"
	"inspection-chatops/internal/model"
	"inspection-chatops/internal/repository"
	"inspection-chatops/pkg/logger"
	"inspection-chatops/pkg/redis"
	"net/http"
	"os/exec"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/robfig/cron/v3"
	"go.uber.org/zap"
)

type TaskScheduler struct {
	cron       *cron.Cron
	taskRepo   *repository.InspectionRepository
	resultRepo *repository.ResultRepository
	robotRepo  *repository.RobotRepository
	jobIDs     map[uint64]cron.EntryID
	mu         sync.Mutex
}

func NewTaskScheduler() *TaskScheduler {
	return &TaskScheduler{
		cron:       cron.New(cron.WithSeconds()),
		taskRepo:   repository.NewInspectionRepository(),
		resultRepo: repository.NewResultRepository(),
		robotRepo:  repository.NewRobotRepository(),
		jobIDs:     make(map[uint64]cron.EntryID),
	}
}

func (s *TaskScheduler) Start() {
	s.loadTasks()
	s.cron.Start()
	logger.Info("任务调度器已启动")
}

func (s *TaskScheduler) Stop() {
	s.cron.Stop()
	logger.Info("任务调度器已停止")
}

func (s *TaskScheduler) loadTasks() {
	tasks, err := s.taskRepo.GetAllEnabled()
	if err != nil {
		logger.Error("加载任务失败", zap.Error(err))
		return
	}

	for _, task := range tasks {
		s.addTask(&task)
	}
}

func (s *TaskScheduler) addTask(task *model.InspectionTask) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.jobIDs[task.ID]; exists {
		s.cron.Remove(s.jobIDs[task.ID])
	}

	jobID, err := s.cron.AddFunc(task.CronExpr, func() {
		s.executeTask(task)
	})

	if err != nil {
		logger.Error("添加任务失败", zap.Uint64("task_id", task.ID), zap.Error(err))
		return
	}

	s.jobIDs[task.ID] = jobID
	logger.Info("任务已添加到调度器", zap.Uint64("task_id", task.ID), zap.String("cron", task.CronExpr))
}

func (s *TaskScheduler) executeTask(task *model.InspectionTask) {
	lockKey := "scheduler:task:" + string(rune(task.ID))
	lock := redis.NewDistributedLock(lockKey, time.Duration(task.Timeout+30)*time.Second)
	lockValue := uuid.New().String()

	ok, err := lock.TryLock(context.Background(), lockValue)
	if err != nil {
		logger.Error("获取分布式锁失败", zap.Uint64("task_id", task.ID), zap.Error(err))
		return
	}
	if !ok {
		logger.Info("任务正在执行中，跳过", zap.Uint64("task_id", task.ID))
		return
	}
	defer lock.Unlock(context.Background())

	executionID := uuid.New().String()
	result := &model.InspectionResult{
		TaskID:      task.ID,
		TaskName:    task.Name,
		ExecutionID: executionID,
		Status:      3,
		StartedAt:   time.Now(),
	}

	err = s.resultRepo.Create(result)
	if err != nil {
		logger.Error("创建执行结果失败", zap.Error(err))
		return
	}

	var success = false
	var retryTimes int
	var errorMsg string

	for i := 0; i <= task.RetryCount; i++ {
		retryTimes = i
		success, errorMsg = s.doExecute(task)
		if success {
			break
		}
		if i < task.RetryCount {
			time.Sleep(time.Duration(task.RetryInterval) * time.Second)
		}
	}

	now := time.Now()
	result.EndedAt = &now
	result.Duration = int(now.Sub(result.StartedAt).Milliseconds())
	result.RetryTimes = retryTimes

	if success {
		result.Status = 1
	} else {
		result.Status = 0
		result.ErrorMessage = errorMsg
	}

	s.resultRepo.Update(result)

	logger.Info("任务执行完成",
		zap.Uint64("task_id", task.ID),
		zap.String("execution_id", executionID),
		zap.Bool("success", success),
		zap.Int("retry_times", retryTimes),
	)
}

func (s *TaskScheduler) doExecute(task *model.InspectionTask) (bool, string) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(task.Timeout)*time.Second)
	defer cancel()

	switch task.Type {
	case 1:
		return s.executeHTTP(ctx, task)
	case 2:
		return s.executeScript(ctx, task)
	default:
		return false, "未知的任务类型"
	}
}

func (s *TaskScheduler) executeHTTP(ctx context.Context, task *model.InspectionTask) (bool, string) {
	if task.HTTPConfig == nil {
		return false, "HTTP配置为空"
	}

	client := &http.Client{}

	req, err := http.NewRequestWithContext(ctx, task.HTTPConfig.Method, task.HTTPConfig.URL, nil)
	if err != nil {
		return false, "创建请求失败: " + err.Error()
	}

	for k, v := range task.HTTPConfig.Headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
	if err != nil {
		return false, "请求失败: " + err.Error()
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return true, ""
	}

	return false, fmt.Sprintf("HTTP状态码异常: %d", resp.StatusCode)
}

func (s *TaskScheduler) executeScript(ctx context.Context, task *model.InspectionTask) (bool, string) {
	if task.ScriptConfig == nil {
		return false, "脚本配置为空"
	}

	cmd := exec.CommandContext(ctx, task.ScriptConfig.ScriptPath, task.ScriptConfig.Args...)
	output, err := cmd.CombinedOutput()

	if err != nil {
		return false, fmt.Sprintf("脚本执行失败: %v, output: %s", err, string(output))
	}

	return true, ""
}

func (s *TaskScheduler) ReloadTask(taskID uint64) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		logger.Error("获取任务失败", zap.Uint64("task_id", taskID), zap.Error(err))
		return
	}

	if task.Status == 1 {
		s.addTask(task)
	} else {
		s.removeTask(taskID)
	}
}

func (s *TaskScheduler) removeTask(taskID uint64) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if jobID, exists := s.jobIDs[taskID]; exists {
		s.cron.Remove(jobID)
		delete(s.jobIDs, taskID)
		logger.Info("任务已从调度器移除", zap.Uint64("task_id", taskID))
	}
}
