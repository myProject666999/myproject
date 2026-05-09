package config

import (
	"log"
	"strings"
	"sync"
	"time"

	"student-recommendation-platform/models"
)

var DB *MockDB

type MockDB struct {
	mu sync.Mutex

	Admins         map[uint]models.Admin
	AdminIDCounter uint

	Users         map[uint]models.User
	UserIDCounter uint

	News         map[uint]models.News
	NewsIDCounter uint

	CampusStories         map[uint]models.CampusStory
	CampusStoryIDCounter uint

	Notices         map[uint]models.Notice
	NoticeIDCounter uint

	SystemSettings map[string]models.SystemSetting

	Messages         map[uint]models.Message
	MessageIDCounter uint

	Carousels         map[uint]models.Carousel
	CarouselIDCounter uint

	Categories         map[uint]models.Category
	CategoryIDCounter uint

	Books         map[uint]models.Book
	BookIDCounter uint

	KnowledgePoints         map[uint]models.KnowledgePoint
	KnowledgePointIDCounter uint

	Courses         map[uint]models.Course
	CourseIDCounter uint

	Comments         map[uint]models.Comment
	CommentIDCounter uint

	Favorites         map[uint]models.Favorite
	FavoriteIDCounter uint

	Demands         map[uint]models.Demand
	DemandIDCounter uint
}

func InitDB() {
	DB = &MockDB{
		Admins:           make(map[uint]models.Admin),
		Users:            make(map[uint]models.User),
		News:             make(map[uint]models.News),
		CampusStories:    make(map[uint]models.CampusStory),
		Notices:          make(map[uint]models.Notice),
		SystemSettings:   make(map[string]models.SystemSetting),
		Messages:         make(map[uint]models.Message),
		Carousels:        make(map[uint]models.Carousel),
		Categories:       make(map[uint]models.Category),
		Books:            make(map[uint]models.Book),
		KnowledgePoints:  make(map[uint]models.KnowledgePoint),
		Courses:          make(map[uint]models.Course),
		Comments:         make(map[uint]models.Comment),
		Favorites:        make(map[uint]models.Favorite),
		Demands:          make(map[uint]models.Demand),
	}

	seedMockData()
	log.Println("Mock Database initialized successfully")
}

func (db *MockDB) Lock()   { db.mu.Lock() }
func (db *MockDB) Unlock() { db.mu.Unlock() }

func (db *MockDB) GetCategory(id uint) models.Category {
	return db.Categories[id]
}

func (db *MockDB) GetUser(id uint) models.User {
	return db.Users[id]
}

func seedMockData() {
	now := time.Now()

	DB.AdminIDCounter = 1
	DB.Admins[1] = models.Admin{
		ID:        1,
		Username:  "admin",
		Password:  "admin123",
		Name:      "超级管理员",
		CreatedAt: now,
		UpdatedAt: now,
	}

	DB.CategoryIDCounter = 4
	DB.Categories[1] = models.Category{ID: 1, Name: "计算机科学", Type: "all", CreatedAt: now, UpdatedAt: now}
	DB.Categories[2] = models.Category{ID: 2, Name: "数学", Type: "all", CreatedAt: now, UpdatedAt: now}
	DB.Categories[3] = models.Category{ID: 3, Name: "英语", Type: "all", CreatedAt: now, UpdatedAt: now}
	DB.Categories[4] = models.Category{ID: 4, Name: "文学", Type: "all", CreatedAt: now, UpdatedAt: now}

	DB.BookIDCounter = 3
	DB.Books[1] = models.Book{
		ID:          1,
		Title:       "算法导论",
		Author:      "Thomas H. Cormen",
		CategoryID:  1,
		Description: "经典的算法教材，全面介绍计算机算法的设计与分析",
		Cover:       "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400",
		Views:       1250,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	DB.Books[2] = models.Book{
		ID:          2,
		Title:       "高等数学",
		Author:      "同济大学数学系",
		CategoryID:  2,
		Description: "全国通用的高等数学教材，内容详实，例题丰富",
		Cover:       "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400",
		Views:       980,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	DB.Books[3] = models.Book{
		ID:          3,
		Title:       "新概念英语",
		Author:      "L.G. Alexander",
		CategoryID:  3,
		Description: "经典英语学习教材，适合各阶段学习者",
		Cover:       "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
		Views:       1560,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	DB.KnowledgePointIDCounter = 2
	DB.KnowledgePoints[1] = models.KnowledgePoint{
		ID:         1,
		Title:      "快速排序算法",
		CategoryID: 1,
		Content:    "快速排序是一种高效的排序算法，采用分治策略。平均时间复杂度O(nlogn)，最坏情况O(n²)。",
		Views:      890,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	DB.KnowledgePoints[2] = models.KnowledgePoint{
		ID:         2,
		Title:      "微分方程基础",
		CategoryID: 2,
		Content:    "微分方程是包含未知函数及其导数的方程。常见类型：一阶线性微分方程、二阶常系数齐次微分方程等。",
		Views:      720,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	DB.CourseIDCounter = 2
	DB.Courses[1] = models.Course{
		ID:          1,
		Title:       "数据结构与算法",
		Teacher:     "张教授",
		CategoryID:  1,
		Description: "系统学习常用数据结构和经典算法",
		Cover:       "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
		Views:       2340,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	DB.Courses[2] = models.Course{
		ID:          2,
		Title:       "线性代数",
		Teacher:     "李教授",
		CategoryID:  2,
		Description: "学习矩阵运算、向量空间、特征值等内容",
		Cover:       "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
		Views:       1890,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	DB.NewsIDCounter = 2
	DB.News[1] = models.News{
		ID:        1,
		Title:     "2024年春季学期开学通知",
		Content:   "全体师生请注意，2024年春季学期将于2月26日正式开学，请各位同学提前做好返校准备。",
		Views:     150,
		CreatedAt: now,
		UpdatedAt: now,
	}
	DB.News[2] = models.News{
		ID:        2,
		Title:     "图书馆延长开放时间",
		Content:   "为了更好地服务广大师生，图书馆自即日起延长开放时间，周一至周五开放至22:00。",
		Views:     89,
		CreatedAt: now,
		UpdatedAt: now,
	}

	DB.NoticeIDCounter = 2
	DB.Notices[1] = models.Notice{
		ID:        1,
		Title:     "期末考试安排通知",
		Content:   "本学期期末考试将于第19周进行，请同学们做好复习准备。",
		Views:     230,
		CreatedAt: now,
		UpdatedAt: now,
	}
	DB.Notices[2] = models.Notice{
		ID:        2,
		Title:     "校园招聘会即将举行",
		Content:   "2024届毕业生校园招聘会将于5月15日在体育馆举行，届时将有百余家企业参与。",
		Views:     180,
		CreatedAt: now,
		UpdatedAt: now,
	}

	DB.CarouselIDCounter = 3
	DB.Carousels[1] = models.Carousel{
		ID:        1,
		Title:     "欢迎来到学生推荐平台",
		Image:     "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",
		Link:      "/",
		Sort:      1,
		Status:    1,
		CreatedAt: now,
		UpdatedAt: now,
	}
	DB.Carousels[2] = models.Carousel{
		ID:        2,
		Title:     "精选课程推荐",
		Image:     "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200",
		Link:      "/courses",
		Sort:      2,
		Status:    1,
		CreatedAt: now,
		UpdatedAt: now,
	}
	DB.Carousels[3] = models.Carousel{
		ID:        3,
		Title:     "海量书籍等你发现",
		Image:     "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200",
		Link:      "/books",
		Sort:      3,
		Status:    1,
		CreatedAt: now,
		UpdatedAt: now,
	}

	DB.UserIDCounter = 1
	DB.Users[1] = models.User{
		ID:        1,
		Username:  "testuser",
		Password:  "123456",
		Nickname:  "测试用户",
		Email:     "test@example.com",
		Phone:     "13800138000",
		Status:    1,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func Contains(s, substr string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(substr))
}
