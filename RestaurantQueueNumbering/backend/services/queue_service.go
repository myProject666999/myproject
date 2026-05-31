package services

import (
	"encoding/json"
	"errors"
	"fmt"
	"restaurant-queue/database"
	"restaurant-queue/models"
	"strconv"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

type QueueService struct{}

var queueMu sync.Mutex

const (
	QueueKeyPrefix       = "queue:%d:%s"
	QueueMetaKey         = "queue_meta:%d:%s"
	QueueCalledKey       = "queue_called:%d"
	RateLimitKeyPrefix   = "rate_limit:%d:%s"
	UserQueueKeyPrefix   = "user_queue:%d"
)

func NewQueueService() *QueueService {
	return &QueueService{}
}

func (s *QueueService) getQueueKey(restaurantID uint64, prefix string) string {
	return fmt.Sprintf(QueueKeyPrefix, restaurantID, prefix)
}

func (s *QueueService) getQueueMetaKey(restaurantID uint64, prefix string) string {
	return fmt.Sprintf(QueueMetaKey, restaurantID, prefix)
}

func (s *QueueService) getRateLimitKey(restaurantID uint64, phone string) string {
	return fmt.Sprintf(RateLimitKeyPrefix, restaurantID, phone)
}

func (s *QueueService) checkRateLimit(restaurantID uint64, phone string, settings *models.QueueSetting) error {
	key := s.getRateLimitKey(restaurantID, phone)
	count, err := database.RedisClient.Incr(database.Ctx, key).Result()
	if err != nil {
		return err
	}

	if count == 1 {
		database.RedisClient.Expire(database.Ctx, key, time.Duration(settings.RateLimitSeconds)*time.Second)
	}

	if count > int64(settings.RateLimitCount) {
		return errors.New("取号太频繁，请稍后再试")
	}

	return nil
}

func (s *QueueService) Enqueue(queue *models.Queue, settings *models.QueueSetting, tableType *models.TableType) error {
	queueMu.Lock()
	defer queueMu.Unlock()

	if err := s.checkRateLimit(queue.RestaurantID, queue.UserPhone, settings); err != nil {
		return err
	}

	queueKey := s.getQueueKey(queue.RestaurantID, queue.QueuePrefix)
	metaKey := s.getQueueMetaKey(queue.RestaurantID, queue.QueuePrefix)

	length, err := database.RedisClient.LLen(database.Ctx, queueKey).Result()
	if err != nil {
		return err
	}

	if int(length) >= settings.MaxQueueLength {
		return errors.New("排队人数已满，请稍后再试")
	}

	var currentNumber int64
	meta, err := database.RedisClient.HGetAll(database.Ctx, metaKey).Result()
	if err != nil {
		return err
	}

	if meta["current_number"] == "" {
		currentNumber = 1
	} else {
		currentNumber, _ = strconv.ParseInt(meta["current_number"], 10, 64)
		currentNumber++
	}

	queue.QueueNumber = int(currentNumber)
	queue.QueueNo = fmt.Sprintf("%s%03d", queue.QueuePrefix, queue.QueueNumber)
	queue.Status = models.QueueStatusWaiting
	queue.Position = int(length) + 1
	queue.EstimatedWaitTime = queue.Position * tableType.AvgServeTime

	queueJSON, _ := json.Marshal(queue)

	pipe := database.RedisClient.TxPipeline()
	pipe.RPush(database.Ctx, queueKey, queue.ID)
	pipe.HSet(database.Ctx, metaKey, "current_number", currentNumber)
	pipe.HSet(database.Ctx, fmt.Sprintf("queue_info:%d", queue.ID), "data", queueJSON)
	pipe.ZAdd(database.Ctx, fmt.Sprintf(UserQueueKeyPrefix, queue.UserID), &redis.Z{
		Score:  float64(queue.ID),
		Member: queue.ID,
	})
	_, err = pipe.Exec(database.Ctx)
	if err != nil {
		return err
	}

	if err := database.DB.Create(queue).Error; err != nil {
		return err
	}

	return nil
}

func (s *QueueService) Dequeue(restaurantID uint64, prefix string) (*models.Queue, error) {
	queueMu.Lock()
	defer queueMu.Unlock()

	queueKey := s.getQueueKey(restaurantID, prefix)

	queueIDStr, err := database.RedisClient.LPop(database.Ctx, queueKey).Result()
	if err == redis.Nil {
		return nil, errors.New("队列已空")
	}
	if err != nil {
		return nil, err
	}

	queueID, _ := strconv.ParseUint(queueIDStr, 10, 64)

	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	now := time.Now()
	queue.Status = models.QueueStatusCalling
	queue.CalledAt = &now

	if err := database.DB.Save(&queue).Error; err != nil {
		return nil, err
	}

	calledKey := fmt.Sprintf(QueueCalledKey, restaurantID)
	database.RedisClient.LPush(database.Ctx, calledKey, queueID)
	database.RedisClient.LTrim(database.Ctx, calledKey, 0, 9)

	s.updatePositions(restaurantID, prefix)
	s.updateQueueInfoCache(&queue)

	return &queue, nil
}

func (s *QueueService) GetPosition(restaurantID uint64, prefix string, queueID uint64) (int, error) {
	queueKey := s.getQueueKey(restaurantID, prefix)

	result, err := database.RedisClient.LPos(database.Ctx, queueKey, strconv.FormatUint(queueID, 10), redis.LPosArgs{}).Result()
	if err == redis.Nil {
		var queue models.Queue
		if err := database.DB.First(&queue, queueID).Error; err != nil {
			return -1, err
		}
		if queue.Status == models.QueueStatusCalling {
			return 0, nil
		}
		return -1, errors.New("不在队列中")
	}
	if err != nil {
		return -1, err
	}

	return int(result) + 1, nil
}

func (s *QueueService) GetQueueLength(restaurantID uint64, prefix string) (int64, error) {
	queueKey := s.getQueueKey(restaurantID, prefix)
	return database.RedisClient.LLen(database.Ctx, queueKey).Result()
}

func (s *QueueService) GetWaitingQueue(restaurantID uint64, prefix string) ([]uint64, error) {
	queueKey := s.getQueueKey(restaurantID, prefix)
	idsStr, err := database.RedisClient.LRange(database.Ctx, queueKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	ids := make([]uint64, 0, len(idsStr))
	for _, idStr := range idsStr {
		id, _ := strconv.ParseUint(idStr, 10, 64)
		ids = append(ids, id)
	}

	return ids, nil
}

func (s *QueueService) updatePositions(restaurantID uint64, prefix string) {
	queueKey := s.getQueueKey(restaurantID, prefix)
	idsStr, _ := database.RedisClient.LRange(database.Ctx, queueKey, 0, -1).Result()

	for idx, idStr := range idsStr {
		queueID, _ := strconv.ParseUint(idStr, 10, 64)
		position := idx + 1

		infoKey := fmt.Sprintf("queue_info:%d", queueID)
		data, err := database.RedisClient.HGet(database.Ctx, infoKey, "data").Result()
		if err == nil && data != "" {
			var queue models.Queue
			if json.Unmarshal([]byte(data), &queue) == nil {
				var tableType models.TableType
				database.DB.First(&tableType, queue.TableTypeID)
				queue.Position = position
				queue.EstimatedWaitTime = position * tableType.AvgServeTime
				queueJSON, _ := json.Marshal(queue)
				database.RedisClient.HSet(database.Ctx, infoKey, "data", queueJSON)
				database.DB.Model(&queue).Updates(map[string]interface{}{
					"position":           position,
					"estimated_wait_time": queue.EstimatedWaitTime,
				})
			}
		}
	}
}

func (s *QueueService) updateQueueInfoCache(queue *models.Queue) {
	infoKey := fmt.Sprintf("queue_info:%d", queue.ID)
	queueJSON, _ := json.Marshal(queue)
	database.RedisClient.HSet(database.Ctx, infoKey, "data", queueJSON)
}

func (s *QueueService) MarkOver(queueID uint64, settings *models.QueueSetting) (*models.Queue, error) {
	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	if queue.Status != models.QueueStatusCalling {
		return nil, errors.New("当前状态不能标记为过号")
	}

	queue.OverNumberCount++
	queue.Status = models.QueueStatusOver

	if queue.OverNumberCount <= settings.OverNumberLimit {
		queueKey := s.getQueueKey(queue.RestaurantID, queue.QueuePrefix)
		insertPos := settings.OverNumberLimit

		pipe := database.RedisClient.TxPipeline()
		pipe.LInsert(database.Ctx, queueKey, "BEFORE", strconv.FormatUint(uint64(insertPos+1), 10), queueID)
		_, err := pipe.Exec(database.Ctx)
		if err != nil {
			database.RedisClient.RPush(database.Ctx, queueKey, queueID)
		}

		queue.Status = models.QueueStatusWaiting
	}

	if err := database.DB.Save(&queue).Error; err != nil {
		return nil, err
	}

	s.updatePositions(queue.RestaurantID, queue.QueuePrefix)
	s.updateQueueInfoCache(&queue)

	return &queue, nil
}

func (s *QueueService) MarkSeated(queueID uint64) (*models.Queue, error) {
	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	if queue.Status != models.QueueStatusCalling {
		return nil, errors.New("当前状态不能标记为入座")
	}

	now := time.Now()
	queue.Status = models.QueueStatusSeated
	queue.SeatedAt = &now

	if err := database.DB.Save(&queue).Error; err != nil {
		return nil, err
	}

	s.updateQueueInfoCache(&queue)

	return &queue, nil
}

func (s *QueueService) MarkCompleted(queueID uint64) (*models.Queue, error) {
	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	if queue.Status != models.QueueStatusSeated {
		return nil, errors.New("当前状态不能标记为完成")
	}

	now := time.Now()
	queue.Status = models.QueueStatusCompleted
	queue.CompletedAt = &now

	if err := database.DB.Save(&queue).Error; err != nil {
		return nil, err
	}

	infoKey := fmt.Sprintf("queue_info:%d", queue.ID)
	database.RedisClient.Del(database.Ctx, infoKey)

	return &queue, nil
}

func (s *QueueService) CancelQueue(queueID uint64) (*models.Queue, error) {
	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	if queue.Status != models.QueueStatusWaiting && queue.Status != models.QueueStatusCalling {
		return nil, errors.New("当前状态不能取消")
	}

	queue.Status = models.QueueStatusCancelled
	if err := database.DB.Save(&queue).Error; err != nil {
		return nil, err
	}

	queueKey := s.getQueueKey(queue.RestaurantID, queue.QueuePrefix)
	database.RedisClient.LRem(database.Ctx, queueKey, 0, strconv.FormatUint(queueID, 10))

	userKey := fmt.Sprintf(UserQueueKeyPrefix, queue.UserID)
	database.RedisClient.ZRem(database.Ctx, userKey, queueID)

	infoKey := fmt.Sprintf("queue_info:%d", queue.ID)
	database.RedisClient.Del(database.Ctx, infoKey)

	s.updatePositions(queue.RestaurantID, queue.QueuePrefix)

	return &queue, nil
}

func (s *QueueService) GetCalledQueue(restaurantID uint64, count int64) ([]models.Queue, error) {
	calledKey := fmt.Sprintf(QueueCalledKey, restaurantID)
	idsStr, err := database.RedisClient.LRange(database.Ctx, calledKey, 0, count-1).Result()
	if err != nil {
		return nil, err
	}

	ids := make([]uint64, 0, len(idsStr))
	for _, idStr := range idsStr {
		id, _ := strconv.ParseUint(idStr, 10, 64)
		ids = append(ids, id)
	}

	var queues []models.Queue
	if len(ids) > 0 {
		database.DB.Where("id IN ?", ids).Find(&queues)
	}

	return queues, nil
}

func (s *QueueService) GetQueueInfo(queueID uint64) (*models.Queue, error) {
	infoKey := fmt.Sprintf("queue_info:%d", queueID)
	data, err := database.RedisClient.HGet(database.Ctx, infoKey, "data").Result()
	if err == nil && data != "" {
		var queue models.Queue
		if json.Unmarshal([]byte(data), &queue) == nil {
			pos, _ := s.GetPosition(queue.RestaurantID, queue.QueuePrefix, queueID)
			if pos > 0 {
				queue.Position = pos
			}
			return &queue, nil
		}
	}

	var queue models.Queue
	if err := database.DB.First(&queue, queueID).Error; err != nil {
		return nil, err
	}

	pos, _ := s.GetPosition(queue.RestaurantID, queue.QueuePrefix, queueID)
	if pos > 0 {
		queue.Position = pos
	}

	return &queue, nil
}

func (s *QueueService) GetUserQueues(userID uint64) ([]models.Queue, error) {
	userKey := fmt.Sprintf(UserQueueKeyPrefix, userID)
	idsStr, err := database.RedisClient.ZRevRange(database.Ctx, userKey, 0, -1).Result()
	if err != nil {
		return nil, err
	}

	ids := make([]uint64, 0, len(idsStr))
	for _, idStr := range idsStr {
		id, _ := strconv.ParseUint(idStr, 10, 64)
		ids = append(ids, id)
	}

	var queues []models.Queue
	if len(ids) > 0 {
		database.DB.Where("id IN ?", ids).Order("id DESC").Find(&queues)
		for i := range queues {
			pos, _ := s.GetPosition(queues[i].RestaurantID, queues[i].QueuePrefix, queues[i].ID)
			if pos > 0 {
				queues[i].Position = pos
			}
		}
	}

	return queues, nil
}
