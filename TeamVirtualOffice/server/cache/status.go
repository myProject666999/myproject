package cache

import (
	"context"
	"fmt"
	"strconv"
	"time"

	"team-virtual-office/config"

	"github.com/go-redis/redis/v8"
)

type StatusManager struct {
	rdb *redis.Client
}

func NewStatusManager(cfg *config.Config) *StatusManager {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.Redis.Host + ":" + strconv.Itoa(cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})
	return &StatusManager{rdb: rdb}
}

func (sm *StatusManager) SetUserOnline(userID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:status:%d", userID)
	pipe := sm.rdb.Pipeline()
	pipe.SAdd(ctx, "online_users", userID)
	pipe.HSet(ctx, key, "online_status", 1)
	pipe.HSet(ctx, key, "last_heartbeat", time.Now().Format(time.RFC3339))
	_, err := pipe.Exec(ctx)
	return err
}

func (sm *StatusManager) SetUserOffline(userID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:status:%d", userID)
	currentRoomID, _ := sm.rdb.HGet(ctx, key, "current_room_id").Result()
	pipe := sm.rdb.Pipeline()
	pipe.SRem(ctx, "online_users", userID)
	pipe.HSet(ctx, key, "online_status", 0)
	if currentRoomID != "" {
		pipe.SRem(ctx, fmt.Sprintf("room:members:%s", currentRoomID), userID)
	}
	pipe.HSet(ctx, key, "current_room_id", "")
	pipe.HSet(ctx, key, "current_seat_id", "")
	_, err := pipe.Exec(ctx)
	return err
}

func (sm *StatusManager) UpdateHeartbeat(userID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:status:%d", userID)
	return sm.rdb.HSet(ctx, key, "last_heartbeat", time.Now().Format(time.RFC3339)).Err()
}

func (sm *StatusManager) SetUserStatus(userID uint, onlineStatus int, busyMode int, textStatus string) (bool, error) {
	ctx := context.Background()
	key := fmt.Sprintf("user:status:%d", userID)
	dedupKey := fmt.Sprintf("status:dedup:%d", userID)
	prevStatus, err := sm.rdb.Get(ctx, dedupKey).Result()
	if err != nil && err != redis.Nil {
		return false, err
	}
	newStatus := strconv.Itoa(onlineStatus)
	changed := prevStatus != newStatus
	pipe := sm.rdb.Pipeline()
	pipe.HSet(ctx, key, "online_status", onlineStatus)
	pipe.HSet(ctx, key, "busy_mode", busyMode)
	pipe.HSet(ctx, key, "text_status", textStatus)
	pipe.Set(ctx, dedupKey, newStatus, 5*time.Second)
	_, err = pipe.Exec(ctx)
	return changed, err
}

func (sm *StatusManager) SetUserRoom(userID uint, roomID uint) error {
	ctx := context.Background()
	key := fmt.Sprintf("user:status:%d", userID)
	prevRoomID, _ := sm.rdb.HGet(ctx, key, "current_room_id").Result()
	pipe := sm.rdb.Pipeline()
	if prevRoomID != "" && prevRoomID != "0" {
		pipe.SRem(ctx, fmt.Sprintf("room:members:%s", prevRoomID), userID)
	}
	pipe.HSet(ctx, key, "current_room_id", roomID)
	pipe.SAdd(ctx, fmt.Sprintf("room:members:%d", roomID), userID)
	_, err := pipe.Exec(ctx)
	return err
}

func (sm *StatusManager) GetOnlineUsers() ([]uint, error) {
	ctx := context.Background()
	result, err := sm.rdb.SMembers(ctx, "online_users").Result()
	if err != nil {
		return nil, err
	}
	var users []uint
	for _, s := range result {
		id, err := strconv.ParseUint(s, 10, 64)
		if err != nil {
			continue
		}
		users = append(users, uint(id))
	}
	return users, nil
}

func (sm *StatusManager) GetRoomMembers(roomID uint) ([]uint, error) {
	ctx := context.Background()
	result, err := sm.rdb.SMembers(ctx, fmt.Sprintf("room:members:%d", roomID)).Result()
	if err != nil {
		return nil, err
	}
	var users []uint
	for _, s := range result {
		id, err := strconv.ParseUint(s, 10, 64)
		if err != nil {
			continue
		}
		users = append(users, uint(id))
	}
	return users, nil
}

func (sm *StatusManager) GetUserStatus(userID uint) (map[string]string, error) {
	ctx := context.Background()
	return sm.rdb.HGetAll(ctx, fmt.Sprintf("user:status:%d", userID)).Result()
}

func (sm *StatusManager) CheckHeartbeatTimeout(timeoutSeconds int) ([]uint, error) {
	ctx := context.Background()
	onlineUsers, err := sm.GetOnlineUsers()
	if err != nil {
		return nil, err
	}
	now := time.Now()
	var timedOut []uint
	for _, userID := range onlineUsers {
		heartbeatStr, err := sm.rdb.HGet(ctx, fmt.Sprintf("user:status:%d", userID), "last_heartbeat").Result()
		if err != nil {
			continue
		}
		heartbeat, err := time.Parse(time.RFC3339, heartbeatStr)
		if err != nil {
			continue
		}
		if now.Sub(heartbeat) > time.Duration(timeoutSeconds)*time.Second {
			timedOut = append(timedOut, userID)
		}
	}
	return timedOut, nil
}

func (sm *StatusManager) IsUserOnline(userID uint) (bool, error) {
	ctx := context.Background()
	return sm.rdb.SIsMember(ctx, "online_users", userID).Result()
}
