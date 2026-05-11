package models

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "modernc.org/sqlite"
)

var DB *gorm.DB

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Email     string         `json:"email"`
	Phone     string         `json:"phone"`
	Name      string         `json:"name"`
	Gender    string         `json:"gender"`
	Birthday  string         `json:"birthday"`
	Address   string         `json:"address"`
	Role      string         `json:"role" gorm:"default:worker"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Banner struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title"`
	ImageURL  string         `json:"image_url"`
	LinkURL   string         `json:"link_url"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type Announcement struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	Author    string         `json:"author"`
	IsActive  bool           `json:"is_active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type Training struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Content     string         `json:"content"`
	ImageURL    string         `json:"image_url"`
	StartDate   string         `json:"start_date"`
	EndDate     string         `json:"end_date"`
	Location    string         `json:"location"`
	MaxEnroll   int            `json:"max_enroll"`
	CurrentEnroll int          `json:"current_enroll" gorm:"default:0"`
	Author      string         `json:"author"`
	IsActive    bool           `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type TrainingEnrollment struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id"`
	TrainingID uint           `json:"training_id"`
	Status     string         `json:"status" gorm:"default:pending"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

type ForumPost struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Title     string         `json:"title"`
	Content   string         `json:"content"`
	UserID    uint           `json:"user_id"`
	Username  string         `json:"username"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

type ForumComment struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	PostID    uint           `json:"post_id"`
	UserID    uint           `json:"user_id"`
	Username  string         `json:"username"`
	Content   string         `json:"content"`
	CreatedAt time.Time      `json:"created_at"`
}

type Archive struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	UserID          uint           `json:"user_id"`
	WorkerNumber    string         `json:"worker_number"`
	Name            string         `json:"name"`
	Gender          string         `json:"gender"`
	Age             int            `json:"age"`
	IDCard          string         `json:"id_card"`
	Phone           string         `json:"phone"`
	Department      string         `json:"department"`
	Position        string         `json:"position"`
	Title           string         `json:"title"`
	Achievements    string         `json:"achievements"`
	JoinDate        string         `json:"join_date"`
	Status          string         `json:"status" gorm:"default:active"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
}

type ArchiveChange struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	ArchiveID   uint           `json:"archive_id"`
	ChangeType  string         `json:"change_type"`
	Content     string         `json:"content"`
	Applicant   string         `json:"applicant"`
	Status      string         `json:"status" gorm:"default:pending"`
	Reviewer    string         `json:"reviewer"`
	ReviewDate  string         `json:"review_date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type RewardPunishment struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	ArchiveID   uint           `json:"archive_id"`
	WorkerName  string         `json:"worker_name"`
	Type        string         `json:"type"`
	Title       string         `json:"title"`
	Content     string         `json:"content"`
	Date        string         `json:"date"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type Favorite struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id"`
	TargetID   uint           `json:"target_id"`
	TargetType string         `json:"target_type"`
	CreatedAt  time.Time      `json:"created_at"`
}

type Comment struct {
	ID         uint           `json:"id" gorm:"primaryKey"`
	UserID     uint           `json:"user_id"`
	Username   string         `json:"username"`
	TargetID   uint           `json:"target_id"`
	TargetType string         `json:"target_type"`
	Content    string         `json:"content"`
	CreatedAt  time.Time      `json:"created_at"`
}

type Course struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name"`
	Code      string         `json:"code"`
	Teacher   string         `json:"teacher"`
	Credits   float64        `json:"credits"`
	Hours     int            `json:"hours"`
	Description string       `json:"description"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}

func InitDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found")
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./model_worker.db"
	}

	sqlDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	database, err := gorm.Open(sqlite.Dialector{
		Conn: sqlDB,
	}, &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB = database

	err = DB.AutoMigrate(
		&User{},
		&Banner{},
		&Announcement{},
		&Training{},
		&TrainingEnrollment{},
		&ForumPost{},
		&ForumComment{},
		&Archive{},
		&ArchiveChange{},
		&RewardPunishment{},
		&Favorite{},
		&Comment{},
		&Course{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	SeedData()
}

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func SeedData() {
	var userCount int64
	DB.Model(&User{}).Count(&userCount)
	if userCount > 0 {
		return
	}

	adminPass, _ := HashPassword("admin123")
	workerPass, _ := HashPassword("worker123")

	users := []User{
		{Username: "admin", Password: adminPass, Email: "admin@example.com", Name: "系统管理员", Role: "admin"},
		{Username: "worker1", Password: workerPass, Email: "worker1@example.com", Name: "张三", Phone: "13800138001", Role: "worker"},
		{Username: "worker2", Password: workerPass, Email: "worker2@example.com", Name: "李四", Phone: "13800138002", Role: "worker"},
	}
	DB.Create(&users)

	banners := []Banner{
		{Title: "欢迎使用劳模管理系统", ImageURL: "https://picsum.photos/1200/400?random=1", IsActive: true},
		{Title: "劳模培训计划", ImageURL: "https://picsum.photos/1200/400?random=2", IsActive: true},
		{Title: "年度表彰大会", ImageURL: "https://picsum.photos/1200/400?random=3", IsActive: true},
	}
	DB.Create(&banners)

	announcements := []Announcement{
		{Title: "关于2026年度劳模培训计划的通知", Content: "为进一步提升劳模综合素质，现启动2026年度培训计划。培训内容包括专业技能提升、领导力培养等方面。请各位劳模积极报名参加。", Author: "系统管理员", IsActive: true},
		{Title: "年度表彰大会即将召开", Content: "年度劳模表彰大会将于下月举行，届时将表彰本年度表现突出的优秀员工。", Author: "人事部门", IsActive: true},
		{Title: "系统维护通知", Content: "本系统将于本周六进行定期维护，届时可能会有短暂的服务中断，敬请谅解。", Author: "技术部门", IsActive: true},
	}
	DB.Create(&announcements)

	trainings := []Training{
		{Title: "领导力提升培训", Description: "提升管理能力和领导艺术", Content: "本培训课程涵盖领导力基础、团队管理、沟通技巧等内容，帮助学员提升综合管理能力。", ImageURL: "https://picsum.photos/600/400?random=10", StartDate: "2026-05-15", EndDate: "2026-05-17", Location: "培训中心A座301", MaxEnroll: 30, Author: "培训部"},
		{Title: "数字化转型培训", Description: "了解数字化时代的工作方式", Content: "学习数字化工具应用、数据分析基础、在线协作等技能，适应数字化工作环境。", ImageURL: "https://picsum.photos/600/400?random=11", StartDate: "2026-05-20", EndDate: "2026-05-22", Location: "培训中心B座201", MaxEnroll: 40, Author: "信息部"},
		{Title: "健康管理与职业素养", Description: "关注身心健康，提升职业素养", Content: "包括心理健康辅导、工作压力管理、职业形象塑造等内容。", ImageURL: "https://picsum.photos/600/400?random=12", StartDate: "2026-06-01", EndDate: "2026-06-02", Location: "多功能会议厅", MaxEnroll: 50, Author: "工会"},
	}
	DB.Create(&trainings)

	archives := []Archive{
		{UserID: 2, WorkerNumber: "MW001", Name: "张三", Gender: "男", Age: 35, IDCard: "110101199001011234", Phone: "13800138001", Department: "生产部", Position: "高级工程师", Title: "全国劳动模范", Achievements: "2020年获全国劳动模范称号，多次荣获技术创新奖", JoinDate: "2010-07-01"},
		{UserID: 3, WorkerNumber: "MW002", Name: "李四", Gender: "女", Age: 32, IDCard: "110101199305055678", Phone: "13800138002", Department: "研发部", Position: "研发经理", Title: "省级劳动模范", Achievements: "主持多项重点研发项目，获专利10余项", JoinDate: "2012-08-15"},
	}
	DB.Create(&archives)

	forumPosts := []ForumPost{
		{Title: "参加领导力培训的心得分享", Content: "很高兴能参加这次领导力培训，收获很多，想和大家分享一下我的学习心得...", UserID: 2, Username: "张三"},
		{Title: "数字化工具推荐", Content: "在日常工作中，我发现了一些很好用的数字化工具，推荐给大家：", UserID: 3, Username: "李四"},
	}
	DB.Create(&forumPosts)

	rewards := []RewardPunishment{
		{ArchiveID: 1, WorkerName: "张三", Type: "reward", Title: "技术创新一等奖", Content: "在2025年度技术创新评比中荣获一等奖", Date: "2025-12-15"},
		{ArchiveID: 1, WorkerName: "张三", Type: "reward", Title: "优秀员工称号", Content: "连续三年被评为公司优秀员工", Date: "2025-01-10"},
		{ArchiveID: 2, WorkerName: "李四", Type: "reward", Title: "专利发明奖", Content: "研发的新技术获得国家发明专利", Date: "2025-08-20"},
	}
	DB.Create(&rewards)

	courses := []Course{
		{Name: "管理学原理", Code: "MGT001", Teacher: "王教授", Credits: 3.0, Hours: 48, Description: "系统学习管理学的基本原理和方法"},
		{Name: "数据分析基础", Code: "DA001", Teacher: "李教授", Credits: 2.5, Hours: 40, Description: "学习数据分析的基本概念和工具应用"},
		{Name: "沟通技巧", Code: "CS001", Teacher: "张讲师", Credits: 2.0, Hours: 32, Description: "提升职场沟通能力和人际关系处理技巧"},
	}
	DB.Create(&courses)

	fmt.Println("Database seeded successfully")
}
