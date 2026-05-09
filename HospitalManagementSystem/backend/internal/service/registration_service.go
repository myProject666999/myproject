package service

import (
	"time"

	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"
	"gorm.io/gorm"
)

type RegistrationService struct{}

func NewRegistrationService() *RegistrationService {
	return &RegistrationService{}
}

func (s *RegistrationService) SearchPatient(keyword string) ([]model.Patient, error) {
	var patients []model.Patient
	query := dao.DB

	if keyword != "" {
		query = query.Where("name LIKE ? OR medical_record_no LIKE ? OR phone LIKE ? OR id_card LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Limit(20).Find(&patients).Error; err != nil {
		return nil, err
	}

	return patients, nil
}

func (s *RegistrationService) CreatePatient(patient *model.Patient) error {
	patient.MedicalRecordNo = util.GenerateMedicalRecordNo()
	return dao.DB.Create(patient).Error
}

func (s *RegistrationService) GetPatientByID(id uint) (*model.Patient, error) {
	var patient model.Patient
	if err := dao.DB.First(&patient, id).Error; err != nil {
		return nil, err
	}
	return &patient, nil
}

func (s *RegistrationService) GetAvailableSchedules(date string, departmentID uint) ([]model.DoctorSchedule, error) {
	var schedules []model.DoctorSchedule
	query := dao.DB.Preload("Doctor").Preload("Department").Preload("RegistrationLevel").
		Where("date = ? AND status = 1 AND current_patients < max_patients", date)

	if departmentID > 0 {
		query = query.Where("department_id = ?", departmentID)
	}

	if err := query.Find(&schedules).Error; err != nil {
		return nil, err
	}

	return schedules, nil
}

func (s *RegistrationService) CreateRegistration(registration *model.Registration) error {
	tx := dao.DB.Begin()

	var schedule model.DoctorSchedule
	if err := tx.First(&schedule, registration.ScheduleID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if schedule.CurrentPatients >= schedule.MaxPatients {
		tx.Rollback()
		return nil
	}

	queueNumber := schedule.CurrentPatients + 1

	registration.RegistrationNo = util.GenerateNo("REG")
	registration.QueueNumber = queueNumber
	registration.Status = 1
	now := time.Now()
	registration.RegisteredAt = &now

	if err := tx.Create(registration).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&schedule).Update("current_patients", queueNumber).Error; err != nil {
		tx.Rollback()
		return err
	}

	feeItem := model.FeeItem{
		RegistrationID: registration.ID,
		PatientID:      registration.PatientID,
		ItemType:       1,
		ItemID:         registration.RegistrationLevelID,
		ItemName:       "挂号费",
		Quantity:       1,
		UnitPrice:      registration.Fee,
		TotalPrice:     registration.Fee,
		SettlementCategoryID: registration.SettlementCategoryID,
		Status:         2,
	}
	if err := tx.Create(&feeItem).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (s *RegistrationService) GetRegistrations(date string, status int) ([]model.Registration, error) {
	var registrations []model.Registration
	query := dao.DB.Preload("Patient").Preload("Doctor").Preload("Department").
		Preload("RegistrationLevel").Preload("SettlementCategory")

	if date != "" {
		query = query.Where("DATE(registered_at) = ?", date)
	}

	if status > 0 {
		query = query.Where("status = ?", status)
	}

	if err := query.Order("registered_at DESC").Find(&registrations).Error; err != nil {
		return nil, err
	}

	return registrations, nil
}

func (s *RegistrationService) CancelRegistration(id uint) error {
	tx := dao.DB.Begin()

	var registration model.Registration
	if err := tx.First(&registration, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	if registration.Status != 1 {
		tx.Rollback()
		return nil
	}

	if err := tx.Model(&registration).Update("status", 4).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&model.DoctorSchedule{}).
		Where("id = ?", registration.ScheduleID).
		Update("current_patients", gorm.Expr("current_patients - 1")).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (s *RegistrationService) GetPatientFees(patientID uint, registrationID uint) ([]model.FeeItem, error) {
	var items []model.FeeItem
	query := dao.DB

	if patientID > 0 {
		query = query.Where("patient_id = ?", patientID)
	}
	if registrationID > 0 {
		query = query.Where("registration_id = ?", registrationID)
	}

	if err := query.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (s *RegistrationService) ChargeFees(feeIDs []uint, settlementCategoryID uint) error {
	tx := dao.DB.Begin()

	now := time.Now()
	for _, id := range feeIDs {
		if err := tx.Model(&model.FeeItem{}).
			Where("id = ? AND status = 1", id).
			Updates(map[string]interface{}{
				"status":                  2,
				"settlement_category_id":  settlementCategoryID,
				"updated_at":              &now,
			}).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	tx.Commit()
	return nil
}
