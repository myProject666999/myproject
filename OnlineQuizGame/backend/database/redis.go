package database

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"online-quiz-game/config"
	"online-quiz-game/models"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
)

var RedisClient *redis.Client
var RedisAvailable bool
var Ctx = context.Background()

var memorySessions = make(map[string][]byte)
var memorySessionsMutex sync.RWMutex

func InitRedis(cfg *config.Config) error {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     cfg.RedisAddr,
		Password: cfg.RedisPass,
		DB:       cfg.RedisDB,
	})

	err := RedisClient.Ping(Ctx).Err()
	if err != nil {
		RedisAvailable = false
		log.Printf("Warning: Redis not available, using memory storage: %v", err)
		return nil
	}

	RedisAvailable = true
	log.Println("Redis connected")
	return nil
}

func CloseRedis() {
	if RedisClient != nil && RedisAvailable {
		RedisClient.Close()
	}
}

func GetLeaderboardKey(period string) string {
	return fmt.Sprintf("leaderboard:%s", period)
}

func AddScoreToLeaderboard(userID int64, score int64, period string) error {
	if !RedisAvailable {
		return nil
	}
	key := GetLeaderboardKey(period)
	member := fmt.Sprintf("user:%d", userID)
	return RedisClient.ZAdd(Ctx, key, &redis.Z{
		Score:  float64(score),
		Member: member,
	}).Err()
}

func IncrementScore(userID int64, score int64, period string) error {
	if !RedisAvailable {
		return nil
	}
	key := GetLeaderboardKey(period)
	member := fmt.Sprintf("user:%d", userID)
	return RedisClient.ZIncrBy(Ctx, key, float64(score), member).Err()
}

func GetLeaderboard(period string, limit int64) ([]models.LeaderboardEntry, error) {
	if !RedisAvailable {
		return []models.LeaderboardEntry{}, nil
	}
	key := GetLeaderboardKey(period)
	result, err := RedisClient.ZRevRangeWithScores(Ctx, key, 0, limit-1).Result()
	if err != nil {
		return nil, err
	}

	var entries []models.LeaderboardEntry
	userIDs := make([]int64, 0)
	for _, z := range result {
		member := z.Member.(string)
		var userID int64
		fmt.Sscanf(member, "user:%d", &userID)
		userIDs = append(userIDs, userID)
	}

	if len(userIDs) > 0 && MySQLDB != nil {
		var users []models.User
		MySQLDB.Find(&users, userIDs)
		userMap := make(map[int64]models.User)
		for _, u := range users {
			userMap[u.ID] = u
		}

		for i, z := range result {
			member := z.Member.(string)
			var userID int64
			fmt.Sscanf(member, "user:%d", &userID)
			entry := models.LeaderboardEntry{
				Rank:   i + 1,
				UserID: userID,
				Score:  int64(z.Score),
			}
			if user, ok := userMap[userID]; ok {
				entry.Username = user.Username
				entry.Nickname = user.Nickname
				entry.Avatar = user.Avatar
			}
			entries = append(entries, entry)
		}
	}

	return entries, nil
}

func CacheQuizSession(session *models.QuizSession) error {
	key := fmt.Sprintf("quiz_session:%d", session.GameID)
	data, err := json.Marshal(session)
	if err != nil {
		return err
	}

	if RedisAvailable {
		return RedisClient.Set(Ctx, key, data, 10*time.Minute).Err()
	}

	memorySessionsMutex.Lock()
	memorySessions[key] = data
	memorySessionsMutex.Unlock()
	return nil
}

func GetQuizSession(gameID int64) (*models.QuizSession, error) {
	key := fmt.Sprintf("quiz_session:%d", gameID)

	var data []byte
	var err error

	if RedisAvailable {
		data, err = RedisClient.Get(Ctx, key).Bytes()
		if err != nil {
			return nil, err
		}
	} else {
		memorySessionsMutex.RLock()
		var ok bool
		data, ok = memorySessions[key]
		memorySessionsMutex.RUnlock()
		if !ok {
			return nil, fmt.Errorf("session not found")
		}
	}

	var session models.QuizSession
	err = json.Unmarshal(data, &session)
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func DeleteQuizSession(gameID int64) error {
	key := fmt.Sprintf("quiz_session:%d", gameID)

	if RedisAvailable {
		return RedisClient.Del(Ctx, key).Err()
	}

	memorySessionsMutex.Lock()
	delete(memorySessions, key)
	memorySessionsMutex.Unlock()
	return nil
}

func ResetDailyLeaderboard() error {
	if !RedisAvailable {
		return nil
	}
	key := GetLeaderboardKey("daily")
	return RedisClient.Del(Ctx, key).Err()
}

func ResetWeeklyLeaderboard() error {
	if !RedisAvailable {
		return nil
	}
	key := GetLeaderboardKey("weekly")
	return RedisClient.Del(Ctx, key).Err()
}
