package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password  string         `gorm:"size:255;not null" json:"-"`
	Role      string         `gorm:"size:20;not null" json:"role"`
	RealName  string         `gorm:"size:50;not null" json:"real_name"`
	Email     string         `gorm:"size:100" json:"email"`
	Phone     string         `gorm:"size:20" json:"phone"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) ComparePassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

type Teacher struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `json:"user_id"`
	TeacherNo  string         `gorm:"uniqueIndex;size:20;not null" json:"teacher_no"`
	RealName   string         `gorm:"size:50;not null" json:"real_name"`
	Gender     string         `gorm:"size:10" json:"gender"`
	Title      string         `gorm:"size:50" json:"title"`
	Department string         `gorm:"size:100" json:"department"`
	Major      string         `gorm:"size:100" json:"major"`
	Email      string         `gorm:"size:100" json:"email"`
	Phone      string         `gorm:"size:20" json:"phone"`
	Address    string         `gorm:"size:255" json:"address"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type Student struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `json:"user_id"`
	StudentNo  string         `gorm:"uniqueIndex;size:20;not null" json:"student_no"`
	RealName   string         `gorm:"size:50;not null" json:"real_name"`
	Gender     string         `gorm:"size:10" json:"gender"`
	ClassName  string         `gorm:"size:50" json:"class_name"`
	Grade      string         `gorm:"size:20" json:"grade"`
	Major      string         `gorm:"size:100" json:"major"`
	Department string         `gorm:"size:100" json:"department"`
	Email      string         `gorm:"size:100" json:"email"`
	Phone      string         `gorm:"size:20" json:"phone"`
	Address    string         `gorm:"size:255" json:"address"`
	IDCard     string         `gorm:"size:20" json:"id_card"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type Grade struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	StudentID   uint           `json:"student_id"`
	StudentNo   string         `gorm:"size:20;not null" json:"student_no"`
	StudentName string         `gorm:"size:50;not null" json:"student_name"`
	CourseName  string         `gorm:"size:100;not null" json:"course_name"`
	Semester    string         `gorm:"size:50" json:"semester"`
	Score       float64        `gorm:"type:decimal(5,2);not null" json:"score"`
	Credit      float64        `gorm:"type:decimal(3,1)" json:"credit"`
	ExamType    string         `gorm:"size:20" json:"exam_type"`
	Remark      string         `gorm:"size:255" json:"remark"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type RewardPunishment struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	StudentID   uint           `json:"student_id"`
	StudentNo   string         `gorm:"size:20;not null" json:"student_no"`
	StudentName string         `gorm:"size:50;not null" json:"student_name"`
	Type        string         `gorm:"size:20;not null" json:"type"`
	Title       string         `gorm:"size:100;not null" json:"title"`
	Content     string         `gorm:"type:text" json:"content"`
	Date        *time.Time     `json:"date"`
	Level       string         `gorm:"size:50" json:"level"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type AbilityPoint struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	StudentID   uint           `json:"student_id"`
	StudentNo   string         `gorm:"size:20;not null" json:"student_no"`
	StudentName string         `gorm:"size:50;not null" json:"student_name"`
	Category    string         `gorm:"size:50;not null" json:"category"`
	Title       string         `gorm:"size:100;not null" json:"title"`
	Points      float64        `gorm:"type:decimal(5,2);not null" json:"points"`
	Description string         `gorm:"type:text" json:"description"`
	Date        *time.Time     `json:"date"`
	Status      string         `gorm:"size:20;default:pending" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

type Evaluation struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	StudentID     uint           `json:"student_id"`
	StudentNo     string         `gorm:"size:20;not null" json:"student_no"`
	StudentName   string         `gorm:"size:50;not null" json:"student_name"`
	Semester      string         `gorm:"size:50" json:"semester"`
	AcademicScore float64        `gorm:"type:decimal(5,2)" json:"academic_score"`
	MoralScore    float64        `gorm:"type:decimal(5,2)" json:"moral_score"`
	AbilityScore  float64        `gorm:"type:decimal(5,2)" json:"ability_score"`
	TotalScore    float64        `gorm:"type:decimal(5,2)" json:"total_score"`
	Level         string         `gorm:"size:20" json:"level"`
	Comment       string         `gorm:"type:text" json:"comment"`
	Status        string         `gorm:"size:20;default:draft" json:"status"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Message struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	SenderID   uint           `json:"sender_id"`
	SenderName string         `gorm:"size:50;not null" json:"sender_name"`
	SenderRole string         `gorm:"size:20;not null" json:"sender_role"`
	Title      string         `gorm:"size:100;not null" json:"title"`
	Content    string         `gorm:"type:text;not null" json:"content"`
	Reply      string         `gorm:"type:text" json:"reply"`
	ReplyTime  *time.Time     `json:"reply_time"`
	Status     string         `gorm:"size:20;default:unreplied" json:"status"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type Permission struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Role      string         `gorm:"size:20;not null;uniqueIndex:unique_role_module" json:"role"`
	Module    string         `gorm:"size:50;not null;uniqueIndex:unique_role_module" json:"module"`
	CanView   bool           `gorm:"default:true" json:"can_view"`
	CanCreate bool           `gorm:"default:false" json:"can_create"`
	CanUpdate bool           `gorm:"default:false" json:"can_update"`
	CanDelete bool           `gorm:"default:false" json:"can_delete"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
