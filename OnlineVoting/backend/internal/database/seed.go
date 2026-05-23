package database

import (
	"log"
	"online-voting/internal/model"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func Seed() {
	var count int64
	DB.Model(&model.User{}).Count(&count)
	if count > 0 {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("seed error: %v", err)
		return
	}
	users := []model.User{
		{Username: "admin", Password: string(hash), Role: 9},
		{Username: "user1", Password: string(hash), Role: 1},
	}
	DB.Create(&users)

	activities := []model.Activity{
		{
			Title: "年度最佳人气选手评选", Description: "请为你支持的选手投上宝贵的一票",
			Type: 1, Status: 1, CreatedBy: 1,
			StartTime: time.Now().Add(-24 * time.Hour),
			EndTime:   time.Now().Add(7 * 24 * time.Hour),
		},
		{
			Title: "幸运大抽奖", Description: "参与抽奖，赢取精美礼品",
			Type: 2, Status: 1, CreatedBy: 1,
			StartTime: time.Now().Add(-24 * time.Hour),
			EndTime:   time.Now().Add(30 * 24 * time.Hour),
		},
	}
	DB.Create(&activities)

	options := []model.Option{
		{ActivityID: 1, Name: "选手A - 李明", SortOrder: 1},
		{ActivityID: 1, Name: "选手B - 王芳", SortOrder: 2},
		{ActivityID: 1, Name: "选手C - 张伟", SortOrder: 3},
		{ActivityID: 1, Name: "选手D - 刘洋", SortOrder: 4},
		{ActivityID: 2, Name: "一等奖：iPhone 15 Pro", SortOrder: 1},
		{ActivityID: 2, Name: "二等奖：iPad", SortOrder: 2},
		{ActivityID: 2, Name: "三等奖：AirPods", SortOrder: 3},
		{ActivityID: 2, Name: "感谢参与", SortOrder: 4},
	}
	DB.Create(&options)

	log.Println("seed data inserted")
}
