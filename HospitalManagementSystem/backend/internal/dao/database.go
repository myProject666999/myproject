package dao

import (
	"fmt"
	"log"
	"time"

	"hospital-management-system/internal/config"
	"hospital-management-system/internal/model"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	cfg := config.AppConfig.Database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=%s&parseTime=True&loc=Local",
		cfg.User,
		cfg.Password,
		cfg.Host,
		cfg.Port,
		cfg.DBName,
		cfg.Charset,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("连接数据库失败: %v", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("获取数据库连接失败: %v", err)
	}

	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("数据库连接成功")
}

func AutoMigrate() {
	DB.AutoMigrate(
		&model.Role{},
		&model.User{},
		&model.Department{},
		&model.RegistrationLevel{},
		&model.SettlementCategory{},
		&model.DiagnosisCatalog{},
		&model.ChargeItem{},
		&model.ExpenseSubject{},
		&model.Medicine{},
		&model.DoctorSchedule{},
		&model.Patient{},
		&model.Registration{},
		&model.MedicalRecord{},
		&model.ExaminationRequest{},
		&model.LaboratoryRequest{},
		&model.Prescription{},
		&model.PrescriptionItem{},
		&model.TreatmentRequest{},
		&model.FeeItem{},
		&model.WorkloadStatistic{},
		&model.DailySettlement{},
	)
}
