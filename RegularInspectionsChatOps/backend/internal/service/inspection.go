package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"inspection-chatops/internal/middleware"
	"inspection-chatops/internal/model"
	"inspection-chatops/internal/repository"
	"inspection-chatops/pkg/logger"
	"inspection-chatops/pkg/redis"
	"io"
	"net/http"
	"os/exec"
	"time"

	"github.com/google/uuid"
	"go.uber.org/zap"
)

type InspectionService struct {
	taskRepo   *repository.InspectionRepository
	resultRepo *repository.ResultRepository
	robotRepo  *repository.RobotRepository
}

func NewInspectionService() *InspectionService {
	return &InspectionService{
		taskRepo:   repository.NewInspectionRepository(),
		resultRepo: repository.NewResultRepository(),
		robotRepo:  repository.NewRobotRepository(),
	}
}

func (s *InspectionService) CreateTask(req *model.CreateTaskRequest, userID uint64) (*model.InspectionTask, error) {
	task := &model.InspectionTask{
		Name:           req.Name,
		Description:    req.Description,
		Type:           req.Type,
		CronExpr:       req.CronExpr,
		Timeout:        req.Timeout,
		RetryCount:     req.RetryCount,
		RetryInterval:  req.RetryInterval,
		HTTPConfig:     req.HTTPConfig,
		ScriptConfig:   req.ScriptConfig,
		AlertThreshold: req.AlertThreshold,
		NotifyChannels: req.NotifyChannels,
		Tags:           req.Tags,
		Status:         req.Status,
		CreatedBy:      userID,
	}

	if task.Timeout == 0 {
		task.Timeout = 30
	}

	err := s.taskRepo.Create(task)
	return task, err
}

func (s *InspectionService) GetTask(id uint64) (*model.InspectionTask, error) {
	return s.taskRepo.GetByID(id)
}

func (s *InspectionService) UpdateTask(id uint64, req *model.CreateTaskRequest) (*model.InspectionTask, error) {
	task, err := s.taskRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	task.Name = req.Name
	task.Description = req.Description
	task.Type = req.Type
	task.CronExpr = req.CronExpr
	task.Timeout = req.Timeout
	task.RetryCount = req.RetryCount
	task.RetryInterval = req.RetryInterval
	task.HTTPConfig = req.HTTPConfig
	task.ScriptConfig = req.ScriptConfig
	task.AlertThreshold = req.AlertThreshold
	task.NotifyChannels = req.NotifyChannels
	task.Tags = req.Tags
	task.Status = req.Status

	err = s.taskRepo.Update(task)
	return task, err
}

func (s *InspectionService) DeleteTask(id uint64) error {
	return s.taskRepo.Delete(id)
}

func (s *InspectionService) ListTasks(req *model.TaskListRequest) ([]model.InspectionTask, int64, error) {
	return s.taskRepo.List(req.Page, req.PageSize, req.Status, req.Keyword)
}

func (s *InspectionService) ExecuteTask(taskID uint64) (*model.InspectionResult, error) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return nil, err
	}

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
		return nil, err
	}

	go s.runTask(task, result)

	return result, nil
}

func (s *InspectionService) runTask(task *model.InspectionTask, result *model.InspectionResult) {
	lockKey := fmt.Sprintf("task:%d", task.ID)
	lock := redis.NewDistributedLock(lockKey, time.Duration(task.Timeout+10)*time.Second)
	lockValue := uuid.New().String()

	ok, err := lock.TryLock(context.Background(), lockValue)
	if err != nil {
		logger.Error("获取分布式锁失败", zap.Error(err))
		return
	}
	if !ok {
		logger.Info("任务正在执行中，跳过", zap.Uint64("task_id", task.ID))
		return
	}
	defer lock.Unlock(context.Background())

	success := false
	var retryTimes int

	for i := 0; i <= task.RetryCount+1; i++ {
		retryTimes = i
		success = s.doExecute(task, result)
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
	}

	s.resultRepo.Update(result)
}

func (s *InspectionService) doExecute(task *model.InspectionTask, result *model.InspectionResult) bool {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(task.Timeout)*time.Second)
	defer cancel()

	switch task.Type {
	case 1:
		return s.executeHTTP(ctx, task, result)
	case 2:
		return s.executeScript(ctx, task, result)
	default:
		result.ErrorMessage = "未知的任务类型"
		return false
	}
}

func (s *InspectionService) executeHTTP(ctx context.Context, task *model.InspectionTask, result *model.InspectionResult) bool {
	if task.HTTPConfig == nil {
		result.ErrorMessage = "HTTP配置为空"
		return false
	}

	client := &http.Client{}

	var body io.Reader
	if task.HTTPConfig.Body != "" {
		body = bytes.NewBufferString(task.HTTPConfig.Body)
	}

	method := task.HTTPConfig.Method
	if method == "" {
		method = "GET"
	}

	req, err := http.NewRequestWithContext(ctx, method, task.HTTPConfig.URL, body)
	if err != nil {
		result.ErrorMessage = fmt.Sprintf("创建请求失败: %v", err)
		return false
	}

	for k, v := range task.HTTPConfig.Headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
	if err != nil {
		result.ErrorMessage = fmt.Sprintf("请求失败: %v", err)
		return false
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	result.ResultData = map[string]interface{}{
		"status_code": resp.StatusCode,
		"body":        string(respBody),
		"headers":     resp.Header,
	}

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return true
	}

	result.ErrorMessage = fmt.Sprintf("HTTP状态码异常: %d", resp.StatusCode)
	return false
}

func (s *InspectionService) executeScript(ctx context.Context, task *model.InspectionTask, result *model.InspectionResult) bool {
	if task.ScriptConfig == nil {
		result.ErrorMessage = "脚本配置为空"
		return false
	}

	cmd := exec.CommandContext(ctx, task.ScriptConfig.ScriptPath, task.ScriptConfig.Args...)

	output, err := cmd.CombinedOutput()
	result.ResultData = map[string]interface{}{
		"output": string(output),
	}

	if err != nil {
		result.ErrorMessage = fmt.Sprintf("脚本执行失败: %v", err)
		return false
	}

	return true
}

func (s *InspectionService) ListResults(req *model.ResultListRequest) ([]model.InspectionResult, int64, error) {
	return s.resultRepo.List(req)
}

func (s *InspectionService) GetResult(id uint64) (*model.InspectionResult, error) {
	return s.resultRepo.GetByID(id)
}

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService() *UserService {
	return &UserService{
		userRepo: repository.NewUserRepository(),
	}
}

func (s *UserService) Login(username, password string) (*model.LoginResponse, error) {
	user, err := s.userRepo.GetByUsername(username)
	if err != nil {
		return nil, errors.New("用户不存在")
	}

	if user.Status != 1 {
		return nil, errors.New("用户已被禁用")
	}

	if !user.CheckPassword(password) {
		return nil, errors.New("密码错误")
	}

	token, err := middleware.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *UserService) GetByID(id uint64) (*model.User, error) {
	return s.userRepo.GetByID(id)
}
