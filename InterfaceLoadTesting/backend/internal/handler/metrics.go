package handler

import (
	"encoding/json"
	"fmt"
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetTaskMetrics(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "60"))
	if limit < 1 || limit > 3600 {
		limit = 60
	}

	key := fmt.Sprintf("loadtest:metrics:%d", taskID)
	metricsList, err := repository.RedisClient.LRange(repository.Ctx, key, int64(-limit), -1).Result()
	if err != nil {
		utils.InternalError(c, "Failed to get metrics from Redis")
		return
	}

	result := make([]model.Metric, 0, len(metricsList))
	for _, m := range metricsList {
		var metric model.Metric
		if err := json.Unmarshal([]byte(m), &metric); err == nil {
			result = append(result, metric)
		}
	}

	utils.Success(c, result)
}

func GetTaskMetricsHistory(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid task ID")
		return
	}

	startTime := c.Query("start_time")
	endTime := c.Query("end_time")
	downsample, _ := strconv.Atoi(c.DefaultQuery("downsample", "1"))

	if downsample < 1 {
		downsample = 1
	}

	query := repository.DB.Model(&model.Metric{}).Where("task_id = ?", taskID)
	
	if startTime != "" {
		query = query.Where("timestamp >= ?", startTime)
	}
	if endTime != "" {
		query = query.Where("timestamp <= ?", endTime)
	}

	var metrics []model.Metric
	query.Order("timestamp ASC").Find(&metrics)

	if downsample > 1 && len(metrics) > downsample*10 {
		metrics = downsampleMetrics(metrics, downsample)
	}

	utils.Success(c, metrics)
}

func downsampleMetrics(metrics []model.Metric, factor int) []model.Metric {
	if len(metrics) == 0 || factor <= 1 {
		return metrics
	}

	result := make([]model.Metric, 0, len(metrics)/factor+1)
	
	for i := 0; i < len(metrics); i += factor {
		end := i + factor
		if end > len(metrics) {
			end = len(metrics)
		}
		
		group := metrics[i:end]
		avg := aggregateMetrics(group)
		result = append(result, avg)
	}

	return result
}

func aggregateMetrics(metrics []model.Metric) model.Metric {
	if len(metrics) == 0 {
		return model.Metric{}
	}

	first := metrics[0]
	last := metrics[len(metrics)-1]

	var totalQPS, totalAvgRT, totalP50, totalP95, totalP99 int
	var totalSuccess, totalError, totalBytes int64
	var minRT, maxRT int = first.MinRT, first.MaxRT

	for _, m := range metrics {
		totalQPS += m.QPS
		totalAvgRT += m.AvgRT
		totalP50 += m.P50RT
		totalP95 += m.P95RT
		totalP99 += m.P99RT
		totalSuccess += m.SuccessCount
		totalError += m.ErrorCount
		totalBytes += m.BytesReceived

		if m.MinRT < minRT {
			minRT = m.MinRT
		}
		if m.MaxRT > maxRT {
			maxRT = m.MaxRT
		}
	}

	n := len(metrics)
	total := totalSuccess + totalError
	errorRate := 0.0
	if total > 0 {
		errorRate = float64(totalError) / float64(total) * 100
	}

	return model.Metric{
		TaskID:        first.TaskID,
		Timestamp:     first.Timestamp,
		QPS:           totalQPS / n,
		AvgRT:         totalAvgRT / n,
		P50RT:         totalP50 / n,
		P95RT:         totalP95 / n,
		P99RT:         totalP99 / n,
		MinRT:         minRT,
		MaxRT:         maxRT,
		SuccessCount:  totalSuccess,
		ErrorCount:    totalError,
		ErrorRate:     errorRate,
		BytesReceived: totalBytes,
		CreatedAt:     time.Now(),
	}
}
