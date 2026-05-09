package service

import (
	"time"

	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"gorm.io/gorm"
)

type PharmacyService struct{}

func NewPharmacyService() *PharmacyService {
	return &PharmacyService{}
}

func (s *PharmacyService) GetPendingPrescriptions() ([]model.Prescription, error) {
	var prescriptions []model.Prescription
	if err := dao.DB.Preload("Patient").Preload("Doctor").Preload("Items").
		Where("status = 1").Order("created_at ASC").Find(&prescriptions).Error; err != nil {
		return nil, err
	}
	return prescriptions, nil
}

func (s *PharmacyService) GetPrescriptionDetail(id uint) (*model.Prescription, error) {
	var prescription model.Prescription
	if err := dao.DB.Preload("Patient").Preload("Doctor").Preload("Items").
		Preload("Items.Medicine").First(&prescription, id).Error; err != nil {
		return nil, err
	}
	return &prescription, nil
}

func (s *PharmacyService) DispensePrescription(prescriptionID uint, pharmacistID uint) error {
	tx := dao.DB.Begin()

	var prescription model.Prescription
	if err := tx.Preload("Items").First(&prescription, prescriptionID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if prescription.Status != 1 {
		tx.Rollback()
		return nil
	}

	for _, item := range prescription.Items {
		if err := tx.Model(&model.Medicine{}).
			Where("id = ?", item.MedicineID).
			Update("stock", gorm.Expr("stock - ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	now := time.Now()
	if err := tx.Model(&prescription).Updates(map[string]interface{}{
		"status":       2,
		"dispensed_at": &now,
		"dispensed_by": &pharmacistID,
	}).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (s *PharmacyService) ReturnPrescription(prescriptionID uint) error {
	tx := dao.DB.Begin()

	var prescription model.Prescription
	if err := tx.Preload("Items").First(&prescription, prescriptionID).Error; err != nil {
		tx.Rollback()
		return err
	}

	if prescription.Status != 2 {
		tx.Rollback()
		return nil
	}

	for _, item := range prescription.Items {
		if err := tx.Model(&model.Medicine{}).
			Where("id = ?", item.MedicineID).
			Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Model(&prescription).Update("status", 3).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()
	return nil
}

func (s *PharmacyService) GetMedicineStock() ([]model.Medicine, error) {
	var medicines []model.Medicine
	if err := dao.DB.Where("status = 1").Order("name ASC").Find(&medicines).Error; err != nil {
		return nil, err
	}
	return medicines, nil
}
