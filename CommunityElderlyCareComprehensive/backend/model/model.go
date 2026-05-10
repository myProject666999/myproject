package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	RealName  string         `json:"real_name" gorm:"size:50"`
	Phone     string         `json:"phone" gorm:"size:20"`
	Email     string         `json:"email" gorm:"size:100"`
	Status    int            `json:"status" gorm:"default:1"`
	Roles     []Role         `json:"roles,omitempty" gorm:"many2many:user_roles"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

func (u *User) BeforeSave(tx *gorm.DB) error {
	if u.Password != "" {
		var count int64
		tx.Model(&User{}).Where("id = ? AND password = ?", u.ID, u.Password).Count(&count)
		if count == 0 {
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
			if err != nil {
				return err
			}
			u.Password = string(hashedPassword)
		}
	}
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

type Role struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"uniqueIndex;size:50;not null"`
	DisplayName string         `json:"display_name" gorm:"size:50"`
	Description string         `json:"description" gorm:"size:200"`
	Menus       []Menu         `json:"menus,omitempty" gorm:"many2many:role_menus"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type Menu struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	ParentID  uint           `json:"parent_id" gorm:"default:0"`
	Name      string         `json:"name" gorm:"size:50;not null"`
	Path      string         `json:"path" gorm:"size:200"`
	Icon      string         `json:"icon" gorm:"size:50"`
	Sort      int            `json:"sort" gorm:"default:0"`
	Children  []Menu         `json:"children,omitempty" gorm:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type UserRole struct {
	ID     uint `json:"id" gorm:"primaryKey"`
	UserID uint `json:"user_id" gorm:"index;not null"`
	RoleID uint `json:"role_id" gorm:"index;not null"`
}

type RoleMenu struct {
	ID     uint `json:"id" gorm:"primaryKey"`
	RoleID uint `json:"role_id" gorm:"index;not null"`
	MenuID uint `json:"menu_id" gorm:"index;not null"`
}

type Insurance struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	UserID          uint           `json:"user_id" gorm:"index;not null"`
	InsuranceNumber string         `json:"insurance_number" gorm:"size:50;not null"`
	InsuranceType   string         `json:"insurance_type" gorm:"size:50"`
	CardNumber      string         `json:"card_number" gorm:"size:50"`
	Status          string         `json:"status" gorm:"size:20"`
	StartDate       *time.Time     `json:"start_date"`
	EndDate         *time.Time     `json:"end_date"`
	User            *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type Medicine struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"size:100;not null"`
	GenericName   string         `json:"generic_name" gorm:"size:100"`
	Manufacturer  string         `json:"manufacturer" gorm:"size:100"`
	Specification string         `json:"specification" gorm:"size:100"`
	DosageForm    string         `json:"dosage_form" gorm:"size:50"`
	Price         float64        `json:"price"`
	Stock         int            `json:"stock"`
	Description   string         `json:"description" gorm:"type:text"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type HealthRecord struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"index;not null"`
	HeartRate   int            `json:"heart_rate"`
	BloodPressureHigh int      `json:"blood_pressure_high"`
	BloodPressureLow  int      `json:"blood_pressure_low"`
	BloodOxygen int            `json:"blood_oxygen"`
	Temperature float64        `json:"temperature"`
	Weight      float64        `json:"weight"`
	Height      float64        `json:"height"`
	Remark      string         `json:"remark" gorm:"type:text"`
	User        *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	RecordTime  time.Time      `json:"record_time"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type Appointment struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	UserID      uint           `json:"user_id" gorm:"index;not null"`
	DoctorID    uint           `json:"doctor_id" gorm:"index;not null"`
	AppointmentTime time.Time   `json:"appointment_time"`
	Location    string         `json:"location" gorm:"size:200"`
	Reason      string         `json:"reason" gorm:"size:500"`
	Status      string         `json:"status" gorm:"size:20;default:pending"`
	User        *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Doctor      *User          `json:"doctor,omitempty" gorm:"foreignKey:DoctorID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}

type VisitRecord struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	UserID        uint           `json:"user_id" gorm:"index;not null"`
	DoctorID      uint           `json:"doctor_id" gorm:"index;not null"`
	VisitDate     time.Time      `json:"visit_date"`
	Department    string         `json:"department" gorm:"size:50"`
	ChiefComplaint string        `json:"chief_complaint" gorm:"type:text"`
	Diagnosis     string         `json:"diagnosis" gorm:"type:text"`
	Treatment     string         `json:"treatment" gorm:"type:text"`
	Prescription  string         `json:"prescription" gorm:"type:text"`
	User          *User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Doctor        *User          `json:"doctor,omitempty" gorm:"foreignKey:DoctorID"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"deleted_at,omitempty" gorm:"index"`
}
