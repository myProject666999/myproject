package loadtest

import (
	"encoding/json"
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/logger"
	"sync"
	"time"
)

type TaskManager struct {
	tasks   map[uint64]*LoadTestEngine
	mutex   sync.RWMutex
}

var Manager *TaskManager

func InitTaskManager() {
	Manager = &TaskManager{
		tasks: make(map[uint64]*LoadTestEngine),
	}
}

func (tm *TaskManager) StartTask(task *model.Task, target *model.Target) {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	if _, exists := tm.tasks[task.ID]; exists {
		logger.Warnf("Task %d is already running", task.ID)
		return
	}

	engine := NewLoadTestEngine(task, target)
	tm.tasks[task.ID] = engine

	now := time.Now()
	task.Status = 1
	task.StartedAt = &now
	repository.DB.Save(task)

	go func() {
		engine.Start()
		tm.completeTask(task, engine)
	}()
}

func (tm *TaskManager) StopTask(taskID uint64) bool {
	tm.mutex.Lock()
	defer tm.mutex.Unlock()

	engine, exists := tm.tasks[taskID]
	if !exists {
		return false
	}

	engine.Stop()
	return true
}

func (tm *TaskManager) completeTask(task *model.Task, engine *LoadTestEngine) {
	tm.mutex.Lock()
	delete(tm.tasks, task.ID)
	tm.mutex.Unlock()

	now := time.Now()
	task.EndedAt = &now
	task.Progress = 100

	if engine.stopped.Load() && time.Since(engine.startedAt) < time.Duration(task.Duration)*time.Second {
		task.Status = 3
	} else {
		task.Status = 2
	}
	repository.DB.Save(task)

	summary := engine.GetSummary()
	tm.createReport(task, summary)
}

func (tm *TaskManager) createReport(task *model.Task, summary map[string]interface{}) {
	detailData, _ := json.Marshal(summary)

	var peakQPS int
	repository.DB.Model(&model.Metric{}).Where("task_id = ?", task.ID).Select("MAX(qps)").Scan(&peakQPS)

	report := &model.Report{
		TaskID:          task.ID,
		Name:            task.Name + " - 压测报告",
		TotalRequests:   summary["total_requests"].(int64),
		SuccessRequests: summary["success_requests"].(int64),
		FailedRequests:  summary["failed_requests"].(int64),
		ErrorRate:       summary["error_rate"].(float64),
		AvgQPS:          summary["avg_qps"].(float64),
		PeakQPS:         peakQPS,
		AvgRT:           summary["avg_rt"].(int),
		MinRT:           summary["min_rt"].(int),
		MaxRT:           summary["max_rt"].(int),
		P50RT:           summary["p50_rt"].(int),
		P95RT:           summary["p95_rt"].(int),
		P99RT:           summary["p99_rt"].(int),
		TotalDuration:   summary["total_duration"].(int),
		BytesTotal:      summary["bytes_total"].(int64),
		DetailData:      string(detailData),
		CreatedBy:       task.CreatedBy,
	}

	repository.DB.Create(report)
	logger.Infof("Report created for task %d, report ID: %d", task.ID, report.ID)
}

func (tm *TaskManager) IsRunning(taskID uint64) bool {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()
	_, exists := tm.tasks[taskID]
	return exists
}

func (tm *TaskManager) GetRunningTasks() []uint64 {
	tm.mutex.RLock()
	defer tm.mutex.RUnlock()

	taskIDs := make([]uint64, 0, len(tm.tasks))
	for id := range tm.tasks {
		taskIDs = append(taskIDs, id)
	}
	return taskIDs
}
