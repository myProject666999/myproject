package model

import (
	"time"
)

type Role struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `gorm:"unique;not null" json:"name"`
	Description string     `json:"description"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type User struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Username     string     `gorm:"unique;not null" json:"username"`
	Password     string     `json:"-"`
	Name         string     `json:"name"`
	RoleID       uint       `json:"role_id"`
	DepartmentID *uint      `json:"department_id"`
	Phone        string     `json:"phone"`
	Email        string     `json:"email"`
	Status       int        `gorm:"default:1" json:"status"`
	CreatedAt    *time.Time `json:"created_at"`
	UpdatedAt    *time.Time `json:"updated_at"`
	Role         *Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Department   *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

type Department struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `json:"name"`
	Code        string     `json:"code"`
	Type        int        `json:"type"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type RegistrationLevel struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `json:"name"`
	Price       float64    `json:"price"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type SettlementCategory struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type DiagnosisCatalog struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	PinyinCode  string     `json:"pinyin_code"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type ChargeItem struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Code        string     `json:"code"`
	Name        string     `json:"name"`
	Price       float64    `json:"price"`
	Category    string     `json:"category"`
	PinyinCode  string     `json:"pinyin_code"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type ExpenseSubject struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Name        string     `json:"name"`
	Code        string     `json:"code"`
	Description string     `json:"description"`
	Status      int        `gorm:"default:1" json:"status"`
	CreatedAt   *time.Time `json:"created_at"`
	UpdatedAt   *time.Time `json:"updated_at"`
}

type Medicine struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Code         string     `json:"code"`
	Name         string     `json:"name"`
	GenericName  string     `json:"generic_name"`
	Specification string    `json:"specification"`
	Unit         string     `json:"unit"`
	Price        float64    `json:"price"`
	Manufacturer string     `json:"manufacturer"`
	Stock        int        `json:"stock"`
	Type         int        `json:"type"`
	PinyinCode   string     `json:"pinyin_code"`
	Status       int        `gorm:"default:1" json:"status"`
	CreatedAt    *time.Time `json:"created_at"`
	UpdatedAt    *time.Time `json:"updated_at"`
}

type DoctorSchedule struct {
	ID                  uint       `gorm:"primaryKey" json:"id"`
	DoctorID            uint       `json:"doctor_id"`
	DepartmentID        uint       `json:"department_id"`
	Date                string     `json:"date"`
	Shift               int        `gorm:"default:1" json:"shift"`
	RegistrationLevelID *uint      `json:"registration_level_id"`
	MaxPatients         int        `gorm:"default:20" json:"max_patients"`
	CurrentPatients     int        `gorm:"default:0" json:"current_patients"`
	Status              int        `gorm:"default:1" json:"status"`
	CreatedAt           *time.Time `json:"created_at"`
	UpdatedAt           *time.Time `json:"updated_at"`
	Doctor              *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Department          *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	RegistrationLevel   *RegistrationLevel `gorm:"foreignKey:RegistrationLevelID" json:"registration_level,omitempty"`
}

type Patient struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	MedicalRecordNo string     `gorm:"unique" json:"medical_record_no"`
	Name            string     `json:"name"`
	Gender          int        `json:"gender"`
	BirthDate       string     `json:"birth_date"`
	IDCard          string     `json:"id_card"`
	Phone           string     `json:"phone"`
	Address         string     `json:"address"`
	AllergyHistory  string     `json:"allergy_history"`
	CreatedAt       *time.Time `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
}

type Registration struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	RegistrationNo        string     `gorm:"unique" json:"registration_no"`
	PatientID             uint       `json:"patient_id"`
	ScheduleID            uint       `json:"schedule_id"`
	DoctorID              uint       `json:"doctor_id"`
	DepartmentID          uint       `json:"department_id"`
	RegistrationLevelID   uint       `json:"registration_level_id"`
	SettlementCategoryID  *uint      `json:"settlement_category_id"`
	Fee                   float64    `json:"fee"`
	Status                int        `gorm:"default:1" json:"status"`
	QueueNumber           int        `json:"queue_number"`
	RegisteredAt          *time.Time `json:"registered_at"`
	SeenAt                *time.Time `json:"seen_at"`
	FinishedAt            *time.Time `json:"finished_at"`
	CreatedAt             *time.Time `json:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at"`
	Patient               *Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor                *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Department            *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
	RegistrationLevel     *RegistrationLevel `gorm:"foreignKey:RegistrationLevelID" json:"registration_level,omitempty"`
	SettlementCategory    *SettlementCategory `gorm:"foreignKey:SettlementCategoryID" json:"settlement_category,omitempty"`
}

type MedicalRecord struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	RegistrationID        uint       `json:"registration_id"`
	PatientID             uint       `json:"patient_id"`
	DoctorID              uint       `json:"doctor_id"`
	ChiefComplaint        string     `json:"chief_complaint"`
	PresentIllness        string     `json:"present_illness"`
	PastMedicalHistory    string     `json:"past_medical_history"`
	PhysicalExamination   string     `json:"physical_examination"`
	AuxiliaryExamination  string     `json:"auxiliary_examination"`
	Diagnosis             string     `json:"diagnosis"`
	TreatmentAdvice       string     `json:"treatment_advice"`
	CreatedAt             *time.Time `json:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at"`
}

type ExaminationRequest struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	RequestNo      string     `gorm:"unique" json:"request_no"`
	RegistrationID uint       `json:"registration_id"`
	PatientID      uint       `json:"patient_id"`
	DoctorID       uint       `json:"doctor_id"`
	DepartmentID   uint       `json:"department_id"`
	ExamType       string     `json:"exam_type"`
	ExamItems      string     `json:"exam_items"`
	ClinicalInfo   string     `json:"clinical_info"`
	Status         int        `gorm:"default:1" json:"status"`
	Result         string     `json:"result"`
	TechnicianID   *uint      `json:"technician_id"`
	RequestedAt    *time.Time `json:"requested_at"`
	ExaminedAt     *time.Time `json:"examined_at"`
	CreatedAt      *time.Time `json:"created_at"`
	UpdatedAt      *time.Time `json:"updated_at"`
	Patient        *Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor         *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Department     *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

type LaboratoryRequest struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	RequestNo      string     `gorm:"unique" json:"request_no"`
	RegistrationID uint       `json:"registration_id"`
	PatientID      uint       `json:"patient_id"`
	DoctorID       uint       `json:"doctor_id"`
	DepartmentID   uint       `json:"department_id"`
	LabType        string     `json:"lab_type"`
	LabItems       string     `json:"lab_items"`
	ClinicalInfo   string     `json:"clinical_info"`
	Status         int        `gorm:"default:1" json:"status"`
	Result         string     `json:"result"`
	TechnicianID   *uint      `json:"technician_id"`
	RequestedAt    *time.Time `json:"requested_at"`
	ExaminedAt     *time.Time `json:"examined_at"`
	CreatedAt      *time.Time `json:"created_at"`
	UpdatedAt      *time.Time `json:"updated_at"`
	Patient        *Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor         *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Department     *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

type Prescription struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	PrescriptionNo  string     `gorm:"unique" json:"prescription_no"`
	RegistrationID  uint       `json:"registration_id"`
	PatientID       uint       `json:"patient_id"`
	DoctorID        uint       `json:"doctor_id"`
	DepartmentID    uint       `json:"department_id"`
	Type            int        `gorm:"default:1" json:"type"`
	Status          int        `gorm:"default:1" json:"status"`
	DispensedAt     *time.Time `json:"dispensed_at"`
	DispensedBy     *uint      `json:"dispensed_by"`
	CreatedAt       *time.Time `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
	Items           []PrescriptionItem `gorm:"foreignKey:PrescriptionID" json:"items,omitempty"`
	Patient         *Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor          *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
}

type PrescriptionItem struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	PrescriptionID uint      `json:"prescription_id"`
	MedicineID    uint       `json:"medicine_id"`
	MedicineName  string     `json:"medicine_name"`
	Specification string     `json:"specification"`
	Quantity      int        `json:"quantity"`
	Unit          string     `json:"unit"`
	Price         float64    `json:"price"`
	Dosage        string     `json:"dosage"`
	UsageInfo     string     `json:"usage_info"`
	CreatedAt     *time.Time `json:"created_at"`
	Medicine      *Medicine  `gorm:"foreignKey:MedicineID" json:"medicine,omitempty"`
}

type TreatmentRequest struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	RequestNo      string     `gorm:"unique" json:"request_no"`
	RegistrationID uint       `json:"registration_id"`
	PatientID      uint       `json:"patient_id"`
	DoctorID       uint       `json:"doctor_id"`
	DepartmentID   uint       `json:"department_id"`
	TreatmentType  string     `json:"treatment_type"`
	TreatmentItems string     `json:"treatment_items"`
	ClinicalInfo   string     `json:"clinical_info"`
	Status         int        `gorm:"default:1" json:"status"`
	Result         string     `json:"result"`
	OperatorID     *uint      `json:"operator_id"`
	RequestedAt    *time.Time `json:"requested_at"`
	TreatedAt      *time.Time `json:"treated_at"`
	CreatedAt      *time.Time `json:"created_at"`
	UpdatedAt      *time.Time `json:"updated_at"`
	Patient        *Patient   `gorm:"foreignKey:PatientID" json:"patient,omitempty"`
	Doctor         *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
}

type FeeItem struct {
	ID                    uint       `gorm:"primaryKey" json:"id"`
	RegistrationID        uint       `json:"registration_id"`
	PatientID             uint       `json:"patient_id"`
	ItemType              int        `json:"item_type"`
	ItemID                uint       `json:"item_id"`
	ItemName              string     `json:"item_name"`
	Quantity              int        `json:"quantity"`
	UnitPrice             float64    `json:"unit_price"`
	TotalPrice            float64    `json:"total_price"`
	SettlementCategoryID  *uint      `json:"settlement_category_id"`
	Status                int        `gorm:"default:1" json:"status"`
	CreatedAt             *time.Time `json:"created_at"`
}

type WorkloadStatistic struct {
	ID                 uint       `gorm:"primaryKey" json:"id"`
	DoctorID           uint       `json:"doctor_id"`
	DepartmentID       uint       `json:"department_id"`
	Date               string     `json:"date"`
	TotalPatients      int        `json:"total_patients"`
	TotalIncome        float64    `json:"total_income"`
	PrescriptionCount  int        `json:"prescription_count"`
	ExaminationCount   int        `json:"examination_count"`
	LaboratoryCount    int        `json:"laboratory_count"`
	TreatmentCount     int        `json:"treatment_count"`
	CreatedAt          *time.Time `json:"created_at"`
	UpdatedAt          *time.Time `json:"updated_at"`
	Doctor             *User      `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Department         *Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

type DailySettlement struct {
	ID                      uint       `gorm:"primaryKey" json:"id"`
	SettlementNo            string     `gorm:"unique" json:"settlement_no"`
	SettlementDate          string     `gorm:"unique" json:"settlement_date"`
	OperatorID              uint       `json:"operator_id"`
	TotalRegistrationCount  int        `json:"total_registration_count"`
	TotalRegistrationIncome float64    `json:"total_registration_income"`
	TotalChargeCount        int        `json:"total_charge_count"`
	TotalChargeIncome       float64    `json:"total_charge_income"`
	TotalIncome             float64    `json:"total_income"`
	Status                  int        `gorm:"default:1" json:"status"`
	CreatedAt               *time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}
