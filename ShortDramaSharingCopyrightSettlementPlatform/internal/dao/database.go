package dao

import (
	"fmt"
	"log"
	"short-drama-platform/internal/config"
	"short-drama-platform/internal/model"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() error {
	cfg := config.AppConfig.Database

	dsn := cfg.DSNWithoutDB()
	tempDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return fmt.Errorf("connect to mysql error: %w", err)
	}

	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;", cfg.DBName)
	if err := tempDB.Exec(createDBSQL).Error; err != nil {
		return fmt.Errorf("create database error: %w", err)
	}

	sqlDB, err := tempDB.DB()
	if err == nil {
		sqlDB.Close()
	}

	dsn = cfg.DSN()
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("connect to database error: %w", err)
	}

	sqlDB, err = DB.DB()
	if err != nil {
		return fmt.Errorf("get sql db error: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Database connected successfully")
	return nil
}

func AutoMigrate() error {
	err := DB.AutoMigrate(
		&model.User{},
		&model.Drama{},
		&model.StakeholderType{},
		&model.Stakeholder{},
		&model.DramaRight{},
		&model.ProfitShareRule{},
		&model.DramaRuleRelation{},
		&model.PlayData{},
		&model.PaymentData{},
		&model.ShareCalculationTask{},
		&model.ShareDetail{},
		&model.SettlementOrder{},
		&model.SettlementOrderDetail{},
		&model.ReconciliationRecord{},
		&model.ReconciliationDetail{},
		&model.CopyrightAuthorization{},
		&model.OperationLog{},
	)
	if err != nil {
		return fmt.Errorf("auto migrate error: %w", err)
	}

	initSeedData()
	log.Println("Database migration completed")
	return nil
}

func initSeedData() {
	var count int64
	DB.Model(&model.StakeholderType{}).Count(&count)
	if count == 0 {
		types := []model.StakeholderType{
			{TypeCode: "PLATFORM", TypeName: "平台方", Description: "短剧播放平台", SortOrder: 1},
			{TypeCode: "PRODUCER", TypeName: "出品方", Description: "剧集出品公司", SortOrder: 2},
			{TypeCode: "SCREENWRITER", TypeName: "编剧", Description: "剧集编剧", SortOrder: 3},
			{TypeCode: "DIRECTOR", TypeName: "导演", Description: "剧集导演", SortOrder: 4},
			{TypeCode: "ACTOR", TypeName: "演员", Description: "参演演员", SortOrder: 5},
			{TypeCode: "OTHER", TypeName: "其他", Description: "其他权益方", SortOrder: 99},
		}
		DB.Create(&types)
	}

	adminPasswordHash := "$2a$10$F6/8ByueWOsVCGIXqiuNGe9vXqeWitQpPNGZK2l8oLeNeC4D2x79a"
	DB.Model(&model.User{}).Where("username = ?", "admin").Count(&count)
	if count == 0 {
		admin := &model.User{
			Username: "admin",
			Password: adminPasswordHash,
			RealName: "系统管理员",
			Role:     3,
			Status:   1,
		}
		DB.Create(admin)
	} else {
		DB.Model(&model.User{}).Where("username = ?", "admin").Update("password", adminPasswordHash)
	}
}
