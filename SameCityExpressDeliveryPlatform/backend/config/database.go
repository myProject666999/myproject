package config

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"

	"samecity-express/internal/model"
)

var DB *gorm.DB

func InitConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("../config")
	viper.AddConfigPath(".")

	if err := viper.ReadInConfig(); err != nil {
		log.Printf("Error reading config file: %v", err)
	}

	viper.AutomaticEnv()
}

func InitDatabase() {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		viper.GetString("database.mysql.username"),
		viper.GetString("database.mysql.password"),
		viper.GetString("database.mysql.host"),
		viper.GetString("database.mysql.port"),
		viper.GetString("database.mysql.database"),
		viper.GetString("database.mysql.charset"),
	)

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true,
		},
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(viper.GetInt("database.mysql.max_idle_conns"))
	sqlDB.SetMaxOpenConns(viper.GetInt("database.mysql.max_open_conns"))
	sqlDB.SetConnMaxLifetime(time.Hour)

	err = DB.AutoMigrate(
		&model.User{},
		&model.Rider{},
		&model.Admin{},
		&model.Address{},
		&model.Order{},
		&model.OrderTrack{},
		&model.ExceptionOrder{},
		&model.RiderLocation{},
		&model.PricingRule{},
		&model.Notification{},
		&model.WalletRecord{},
	)

	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	initDefaultData()
	log.Println("Database initialized successfully")
}

func initDefaultData() {
	var count int64
	DB.Model(&model.Admin{}).Count(&count)
	if count == 0 {
		admin := &model.Admin{
			Username: "admin",
			Password: "$2a$14$y0Xy1Xy2Xy3Xy4Xy5Xy6Xy7Xy8Xy9Xy0Xy1Xy2Xy3Xy4Xy5Xy6X",
			RealName: "超级管理员",
			Role:     2,
			Status:   1,
		}
		DB.Create(admin)
	}

	var pricingCount int64
	DB.Model(&model.PricingRule{}).Count(&pricingCount)
	if pricingCount == 0 {
		rules := []model.PricingRule{
			{
				Name:          "常规时段",
				BasePrice:     8.0,
				BaseDistance:  3.0,
				DistancePrice: 2.0,
				BaseWeight:    5.0,
				WeightPrice:   1.0,
				TimeSurcharge: 0,
				IsEnabled:     true,
				Priority:      0,
			},
			{
				Name:          "高峰时段",
				BasePrice:     8.0,
				BaseDistance:  3.0,
				DistancePrice: 2.5,
				BaseWeight:    5.0,
				WeightPrice:   1.5,
				TimeSurcharge: 3.0,
				StartTime:     "07:00",
				EndTime:       "09:00",
				IsEnabled:     true,
				Priority:      1,
			},
			{
				Name:          "午间高峰",
				BasePrice:     8.0,
				BaseDistance:  3.0,
				DistancePrice: 2.5,
				BaseWeight:    5.0,
				WeightPrice:   1.5,
				TimeSurcharge: 3.0,
				StartTime:     "11:00",
				EndTime:       "13:00",
				IsEnabled:     true,
				Priority:      1,
			},
			{
				Name:          "晚间高峰",
				BasePrice:     8.0,
				BaseDistance:  3.0,
				DistancePrice: 2.5,
				BaseWeight:    5.0,
				WeightPrice:   1.5,
				TimeSurcharge: 3.0,
				StartTime:     "17:00",
				EndTime:       "19:00",
				IsEnabled:     true,
				Priority:      1,
			},
			{
				Name:          "夜间时段",
				BasePrice:     10.0,
				BaseDistance:  3.0,
				DistancePrice: 3.0,
				BaseWeight:    5.0,
				WeightPrice:   2.0,
				TimeSurcharge: 5.0,
				StartTime:     "22:00",
				EndTime:       "06:00",
				IsEnabled:     true,
				Priority:      2,
			},
		}
		DB.Create(&rules)
	}
}
