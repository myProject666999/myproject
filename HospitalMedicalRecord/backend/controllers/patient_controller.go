package controllers

import (
	"strings"

	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

func GetPatients(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	gender := c.Query("gender")
	status := c.Query("status")

	db := database.DB.Model(&models.Patient{})

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(patient_no) LIKE ? OR LOWER(name) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(id_card) LIKE ?", likePattern, likePattern, likePattern, likePattern)
	}

	if gender != "" {
		db = db.Where("gender = ?", gender)
	}

	if status != "" {
		db = db.Where("status = ?", status)
	}

	var total int64
	db.Count(&total)

	var patients []models.Patient
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&patients)

	utils.Success(c, utils.NewPagination(page, pageSize, total, patients))
}

func GetPatient(c *gin.Context) {
	id := c.Param("id")

	var patient models.Patient
	if err := database.DB.First(&patient, id).Error; err != nil {
		utils.NotFound(c, "patient not found")
		return
	}

	utils.Success(c, patient)
}

func CreatePatient(c *gin.Context) {
	var patient models.Patient
	if err := c.ShouldBindJSON(&patient); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingPatient models.Patient
	if err := database.DB.Where("patient_no = ?", patient.PatientNo).First(&existingPatient).Error; err == nil {
		utils.BadRequest(c, "patient number already exists")
		return
	}

	if err := database.DB.Create(&patient).Error; err != nil {
		utils.InternalError(c, "failed to create patient")
		return
	}

	utils.SuccessWithMessage(c, "patient created successfully", patient)
}

func UpdatePatient(c *gin.Context) {
	id := c.Param("id")

	var patient models.Patient
	if err := database.DB.First(&patient, id).Error; err != nil {
		utils.NotFound(c, "patient not found")
		return
	}

	var input models.Patient
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if input.PatientNo != "" {
		var existingPatient models.Patient
		if err := database.DB.Where("patient_no = ? AND id != ?", input.PatientNo, id).First(&existingPatient).Error; err == nil {
			utils.BadRequest(c, "patient number already exists")
			return
		}
		patient.PatientNo = input.PatientNo
	}

	if input.Name != "" {
		patient.Name = input.Name
	}
	if input.Gender != "" {
		patient.Gender = input.Gender
	}
	if input.BirthDate != nil {
		patient.BirthDate = input.BirthDate
	}
	if input.IDCard != "" {
		patient.IDCard = input.IDCard
	}
	if input.Phone != "" {
		patient.Phone = input.Phone
	}
	if input.Address != "" {
		patient.Address = input.Address
	}
	if input.EmergencyContact != "" {
		patient.EmergencyContact = input.EmergencyContact
	}
	if input.EmergencyPhone != "" {
		patient.EmergencyPhone = input.EmergencyPhone
	}
	if input.Allergies != "" {
		patient.Allergies = input.Allergies
	}
	if input.MedicalHistory != "" {
		patient.MedicalHistory = input.MedicalHistory
	}

	if err := database.DB.Save(&patient).Error; err != nil {
		utils.InternalError(c, "failed to update patient")
		return
	}

	utils.SuccessWithMessage(c, "patient updated successfully", patient)
}

func DeletePatient(c *gin.Context) {
	id := c.Param("id")

	var patient models.Patient
	if err := database.DB.First(&patient, id).Error; err != nil {
		utils.NotFound(c, "patient not found")
		return
	}

	if err := database.DB.Delete(&patient).Error; err != nil {
		utils.InternalError(c, "failed to delete patient")
		return
	}

	utils.SuccessWithMessage(c, "patient deleted successfully", nil)
}
