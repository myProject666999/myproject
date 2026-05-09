package config

import (
	"log"

	"student-recommendation-platform/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("student_recommendation.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	err = DB.AutoMigrate(
		&models.Admin{},
		&models.User{},
		&models.News{},
		&models.CampusStory{},
		&models.Notice{},
		&models.SystemSetting{},
		&models.Message{},
		&models.Carousel{},
		&models.Category{},
		&models.Book{},
		&models.KnowledgePoint{},
		&models.Course{},
		&models.Comment{},
		&models.Favorite{},
		&models.Demand{},
	)

	if err != nil {
		log.Println("Migration failed:", err)
		return
	}

	seedData(DB)
	log.Println("Database initialized successfully")
}

func seedData(db *gorm.DB) {
	var adminCount int64
	db.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		db.Create(&models.Admin{
			Username: "admin",
			Password: "admin123",
			Name:     "超级管理员",
		})
	}

	var categoryCount int64
	db.Model(&models.Category{}).Count(&categoryCount)
	if categoryCount == 0 {
		categories := []models.Category{
			{Name: "计算机科学", Type: "all"},
			{Name: "数学", Type: "all"},
			{Name: "英语", Type: "all"},
			{Name: "文学", Type: "all"},
		}
		db.Create(&categories)
	}

	var bookCount int64
	db.Model(&models.Book{}).Count(&bookCount)
	if bookCount == 0 {
		books := []models.Book{
			{
				Title:       "算法导论",
				Author:      "Thomas H. Cormen",
				CategoryID:  1,
				Description: "经典的算法教材，全面介绍计算机算法的设计与分析",
				Cover:       "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
				Views:       1250,
			},
			{
				Title:       "高等数学",
				Author:      "同济大学数学系",
				CategoryID:  2,
				Description: "全国通用的高等数学教材，内容详实，例题丰富",
				Cover:       "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
				Views:       980,
			},
			{
				Title:       "新概念英语",
				Author:      "L.G. Alexander",
				CategoryID:  3,
				Description: "经典英语学习教材，适合各阶段学习者",
				Cover:       "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
				Views:       1560,
			},
		}
		db.Create(&books)
	}

	var knowledgeCount int64
	db.Model(&models.KnowledgePoint{}).Count(&knowledgeCount)
	if knowledgeCount == 0 {
		knowledges := []models.KnowledgePoint{
			{
				Title:       "快速排序算法",
				CategoryID:  1,
				Content:     "快速排序是一种高效的排序算法，采用分治策略。平均时间复杂度O(nlogn)，最坏情况O(n²)。",
				Views:       890,
			},
			{
				Title:       "微分方程基础",
				CategoryID:  2,
				Content:     "微分方程是包含未知函数及其导数的方程。常见类型：一阶线性微分方程、二阶常系数齐次微分方程等。",
				Views:       720,
			},
		}
		db.Create(&knowledges)
	}

	var courseCount int64
	db.Model(&models.Course{}).Count(&courseCount)
	if courseCount == 0 {
		courses := []models.Course{
			{
				Title:       "数据结构与算法",
				Teacher:     "张教授",
				CategoryID:  1,
				Description: "系统学习常用数据结构和经典算法",
				Cover:       "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
				Views:       2340,
			},
			{
				Title:       "线性代数",
				Teacher:     "李教授",
				CategoryID:  2,
				Description: "学习矩阵运算、向量空间、特征值等内容",
				Cover:       "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
				Views:       1890,
			},
		}
		db.Create(&courses)
	}

	var newsCount int64
	db.Model(&models.News{}).Count(&newsCount)
	if newsCount == 0 {
		news := []models.News{
			{
				Title:   "2024年春季学期开学通知",
				Content: "全体师生请注意，2024年春季学期将于2月26日正式开学，请各位同学提前做好返校准备。",
			},
			{
				Title:   "图书馆延长开放时间",
				Content: "为了更好地服务广大师生，图书馆自即日起延长开放时间，周一至周五开放至22:00。",
			},
		}
		db.Create(&news)
	}

	var carouselCount int64
	db.Model(&models.Carousel{}).Count(&carouselCount)
	if carouselCount == 0 {
		carousels := []models.Carousel{
			{
				Title: "欢迎来到学生推荐平台",
				Image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",
				Link:  "/",
				Sort:  1,
			},
			{
				Title: "精选课程推荐",
				Image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200",
				Link:  "/courses",
				Sort:  2,
			},
			{
				Title: "海量书籍等你发现",
				Image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200",
				Link:  "/books",
				Sort:  3,
			},
		}
		db.Create(&carousels)
	}
}
