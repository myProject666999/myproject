package config

import (
	"log"
	"student_quality_system/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	cfg := LoadConfig()
	var err error
	
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	
	log.Println("Database connected successfully")
	
	err = DB.AutoMigrate(
		&models.User{},
		&models.Teacher{},
		&models.Student{},
		&models.Grade{},
		&models.RewardPunishment{},
		&models.AbilityPoint{},
		&models.Evaluation{},
		&models.Message{},
		&models.Permission{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	
	log.Println("Database migration completed")
	
	seedDefaultData()
	
	return DB
}

func seedDefaultData() {
	seedDefaultUsers()
	seedDefaultPermissions()
	log.Println("Default data seeded successfully")
}

func seedDefaultUsers() {
	users := []struct {
		Username string
		Password string
		Role     string
		RealName string
		Email    string
		Phone    string
	}{
		{"admin", "123456", "admin", "系统管理员", "admin@example.com", "13800138000"},
		{"teacher01", "123456", "teacher", "张老师", "teacher@example.com", "13900139000"},
		{"student01", "123456", "student", "李学生", "student@example.com", "13700137000"},
	}
	
	for _, u := range users {
		var existingUser models.User
		result := DB.Where("username = ?", u.Username).First(&existingUser)
		
		if result.Error == nil {
			existingUser.SetPassword(u.Password)
			existingUser.Role = u.Role
			existingUser.RealName = u.RealName
			existingUser.Email = u.Email
			existingUser.Phone = u.Phone
			DB.Save(&existingUser)
			log.Printf("Updated user: %s (%s)", u.Username, u.Role)
		} else {
			user := models.User{
				Username: u.Username,
				Role:     u.Role,
				RealName: u.RealName,
				Email:    u.Email,
				Phone:    u.Phone,
			}
			user.SetPassword(u.Password)
			DB.Create(&user)
			log.Printf("Created user: %s (%s)", u.Username, u.Role)
		}
	}
}

func seedDefaultPermissions() {
	var count int64
	DB.Model(&models.Permission{}).Count(&count)
	if count > 0 {
		log.Println("Permissions already exist, skipping seeding")
		return
	}
	
	permissions := []models.Permission{
		{Role: "admin", Module: "personal", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "rewards", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "messages", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "ability", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "evaluation", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "grades", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "teachers", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "students", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "admin", Module: "permissions", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		
		{Role: "teacher", Module: "personal", CanView: true, CanCreate: false, CanUpdate: true, CanDelete: false},
		{Role: "teacher", Module: "grades", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "teacher", Module: "teachers", CanView: true, CanCreate: false, CanUpdate: true, CanDelete: false},
		{Role: "teacher", Module: "students", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: false},
		{Role: "teacher", Module: "rewards", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "teacher", Module: "messages", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "teacher", Module: "ability", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		{Role: "teacher", Module: "evaluation", CanView: true, CanCreate: true, CanUpdate: true, CanDelete: true},
		
		{Role: "student", Module: "personal", CanView: true, CanCreate: false, CanUpdate: true, CanDelete: false},
		{Role: "student", Module: "grades", CanView: true, CanCreate: false, CanUpdate: false, CanDelete: false},
		{Role: "student", Module: "messages", CanView: true, CanCreate: true, CanUpdate: false, CanDelete: false},
	}
	
	for _, p := range permissions {
		DB.Create(&p)
	}
	log.Println("Created default permissions")
}
