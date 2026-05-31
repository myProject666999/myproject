package loadtest

import (
	"bytes"
	"encoding/json"
	"fmt"
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/logger"
	"math"
	"net/http"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

type LoadTestEngine struct {
	task         *model.Task
	target       *model.Target
	stopChan     chan struct{}
	stopped      atomic.Bool
	startedAt    time.Time
	totalReq     atomic.Int64
	successReq   atomic.Int64
	failedReq    atomic.Int64
	totalBytes   atomic.Int64
	responseTimes []int64
	rtMutex      sync.Mutex
	currentQPS   atomic.Int64
	intervalData *IntervalData
}

type IntervalData struct {
	startTime    time.Time
	requestCount atomic.Int64
	successCount atomic.Int64
	errorCount   atomic.Int64
	bytesCount   atomic.Int64
	responseTimes []int64
	mutex        sync.Mutex
}

type RequestResult struct {
	Duration   int64
	Success    bool
	Bytes      int64
	StatusCode int
}

func NewLoadTestEngine(task *model.Task, target *model.Target) *LoadTestEngine {
	return &LoadTestEngine{
		task:          task,
		target:        target,
		stopChan:      make(chan struct{}),
		responseTimes: make([]int64, 0),
		intervalData:  newIntervalData(),
	}
}

func newIntervalData() *IntervalData {
	return &IntervalData{
		startTime:     time.Now(),
		responseTimes: make([]int64, 0),
	}
}

func (e *LoadTestEngine) Start() {
	logger.Infof("Starting load test task: %d, concurrency: %d, duration: %ds", e.task.ID, e.task.Concurrency, e.task.Duration)
	
	e.startedAt = time.Now()
	e.stopped.Store(false)

	var wg sync.WaitGroup
	
	go e.collectMetrics()

	concurrencyPerStep := e.task.Concurrency
	steps := 1
	if e.task.Steps != nil && *e.task.Steps > 0 {
		steps = *e.task.Steps
		concurrencyPerStep = e.task.Concurrency / steps
		if concurrencyPerStep < 1 {
			concurrencyPerStep = 1
		}
	}

	rampUpInterval := 0
	if e.task.RampUp > 0 && steps > 1 {
		rampUpInterval = e.task.RampUp / (steps - 1)
	}

	for i := 0; i < steps; i++ {
		if e.stopped.Load() {
			break
		}

		currentConcurrency := concurrencyPerStep
		if i == steps-1 {
			currentConcurrency = e.task.Concurrency - concurrencyPerStep*(steps-1)
		}

		for j := 0; j < currentConcurrency; j++ {
			wg.Add(1)
			go e.worker(&wg)
		}

		logger.Infof("Started %d workers, total: %d", currentConcurrency, (i+1)*concurrencyPerStep)

		if i < steps-1 && rampUpInterval > 0 {
			select {
			case <-time.After(time.Duration(rampUpInterval) * time.Second):
			case <-e.stopChan:
				break
			}
		}
	}

	runDuration := time.Duration(e.task.Duration) * time.Second
	select {
	case <-time.After(runDuration):
	case <-e.stopChan:
	}

	e.Stop()
	wg.Wait()

	logger.Infof("Load test completed: %d", e.task.ID)
}

func (e *LoadTestEngine) Stop() {
	if e.stopped.CompareAndSwap(false, true) {
		close(e.stopChan)
		logger.Infof("Stopping load test task: %d", e.task.ID)
	}
}

func (e *LoadTestEngine) worker(wg *sync.WaitGroup) {
	defer wg.Done()

	client := &http.Client{
		Timeout: time.Duration(e.task.Timeout) * time.Second,
	}

	url := e.target.BaseURL + e.task.Path

	var headers map[string]string
	if e.task.Headers != "" {
		json.Unmarshal([]byte(e.task.Headers), &headers)
	}

	for !e.stopped.Load() {
		result := e.sendRequest(client, url, headers)
		
		e.totalReq.Add(1)
		e.intervalData.requestCount.Add(1)
		
		if result.Success {
			e.successReq.Add(1)
			e.intervalData.successCount.Add(1)
		} else {
			e.failedReq.Add(1)
			e.intervalData.errorCount.Add(1)
		}

		e.totalBytes.Add(result.Bytes)
		e.intervalData.bytesCount.Add(result.Bytes)

		e.rtMutex.Lock()
		e.responseTimes = append(e.responseTimes, result.Duration)
		e.rtMutex.Unlock()

		e.intervalData.mutex.Lock()
		e.intervalData.responseTimes = append(e.intervalData.responseTimes, result.Duration)
		e.intervalData.mutex.Unlock()
	}
}

func (e *LoadTestEngine) sendRequest(client *http.Client, url string, headers map[string]string) RequestResult {
	start := time.Now()

	var body []byte
	if e.task.Body != "" {
		body = []byte(e.task.Body)
	}

	req, err := http.NewRequest(e.task.Method, url, bytes.NewBuffer(body))
	if err != nil {
		return RequestResult{
			Duration: time.Since(start).Milliseconds(),
			Success:  false,
		}
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := client.Do(req)
	duration := time.Since(start).Milliseconds()

	if err != nil {
		return RequestResult{
			Duration: duration,
			Success:  false,
		}
	}
	defer resp.Body.Close()

	success := resp.StatusCode >= 200 && resp.StatusCode < 400

	return RequestResult{
		Duration:   duration,
		Success:    success,
		Bytes:      resp.ContentLength,
		StatusCode: resp.StatusCode,
	}
}

func (e *LoadTestEngine) collectMetrics() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for !e.stopped.Load() {
		select {
		case <-ticker.C:
			e.recordMetrics()
		case <-e.stopChan:
			e.recordMetrics()
			return
		}
	}
}

func (e *LoadTestEngine) recordMetrics() {
	e.intervalData.mutex.Lock()
	rt := make([]int64, len(e.intervalData.responseTimes))
	copy(rt, e.intervalData.responseTimes)
	requestCount := e.intervalData.requestCount.Load()
	successCount := e.intervalData.successCount.Load()
	errorCount := e.intervalData.errorCount.Load()
	bytesCount := e.intervalData.bytesCount.Load()
	e.intervalData.responseTimes = e.intervalData.responseTimes[:0]
	e.intervalData.requestCount.Store(0)
	e.intervalData.successCount.Store(0)
	e.intervalData.errorCount.Store(0)
	e.intervalData.bytesCount.Store(0)
	e.intervalData.mutex.Unlock()

	if len(rt) == 0 {
		rt = []int64{0}
	}

	sort.Slice(rt, func(i, j int) bool {
		return rt[i] < rt[j]
	})

	metrics := &model.Metric{
		TaskID:        e.task.ID,
		Timestamp:     time.Now(),
		QPS:           int(requestCount),
		AvgRT:         int(average(rt)),
		P50RT:         int(percentile(rt, 50)),
		P95RT:         int(percentile(rt, 95)),
		P99RT:         int(percentile(rt, 99)),
		MinRT:         int(rt[0]),
		MaxRT:         int(rt[len(rt)-1]),
		SuccessCount:  successCount,
		ErrorCount:    errorCount,
		ErrorRate:     calculateErrorRate(successCount, errorCount),
		BytesReceived: bytesCount,
	}

	repository.DB.Create(metrics)

	e.pushToRedis(metrics)
}

func (e *LoadTestEngine) pushToRedis(metrics *model.Metric) {
	key := fmt.Sprintf("loadtest:metrics:%d", e.task.ID)
	data, _ := json.Marshal(metrics)
	repository.RedisClient.RPush(repository.Ctx, key, data)
	repository.RedisClient.Expire(repository.Ctx, key, 24*time.Hour)
}

func (e *LoadTestEngine) GetSummary() map[string]interface{} {
	e.rtMutex.Lock()
	rt := make([]int64, len(e.responseTimes))
	copy(rt, e.responseTimes)
	e.rtMutex.Unlock()

	if len(rt) == 0 {
		rt = []int64{0}
	}

	sort.Slice(rt, func(i, j int) bool {
		return rt[i] < rt[j]
	})

	total := e.totalReq.Load()
	success := e.successReq.Load()
	failed := e.failedReq.Load()
	duration := time.Since(e.startedAt).Seconds()

	avgQPS := 0.0
	if duration > 0 {
		avgQPS = float64(total) / duration
	}

	return map[string]interface{}{
		"total_requests":   total,
		"success_requests": success,
		"failed_requests":  failed,
		"error_rate":       calculateErrorRate(success, failed),
		"avg_qps":          math.Round(avgQPS*100) / 100,
		"avg_rt":           int(average(rt)),
		"min_rt":           int(rt[0]),
		"max_rt":           int(rt[len(rt)-1]),
		"p50_rt":           int(percentile(rt, 50)),
		"p95_rt":           int(percentile(rt, 95)),
		"p99_rt":           int(percentile(rt, 99)),
		"total_duration":   int(duration),
		"bytes_total":      e.totalBytes.Load(),
	}
}

func average(arr []int64) int64 {
	if len(arr) == 0 {
		return 0
	}
	var sum int64
	for _, v := range arr {
		sum += v
	}
	return sum / int64(len(arr))
}

func percentile(arr []int64, p int) int64 {
	if len(arr) == 0 {
		return 0
	}
	index := int(math.Ceil(float64(p)/100.0*float64(len(arr)))) - 1
	if index < 0 {
		index = 0
	}
	if index >= len(arr) {
		index = len(arr) - 1
	}
	return arr[index]
}

func calculateErrorRate(success, failed int64) float64 {
	total := success + failed
	if total == 0 {
		return 0
	}
	return math.Round(float64(failed)/float64(total)*10000) / 100
}
