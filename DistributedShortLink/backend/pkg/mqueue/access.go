package mqueue

import (
	"context"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type AccessMsg struct {
	Code        string `json:"code"`
	ShortLinkID uint64 `json:"shortLinkId"`
	IP          string `json:"ip"`
	UserAgent   string `json:"ua"`
	Referer     string `json:"referer"`
}

type AccessQueue struct {
	rdb        *redis.Client
	stream     string
	group      string
	consumer   string
	batchSize  int64
	interval   time.Duration
	initOnce   sync.Once
	initErr    error
}

func NewAccessQueue(rdb *redis.Client, stream, group, consumer string, batchSize int64, interval time.Duration) *AccessQueue {
	if batchSize <= 0 {
		batchSize = 50
	}
	if interval <= 0 {
		interval = 200 * time.Millisecond
	}
	return &AccessQueue{
		rdb:       rdb,
		stream:    stream,
		group:     group,
		consumer:  consumer,
		batchSize: batchSize,
		interval:  interval,
	}
}

func (q *AccessQueue) ensureGroup(ctx context.Context) error {
	q.initOnce.Do(func() {
		// create group; ignore error if exists
		_ = q.rdb.XGroupCreateMkStream(ctx, q.stream, q.group, "0").Err()
	})
	return q.initErr
}

func (q *AccessQueue) Push(ctx context.Context, m AccessMsg) error {
	data, err := json.Marshal(m)
	if err != nil {
		return err
	}
	return q.rdb.XAdd(ctx, &redis.XAddArgs{
		Stream: q.stream,
		Values: map[string]interface{}{"payload": string(data)},
	}).Err()
}

func (q *AccessQueue) Consume(ctx context.Context, onBatch func(ctx context.Context, batch []AccessMsg)) {
	_ = q.ensureGroup(ctx)
	ticker := time.NewTicker(q.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			res, err := q.rdb.XReadGroup(ctx, &redis.XReadGroupArgs{
				Group:    q.group,
				Consumer: q.consumer,
				Streams:  []string{q.stream, ">"},
				Count:    q.batchSize,
				Block:    time.Second,
			}).Result()
			if err != nil {
				if err == redis.Nil {
					continue
				}
				// retry with create in case group missing
				_ = q.rdb.XGroupCreateMkStream(ctx, q.stream, q.group, "0").Err()
				continue
			}
			var batch []AccessMsg
			var ids []string
			for _, stream := range res {
				for _, msg := range stream.Messages {
					var m AccessMsg
					payload, _ := msg.Values["payload"].(string)
					if err := json.Unmarshal([]byte(payload), &m); err != nil {
						continue
					}
					batch = append(batch, m)
					ids = append(ids, msg.ID)
				}
			}
			if len(batch) > 0 {
				func() {
					defer func() {
						if r := recover(); r != nil {
							log.Printf("consume panic: %v", r)
						}
					}()
					onBatch(ctx, batch)
				}()
				_ = q.rdb.XAck(ctx, q.stream, q.group, ids...).Err()
			}
		}
	}
}
