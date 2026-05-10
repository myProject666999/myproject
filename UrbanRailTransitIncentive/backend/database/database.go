package database

import (
	"fmt"
	"log"

	"urbanrail/config"
	"urbanrail/models"
	"urbanrail/utils"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() error {
	cfg := config.AppConfig
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	DB = db
	log.Println("数据库连接成功")
	return nil
}

func AutoMigrate() error {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Admin{},
		&models.Publisher{},
		&models.TaskType{},
		&models.Task{},
		&models.TaskAssignment{},
		&models.TaskResult{},
		&models.Favorite{},
		&models.Banner{},
		&models.Announcement{},
		&models.Comment{},
	)
	if err != nil {
		return err
	}
	log.Println("数据库迁移完成")
	return nil
}

func SeedData() error {
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		hashedPassword, err := utils.HashPassword("123456")
		if err != nil {
			log.Printf("密码加密失败: %v", err)
			return err
		}
		admin := models.Admin{
			Username: "admin",
			Password: hashedPassword,
			Email:    "admin@example.com",
			Nickname: "系统管理员",
			Role:     "super_admin",
			Status:   1,
		}
		if err := DB.Create(&admin).Error; err != nil {
			return err
		}
		log.Println("默认管理员创建成功: admin/123456")
	}

	DB.Model(&models.TaskType{}).Count(&count)
	if count == 0 {
		taskTypes := []models.TaskType{
			{Name: "站点调查", Description: "对地铁站点进行实地调查", SortOrder: 1, Status: 1},
			{Name: "客流统计", Description: "统计地铁站客流量", SortOrder: 2, Status: 1},
			{Name: "设施检查", Description: "检查地铁站点设施状况", SortOrder: 3, Status: 1},
			{Name: "服务评价", Description: "评价地铁服务质量", SortOrder: 4, Status: 1},
		}
		if err := DB.Create(&taskTypes).Error; err != nil {
			return err
		}
		log.Println("默认任务类型创建成功")
	}

	DB.Model(&models.Publisher{}).Count(&count)
	if count == 0 {
		publishers := []models.Publisher{
			{Name: "城市轨道交通管理局", Contact: "张经理", Phone: "13800138001", Email: "metro@example.com", Status: 1},
			{Name: "交通研究院", Contact: "李研究员", Phone: "13800138002", Email: "research@example.com", Status: 1},
		}
		if err := DB.Create(&publishers).Error; err != nil {
			return err
		}
		log.Println("默认发布者创建成功")
	}

	return nil
}
