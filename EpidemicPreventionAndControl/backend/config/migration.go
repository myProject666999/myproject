package config

import (
	"epidemic/models"
	"log"
)

func MigrateDB() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Hospital{},
		&models.Manufacturer{},
		&models.Volunteer{},
		&models.Activity{},
		&models.Announcement{},
		&models.Finance{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migration completed")
}

func SeedData() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	admin := &models.User{
		LoginName: "admin",
		Name:      "系统管理员",
		Role:      "admin",
		Phone:     "13800000001",
		Email:     "admin@epidemic.com",
		Status:    1,
	}
	admin.SetPassword("admin123")
	DB.Create(admin)

	volunteer := &models.Volunteer{
		LoginName: "volunteer1",
		Name:      "张三",
		Gender:    "男",
		Age:       28,
		Phone:     "13800000002",
		Email:     "zhangsan@example.com",
		Address:   "北京市朝阳区",
		Skills:    "医疗护理",
		Status:    1,
	}
	volunteer.SetPassword("123456")
	DB.Create(volunteer)

	hospitals := []models.Hospital{
		{Name: "北京协和医院", Address: "北京市东城区", Level: "三级甲等", Phone: "010-12345678", Director: "张院长", Capacity: 2000, Status: 1},
		{Name: "上海瑞金医院", Address: "上海市黄浦区", Level: "三级甲等", Phone: "021-87654321", Director: "李院长", Capacity: 1500, Status: 1},
		{Name: "广州中山医院", Address: "广州市越秀区", Level: "三级甲等", Phone: "020-11112222", Director: "王院长", Capacity: 1800, Status: 1},
	}
	for _, h := range hospitals {
		DB.Create(&h)
	}

	manufacturers := []models.Manufacturer{
		{Name: "国药集团", Address: "北京市海淀区", Contact: "刘经理", Phone: "010-55556666", Business: "医疗物资生产", Status: 1},
		{Name: "科兴生物", Address: "北京市昌平区", Contact: "陈经理", Phone: "010-77778888", Business: "疫苗研发生产", Status: 1},
		{Name: "复星医药", Address: "上海市浦东新区", Contact: "赵经理", Phone: "021-99990000", Business: "药品生产", Status: 1},
	}
	for _, m := range manufacturers {
		DB.Create(&m)
	}

	activities := []models.Activity{
		{Title: "新冠疫苗接种宣传", Description: "宣传新冠疫苗接种知识", Location: "社区活动中心", StartDate: "2026-05-01", EndDate: "2026-05-15", Organizer: "卫生局", MaxParticipants: 100, CurrentParticipants: 45, Status: 1},
		{Title: "核酸检测志愿服务", Description: "协助核酸检测工作", Location: "各检测点", StartDate: "2026-05-10", EndDate: "2026-06-10", Organizer: "疾控中心", MaxParticipants: 50, CurrentParticipants: 30, Status: 1},
		{Title: "抗疫物资分发", Description: "分发抗疫物资给居民", Location: "各社区", StartDate: "2026-05-05", EndDate: "2026-05-20", Organizer: "民政局", MaxParticipants: 80, CurrentParticipants: 60, Status: 1},
	}
	for _, a := range activities {
		DB.Create(&a)
	}

	announcements := []models.Announcement{
		{Title: "关于加强疫情防控的通知", Content: "请广大居民积极配合疫情防控工作，遵守防疫规定。", Author: "管理员", IsPublished: true},
		{Title: "疫苗接种须知", Content: "接种疫苗前请如实告知健康状况，接种后留观30分钟。", Author: "管理员", IsPublished: true},
		{Title: "疫情期间出行指南", Content: "非必要不前往高风险地区，出行请注意个人防护。", Author: "管理员", IsPublished: true},
	}
	for _, a := range announcements {
		DB.Create(&a)
	}

	finances := []models.Finance{
		{Type: "收入", Amount: 50000, Description: "政府拨款", ReceiveDate: "2026-05-01"},
		{Type: "收入", Amount: 20000, Description: "社会捐赠", ReceiveDate: "2026-05-05"},
		{Type: "支出", Amount: 15000, Description: "购买防疫物资", ReceiveDate: "2026-05-03"},
		{Type: "支出", Amount: 8000, Description: "志愿者补贴", ReceiveDate: "2026-05-08"},
		{Type: "收入", Amount: 30000, Description: "企业赞助", ReceiveDate: "2026-05-10"},
		{Type: "支出", Amount: 12000, Description: "医疗设备采购", ReceiveDate: "2026-05-12"},
	}
	for _, f := range finances {
		DB.Create(&f)
	}

	log.Println("Seed data created successfully")
}
