package database

import (
	"college-academic/config"
	"college-academic/models"
	"college-academic/utils"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(mysql.Open(config.GetDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	err = DB.AutoMigrate(
		&models.Admin{},
		&models.Student{},
		&models.Service{},
		&models.Appointment{},
		&models.Knowledge{},
		&models.Message{},
		&models.News{},
		&models.Banner{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Database migrated successfully")
	initSeedData()
}

func initSeedData() {
	var admin models.Admin
	result := DB.Where("username = ?", "admin").First(&admin)
	
	if result.Error == gorm.ErrRecordNotFound {
		hashedPassword, err := utils.HashPassword("admin123")
		if err != nil {
			log.Printf("Failed to hash password: %v", err)
			return
		}
		
		newAdmin := models.Admin{
			Username: "admin",
			Password: hashedPassword,
			RealName: "系统管理员",
		}
		DB.Create(&newAdmin)
		log.Println("Default admin created: admin / admin123")
	} else if result.Error == nil {
		hashedPassword, err := utils.HashPassword("admin123")
		if err == nil {
			admin.Password = hashedPassword
			admin.RealName = "系统管理员"
			DB.Save(&admin)
			log.Println("Default admin password reset: admin / admin123")
		} else {
			log.Printf("Failed to hash password: %v", err)
		}
	}

	var serviceCount int64
	DB.Model(&models.Service{}).Count(&serviceCount)
	if serviceCount == 0 {
		services := []models.Service{
			{
				Title:       "职业规划咨询",
				Category:    "职业规划",
				Consultant:  "张顾问",
				Duration:    "60分钟",
				Price:       200,
				Description: "一对一职业规划指导，帮助你明确职业方向",
				Content:     "通过专业的职业测评和一对一咨询，帮助你了解自己的兴趣、能力和价值观，制定清晰的职业发展规划。\n\n服务内容：\n1. 职业兴趣与能力测评\n2. 行业与职业探索\n3. 职业目标制定\n4. 发展路径规划",
				Status:      1,
			},
			{
				Title:       "学业选课指导",
				Category:    "学业指导",
				Consultant:  "李顾问",
				Duration:    "45分钟",
				Price:       150,
				Description: "专业课程选择建议，优化你的学习计划",
				Content:     "根据你的专业方向、职业目标和个人兴趣，帮助你合理选择课程，制定最优的学习计划。\n\n服务内容：\n1. 课程体系解读\n2. 选课策略分析\n3. 学习计划制定\n4. 时间管理建议",
				Status:      1,
			},
			{
				Title:       "考研规划咨询",
				Category:    "考研咨询",
				Consultant:  "王顾问",
				Duration:    "90分钟",
				Price:       300,
				Description: "考研备考全流程指导，助你成功上岸",
				Content:     "从院校选择、专业定位到复习计划制定，提供全方位的考研规划指导。\n\n服务内容：\n1. 院校与专业选择\n2. 复习计划制定\n3. 备考资料推荐\n4. 心理调适指导",
				Status:      1,
			},
			{
				Title:       "留学申请指导",
				Category:    "留学指导",
				Consultant:  "赵顾问",
				Duration:    "120分钟",
				Price:       500,
				Description: "出国留学申请规划，专业文书修改",
				Content:     "提供从选校定位到文书写作的全套留学申请指导服务。\n\n服务内容：\n1. 国家与院校选择\n2. 申请材料准备\n3. 个人陈述指导\n4. 推荐信建议",
				Status:      1,
			},
		}
		DB.Create(&services)
		log.Println("Default services created")
	}

	var knowledgeCount int64
	DB.Model(&models.Knowledge{}).Count(&knowledgeCount)
	if knowledgeCount == 0 {
		knowledges := []models.Knowledge{
			{
				Title:    "大学生如何制定合理的学业计划",
				Category: "学业规划",
				Summary:  "制定合理的学业计划是大学生成功的第一步",
				Content:  "一、了解自己的目标\n\n在制定学业计划之前，首先要明确自己的长期和短期目标。\n\n二、分析课程要求\n\n仔细阅读专业培养方案，了解必修课程和选修课程的要求。\n\n三、合理安排时间\n\n制定每周的学习时间表，确保每门课程都有足够的学习时间。\n\n四、定期评估调整\n\n每学期末对学业计划进行评估，根据实际情况进行调整。",
				Views:    100,
				Status:   1,
			},
			{
				Title:    "职业规划从大一开始",
				Category: "职业发展",
				Summary:  "职业规划不是大四才要考虑的事情，应该从大一开始",
				Content:  "很多同学认为职业规划是大四才需要考虑的事情，其实不然。职业规划应该从大一开始，贯穿整个大学生涯。\n\n大一：探索期\n- 了解自己的兴趣和能力\n- 参加各种社团活动\n- 开始接触不同行业\n\n大二：定向期\n- 确定初步职业方向\n- 参加相关实习\n- 考取相关证书\n\n大三：提升期\n- 深入学习专业知识\n- 积累实践经验\n- 建立职业人脉\n\n大四：冲刺期\n- 完善简历\n- 准备面试\n- 签约就业",
				Views:    150,
				Status:   1,
			},
			{
				Title:    "考研还是就业？如何做出正确选择",
				Category: "升学就业",
				Summary:  "面对考研和就业的选择，很多同学感到迷茫",
				Content:  "考研和就业各有利弊，需要根据个人情况做出选择。\n\n考研的优势：\n- 深入学习专业知识\n- 提升学历背景\n- 增加就业竞争力\n\n就业的优势：\n- 提前积累工作经验\n- 经济独立\n- 更早了解职场\n\n如何选择：\n1. 评估自己的职业目标\n2. 分析专业特点\n3. 考虑家庭经济状况\n4. 咨询学长学姐和老师",
				Views:    200,
				Status:   1,
			},
		}
		DB.Create(&knowledges)
		log.Println("Default knowledge created")
	}
}
