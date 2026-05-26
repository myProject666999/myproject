package database

import (
	"fitness-tracker/models"
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() {
	var err error
	DB, err = gorm.Open(sqlite.Open("fitness.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	err = DB.AutoMigrate(
		&models.Exercise{},
		&models.TrainingPlan{},
		&models.PlanExercise{},
		&models.CheckIn{},
		&models.CheckInExercise{},
		&models.BodyRecord{},
		&models.Achievement{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	seedData()
}

func seedData() {
	var count int64
	DB.Model(&models.Exercise{}).Count(&count)
	if count > 0 {
		return
	}

	exercises := []models.Exercise{
		{Name: "卧推", Category: "胸部", Description: "平板杠铃卧推"},
		{Name: "上斜卧推", Category: "胸部", Description: "上斜杠铃卧推"},
		{Name: "哑铃飞鸟", Category: "胸部", Description: "平板哑铃飞鸟"},
		{Name: "深蹲", Category: "腿部", Description: "杠铃深蹲"},
		{Name: "腿举", Category: "腿部", Description: "坐姿腿举"},
		{Name: "腿弯举", Category: "腿部", Description: "俯卧腿弯举"},
		{Name: "硬拉", Category: "背部", Description: "传统硬拉"},
		{Name: "引体向上", Category: "背部", Description: "宽握引体向上"},
		{Name: "划船", Category: "背部", Description: "杠铃划船"},
		{Name: "推举", Category: "肩部", Description: "坐姿杠铃推举"},
		{Name: "侧平举", Category: "肩部", Description: "哑铃侧平举"},
		{Name: "二头弯举", Category: "手臂", Description: "杠铃二头弯举"},
		{Name: "三头下压", Category: "手臂", Description: "绳索三头下压"},
		{Name: "卷腹", Category: "核心", Description: "仰卧卷腹"},
		{Name: "平板支撑", Category: "核心", Description: "平板支撑"},
	}

	for _, e := range exercises {
		DB.Create(&e)
	}

	achievements := []models.Achievement{
		{Name: "初次打卡", Badge: "🌟", Description: "完成第一次训练打卡", Unlocked: false},
		{Name: "连续7天", Badge: "🔥", Description: "连续打卡7天", Unlocked: false},
		{Name: "连续30天", Badge: "💪", Description: "连续打卡30天", Unlocked: false},
		{Name: "百次达成", Badge: "🏆", Description: "累计打卡100次", Unlocked: false},
		{Name: "力量新手", Badge: "💪", Description: "累计举重1000kg", Unlocked: false},
		{Name: "力量达人", Badge: "⚡", Description: "累计举重10000kg", Unlocked: false},
	}

	for _, a := range achievements {
		DB.Create(&a)
	}
}
