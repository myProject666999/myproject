package controllers

import (
	"strings"

	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

func GetMedicalRecords(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	patientID := c.Query("patient_id")

	db := database.DB.Model(&models.MedicalRecord{}).Preload("Patient").Preload("Doctor")

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(record_no) LIKE ? OR LOWER(diagnosis) LIKE ?", likePattern, likePattern)
	}

	if patientID != "" {
		db = db.Where("patient_id = ?", patientID)
	}

	var total int64
	db.Count(&total)

	var records []models.MedicalRecord
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&records)

	utils.Success(c, utils.NewPagination(page, pageSize, total, records))
}

func GetMedicalRecord(c *gin.Context) {
	id := c.Param("id")

	var record models.MedicalRecord
	if err := database.DB.Preload("Patient").Preload("Doctor").First(&record, id).Error; err != nil {
		utils.NotFound(c, "medical record not found")
		return
	}

	utils.Success(c, record)
}

func CreateMedicalRecord(c *gin.Context) {
	var record models.MedicalRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingRecord models.MedicalRecord
	if err := database.DB.Where("record_no = ?", record.RecordNo).First(&existingRecord).Error; err == nil {
		utils.BadRequest(c, "record number already exists")
		return
	}

	if err := database.DB.Create(&record).Error; err != nil {
		utils.InternalError(c, "failed to create medical record")
		return
	}

	utils.SuccessWithMessage(c, "medical record created successfully", record)
}

func UpdateMedicalRecord(c *gin.Context) {
	id := c.Param("id")

	var record models.MedicalRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		utils.NotFound(c, "medical record not found")
		return
	}

	var input models.MedicalRecord
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if input.RecordNo != "" {
		var existingRecord models.MedicalRecord
		if err := database.DB.Where("record_no = ? AND id != ?", input.RecordNo, id).First(&existingRecord).Error; err == nil {
			utils.BadRequest(c, "record number already exists")
			return
		}
		record.RecordNo = input.RecordNo
	}

	if input.PatientID != 0 {
		record.PatientID = input.PatientID
	}
	if input.DoctorID != nil {
		record.DoctorID = input.DoctorID
	}
	if input.Diagnosis != "" {
		record.Diagnosis = input.Diagnosis
	}
	if input.Symptoms != "" {
		record.Symptoms = input.Symptoms
	}
	if input.Examination != "" {
		record.Examination = input.Examination
	}
	if input.TreatmentPlan != "" {
		record.TreatmentPlan = input.TreatmentPlan
	}
	if input.Prescription != "" {
		record.Prescription = input.Prescription
	}
	if input.Notes != "" {
		record.Notes = input.Notes
	}
	if input.RecordDate != nil {
		record.RecordDate = input.RecordDate
	}

	if err := database.DB.Save(&record).Error; err != nil {
		utils.InternalError(c, "failed to update medical record")
		return
	}

	utils.SuccessWithMessage(c, "medical record updated successfully", record)
}

func DeleteMedicalRecord(c *gin.Context) {
	id := c.Param("id")

	var record models.MedicalRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		utils.NotFound(c, "medical record not found")
		return
	}

	if err := database.DB.Delete(&record).Error; err != nil {
		utils.InternalError(c, "failed to delete medical record")
		return
	}

	utils.SuccessWithMessage(c, "medical record deleted successfully", nil)
}
