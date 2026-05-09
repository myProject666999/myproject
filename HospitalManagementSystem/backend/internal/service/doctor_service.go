package service

import (
	"errors"
	"time"

	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"
)

type DoctorService struct{}

func NewDoctorService() *DoctorService {
	return &DoctorService{}
}

func (s *DoctorService) GetWaitingList(doctorID uint, date string) ([]model.Registration, error) {
	var registrations []model.Registration

	query := dao.DB.Preload("Patient").Preload("RegistrationLevel").
		Where("doctor_id = ? AND status = 1", doctorID)

	if date != "" {
		query = query.Where("DATE(registered_at) = ?", date)
	}

	if err := query.Order("queue_number ASC").Find(&registrations).Error; err != nil {
		return nil, err
	}

	return registrations, nil
}

func (s *DoctorService) GetRegistrationDetail(id uint) (*model.Registration, error) {
	var registration model.Registration
	if err := dao.DB.Preload("Patient").Preload("Doctor").Preload("Department").
		Preload("RegistrationLevel").First(&registration, id).Error; err != nil {
		return nil, err
	}
	return &registration, nil
}

func (s *DoctorService) StartDiagnosis(registrationID uint) error {
	now := time.Now()
	return dao.DB.Model(&model.Registration{}).
		Where("id = ? AND status = 1", registrationID).
		Updates(map[string]interface{}{
			"status":  2,
			"seen_at": &now,
		}).Error
}

func (s *DoctorService) SaveMedicalRecord(record *model.MedicalRecord) error {
	var existingRecord model.MedicalRecord
	err := dao.DB.Where("registration_id = ?", record.RegistrationID).First(&existingRecord).Error

	if err == nil {
		existingRecord.ChiefComplaint = record.ChiefComplaint
		existingRecord.PresentIllness = record.PresentIllness
		existingRecord.PastMedicalHistory = record.PastMedicalHistory
		existingRecord.PhysicalExamination = record.PhysicalExamination
		existingRecord.AuxiliaryExamination = record.AuxiliaryExamination
		existingRecord.Diagnosis = record.Diagnosis
		existingRecord.TreatmentAdvice = record.TreatmentAdvice
		return dao.DB.Save(&existingRecord).Error
	}

	return dao.DB.Create(record).Error
}

func (s *DoctorService) GetMedicalRecord(registrationID uint) (*model.MedicalRecord, error) {
	var record model.MedicalRecord
	if err := dao.DB.Where("registration_id = ?", registrationID).First(&record).Error; err != nil {
		return nil, err
	}
	return &record, nil
}

func (s *DoctorService) CreateExaminationRequest(request *model.ExaminationRequest) error {
	request.RequestNo = util.GenerateNo("EX")
	request.Status = 1
	return dao.DB.Create(request).Error
}

func (s *DoctorService) CreateLaboratoryRequest(request *model.LaboratoryRequest) error {
	request.RequestNo = util.GenerateNo("LAB")
	request.Status = 1
	return dao.DB.Create(request).Error
}

func (s *DoctorService) CreateTreatmentRequest(request *model.TreatmentRequest) error {
	request.RequestNo = util.GenerateNo("TR")
	request.Status = 1
	return dao.DB.Create(request).Error
}

func (s *DoctorService) CreatePrescription(prescription *model.Prescription, items []model.PrescriptionItem) error {
	tx := dao.DB.Begin()

	prescription.PrescriptionNo = util.GenerateNo("RX")
	prescription.Status = 1

	if err := tx.Create(prescription).Error; err != nil {
		tx.Rollback()
		return err
	}

	for i := range items {
		items[i].PrescriptionID = prescription.ID
	}

	if err := tx.Create(&items).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (s *DoctorService) GetPrescriptions(registrationID uint) ([]model.Prescription, error) {
	var prescriptions []model.Prescription
	if err := dao.DB.Preload("Items").Where("registration_id = ?", registrationID).
		Order("created_at DESC").Find(&prescriptions).Error; err != nil {
		return nil, err
	}
	return prescriptions, nil
}

func (s *DoctorService) GetPatientFees(registrationID uint) ([]model.FeeItem, error) {
	var items []model.FeeItem
	if err := dao.DB.Where("registration_id = ?", registrationID).Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (s *DoctorService) FinishDiagnosis(registrationID uint) error {
	tx := dao.DB.Begin()

	now := time.Now()
	if err := tx.Model(&model.Registration{}).
		Where("id = ?", registrationID).
		Updates(map[string]interface{}{
			"status":     3,
			"finished_at": &now,
		}).Error; err != nil {
		tx.Rollback()
		return err
	}

	var registration model.Registration
	if err := tx.First(&registration, registrationID).Error; err != nil {
		tx.Rollback()
		return err
	}

	var stat model.WorkloadStatistic
	today := time.Now().Format("2006-01-02")
	err := tx.Where("doctor_id = ? AND date = ?", registration.DoctorID, today).
		First(&stat).Error

	if err != nil {
		stat = model.WorkloadStatistic{
			DoctorID:     registration.DoctorID,
			DepartmentID: registration.DepartmentID,
			Date:         today,
			TotalPatients: 1,
		}
		if err := tx.Create(&stat).Error; err != nil {
			tx.Rollback()
			return err
		}
	} else {
		if err := tx.Model(&stat).Update("total_patients", stat.TotalPatients+1).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	tx.Commit()
	return nil
}

func (s *DoctorService) SearchMedicines(keyword string, mType int) ([]model.Medicine, error) {
	var medicines []model.Medicine
	query := dao.DB.Where("status = 1")

	if mType > 0 {
		query = query.Where("type = ?", mType)
	}

	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Limit(20).Find(&medicines).Error; err != nil {
		return nil, err
	}

	return medicines, nil
}

func (s *DoctorService) SearchDiagnosis(keyword string) ([]model.DiagnosisCatalog, error) {
	var items []model.DiagnosisCatalog
	query := dao.DB.Where("status = 1")

	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Limit(20).Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (s *DoctorService) SearchChargeItems(keyword string) ([]model.ChargeItem, error) {
	var items []model.ChargeItem
	query := dao.DB.Where("status = 1")

	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if err := query.Limit(20).Find(&items).Error; err != nil {
		return nil, err
	}

	return items, nil
}

func (s *DoctorService) ConfirmDiagnosis(registrationID uint, diagnosis string) error {
	var record model.MedicalRecord
	if err := dao.DB.Where("registration_id = ?", registrationID).First(&record).Error; err != nil {
		return errors.New("请先保存病历")
	}

	record.Diagnosis = diagnosis
	return dao.DB.Save(&record).Error
}
