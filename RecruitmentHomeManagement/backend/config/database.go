package config

import (
	"log"
	"recruithub/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	cfg := LoadConfig()
	db, err := gorm.Open(sqlite.Open(cfg.DBPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Company{},
		&models.Job{},
		&models.JobSeeker{},
		&models.Application{},
		&models.Blog{},
		&models.BrowsingHistory{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	seedData(db)

	DB = db
	return db
}

func seedData(db *gorm.DB) {
	var adminCount int64
	db.Model(&models.User{}).Where("role = ?", models.RoleAdmin).Count(&adminCount)
	if adminCount == 0 {
		admin := models.User{
			Username: "admin",
			Password: "admin123",
			Email:    "admin@recruithub.com",
			Role:     models.RoleAdmin,
			Name:     "系统管理员",
		}
		db.Create(&admin)
		log.Println("Created default admin user: admin/admin123")
	}

	var userCount int64
	db.Model(&models.User{}).Where("role = ?", models.RoleUser).Count(&userCount)
	if userCount == 0 {
		users := []models.User{
			{
				Username:   "zhangsan",
				Password:   "123456",
				Email:      "zhangsan@test.com",
				Role:       models.RoleUser,
				Name:       "张三",
				Skills:     "Java,Go,Python",
				City:       "北京",
				Experience: 5,
			},
			{
				Username:   "lisi",
				Password:   "123456",
				Email:      "lisi@test.com",
				Role:       models.RoleUser,
				Name:       "李四",
				Skills:     "React,Vue,TypeScript",
				City:       "上海",
				Experience: 3,
			},
		}
		db.Create(&users)
		log.Println("Created test users")
	}

	var companyCount int64
	db.Model(&models.User{}).Where("role = ?", models.RoleCompany).Count(&companyCount)
	if companyCount == 0 {
		companies := []models.User{
			{
				Username: "alibaba",
				Password: "123456",
				Email:    "hr@alibaba.com",
				Role:     models.RoleCompany,
				Name:     "阿里巴巴",
			},
			{
				Username: "tencent",
				Password: "123456",
				Email:    "hr@tencent.com",
				Role:     models.RoleCompany,
				Name:     "腾讯",
			},
		}
		db.Create(&companies)
		log.Println("Created test company accounts")

		companyDetails := []models.Company{
			{
				UserID:      4,
				Name:        "阿里巴巴集团",
				Industry:    "互联网",
				Scale:       "10000人以上",
				City:        "杭州",
				IsFamous:    true,
				Verified:    true,
				Description: "阿里巴巴集团是全球知名的电子商务公司",
			},
			{
				UserID:      5,
				Name:        "腾讯科技",
				Industry:    "互联网",
				Scale:       "10000人以上",
				City:        "深圳",
				IsFamous:    true,
				Verified:    true,
				Description: "腾讯是中国领先的互联网公司",
			},
		}
		db.Create(&companyDetails)
		log.Println("Created test companies")
	}

	var jobCount int64
	db.Model(&models.Job{}).Count(&jobCount)
	if jobCount == 0 {
		jobs := []models.Job{
			{
				CompanyID:    1,
				Title:        "高级后端开发工程师",
				SalaryMin:    30000,
				SalaryMax:    50000,
				City:         "杭州",
				Experience:   "3-5年",
				Education:    "本科",
				Description:  "负责电商平台核心系统开发",
				Requirements: "Java/Go经验，分布式系统经验",
				Benefits:     "五险一金，股票期权",
			},
			{
				CompanyID:    1,
				Title:        "前端开发工程师",
				SalaryMin:    20000,
				SalaryMax:    35000,
				City:         "杭州",
				Experience:   "1-3年",
				Education:    "本科",
				Description:  "负责电商前端页面开发",
				Requirements: "React/Vue熟练",
				Benefits:     "五险一金，年终奖金",
			},
			{
				CompanyID:    2,
				Title:        "游戏开发工程师",
				SalaryMin:    25000,
				SalaryMax:    40000,
				City:         "深圳",
				Experience:   "3-5年",
				Education:    "本科",
				Description:  "负责游戏核心功能开发",
				Requirements: "C++/C#经验",
				Benefits:     "游戏内购提成",
			},
			{
				CompanyID:    2,
				Title:        "产品经理",
				SalaryMin:    30000,
				SalaryMax:    50000,
				City:         "深圳",
				Experience:   "5年以上",
				Education:    "硕士",
				Description:  "负责社交产品规划",
				Requirements: "5年以上产品经验",
				Benefits:     "股票期权",
			},
			{
				CompanyID:    1,
				Title:        "数据分析师",
				SalaryMin:    20000,
				SalaryMax:    35000,
				City:         "杭州",
				Experience:   "1-3年",
				Education:    "本科",
				Description:  "负责业务数据分析",
				Requirements: "SQL/Python熟练",
				Benefits:     "年终奖金",
			},
		}
		db.Create(&jobs)
		log.Println("Created test jobs")
	}

	var blogCount int64
	db.Model(&models.Blog{}).Count(&blogCount)
	if blogCount == 0 {
		blogs := []models.Blog{
			{
				UserID:  1,
				Title:   "如何在面试中脱颖而出",
				Content: "面试是求职过程中最重要的环节之一。本文将分享一些面试技巧，帮助你在众多求职者中脱颖而出。首先，要充分了解公司背景和职位要求；其次，准备好常见问题的答案；最后，保持自信和积极的态度。",
				Tags:    "面试,求职,技巧",
				Status:  2,
			},
			{
				UserID:  1,
				Title:   "程序员简历撰写指南",
				Content: "好的简历是获得面试机会的敲门砖。程序员的简历应该突出技术能力和项目经验。建议使用清晰的结构，列出技术栈、项目经历、教育背景等关键信息。",
				Tags:    "简历,程序员,求职",
				Status:  2,
			},
			{
				UserID:  2,
				Title:   "职场新人如何快速成长",
				Content: "刚入职场的新人往往会感到迷茫。本文分享几个快速成长的秘诀：主动学习、多问问题、积极承担责任、建立良好的人际关系。",
				Tags:    "职场,成长,新人",
				Status:  2,
			},
		}
		db.Create(&blogs)
		log.Println("Created test blogs")
	}
}
