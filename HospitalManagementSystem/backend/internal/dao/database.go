package dao

import (
	"fmt"
	"log"
	"time"

	"hospital-management-system/internal/config"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"

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

	SeedData()
}

func SeedData() {
	initRoles()
	initAdminUser()
	initDepartments()
	initRegistrationLevels()
	initSettlementCategories()
	initExpenseSubjects()
}

func initRoles() {
	var count int64
	DB.Model(&model.Role{}).Count(&count)
	if count > 0 {
		return
	}

	roles := []model.Role{
		{Name: "admin", Description: "系统管理员"},
		{Name: "doctor", Description: "医生"},
		{Name: "technician", Description: "医技医生"},
		{Name: "pharmacy", Description: "药房"},
		{Name: "reception", Description: "挂号收费"},
	}
	DB.Create(&roles)
	log.Println("角色数据初始化完成")
}

func initAdminUser() {
	var count int64
	DB.Model(&model.User{}).Where("username = ?", "admin").Count(&count)
	if count > 0 {
		return
	}

	hashedPassword, err := util.HashPassword("admin123")
	if err != nil {
		log.Printf("密码加密失败: %v", err)
		return
	}

	admin := model.User{
		Username: "admin",
		Password: hashedPassword,
		Name:     "系统管理员",
		RoleID:   1,
		Status:   1,
	}
	DB.Create(&admin)
	log.Println("管理员账号初始化完成 (admin/admin123)")
}

func initDepartments() {
	var count int64
	DB.Model(&model.Department{}).Count(&count)
	if count > 0 {
		return
	}

	departments := []model.Department{
		{Name: "内科", Code: "NK", Type: 1, Description: "内科门诊", Status: 1},
		{Name: "外科", Code: "WK", Type: 1, Description: "外科门诊", Status: 1},
		{Name: "儿科", Code: "EK", Type: 1, Description: "儿科门诊", Status: 1},
		{Name: "妇产科", Code: "FCK", Type: 1, Description: "妇产科门诊", Status: 1},
		{Name: "放射科", Code: "FSK", Type: 2, Description: "放射科检查", Status: 1},
		{Name: "检验科", Code: "JYK", Type: 2, Description: "检验科", Status: 1},
		{Name: "药房", Code: "YF", Type: 3, Description: "药房", Status: 1},
		{Name: "挂号处", Code: "GHC", Type: 3, Description: "挂号收费处", Status: 1},
	}
	DB.Create(&departments)
	log.Println("科室数据初始化完成")
}

func initRegistrationLevels() {
	var count int64
	DB.Model(&model.RegistrationLevel{}).Count(&count)
	if count > 0 {
		return
	}

	levels := []model.RegistrationLevel{
		{Name: "普通号", Price: 10.00, Description: "普通门诊号", Status: 1},
		{Name: "专家号", Price: 30.00, Description: "专家门诊号", Status: 1},
		{Name: "特需号", Price: 100.00, Description: "特需门诊号", Status: 1},
	}
	DB.Create(&levels)
	log.Println("挂号级别数据初始化完成")
}

func initSettlementCategories() {
	var count int64
	DB.Model(&model.SettlementCategory{}).Count(&count)
	if count > 0 {
		return
	}

	categories := []model.SettlementCategory{
		{Name: "自费", Description: "自费患者", Status: 1},
		{Name: "医保", Description: "城镇职工医保", Status: 1},
		{Name: "农合", Description: "新型农村合作医疗", Status: 1},
	}
	DB.Create(&categories)
	log.Println("结算类别数据初始化完成")
}

func initExpenseSubjects() {
	var count int64
	DB.Model(&model.ExpenseSubject{}).Count(&count)
	if count > 0 {
		return
	}

	subjects := []model.ExpenseSubject{
		{Name: "挂号费", Code: "GHF", Description: "挂号费用", Status: 1},
		{Name: "检查费", Code: "JCF", Description: "检查费用", Status: 1},
		{Name: "检验费", Code: "JYF", Description: "检验费用", Status: 1},
		{Name: "药品费", Code: "YPF", Description: "药品费用", Status: 1},
		{Name: "处置费", Code: "ZCF", Description: "处置费用", Status: 1},
	}
	DB.Create(&subjects)
	log.Println("费用科目数据初始化完成")
}
