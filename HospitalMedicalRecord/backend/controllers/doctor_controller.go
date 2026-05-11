package controllers

import (
	"strings"

	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

func GetDoctors(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	department := c.Query("department")

	db := database.DB.Model(&models.Doctor{}).Preload("User")

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(employee_no) LIKE ? OR LOWER(department) LIKE ? OR LOWER(specialty) LIKE ?", likePattern, likePattern, likePattern)
	}

	if department != "" {
		db = db.Where("department = ?", department)
	}

	var total int64
	db.Count(&total)

	var doctors []models.Doctor
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&doctors)

	utils.Success(c, utils.NewPagination(page, pageSize, total, doctors))
}

func GetDoctor(c *gin.Context) {
	id := c.Param("id")

	var doctor models.Doctor
	if err := database.DB.Preload("User").First(&doctor, id).Error; err != nil {
		utils.NotFound(c, "doctor not found")
		return
	}

	utils.Success(c, doctor)
}

func CreateDoctor(c *gin.Context) {
	var doctor models.Doctor
	if err := c.ShouldBindJSON(&doctor); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingDoctor models.Doctor
	if err := database.DB.Where("employee_no = ?", doctor.EmployeeNo).First(&existingDoctor).Error; err == nil {
		utils.BadRequest(c, "employee number already exists")
		return
	}

	if err := database.DB.Create(&doctor).Error; err != nil {
		utils.InternalError(c, "failed to create doctor")
		return
	}

	utils.SuccessWithMessage(c, "doctor created successfully", doctor)
}

func UpdateDoctor(c *gin.Context) {
	id := c.Param("id")

	var doctor models.Doctor
	if err := database.DB.First(&doctor, id).Error; err != nil {
		utils.NotFound(c, "doctor not found")
		return
	}

	var input models.Doctor
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if input.EmployeeNo != "" {
		var existingDoctor models.Doctor
		if err := database.DB.Where("employee_no = ? AND id != ?", input.EmployeeNo, id).First(&existingDoctor).Error; err == nil {
			utils.BadRequest(c, "employee number already exists")
			return
		}
		doctor.EmployeeNo = input.EmployeeNo
	}

	if input.Department != "" {
		doctor.Department = input.Department
	}
	if input.Title != "" {
		doctor.Title = input.Title
	}
	if input.Specialty != "" {
		doctor.Specialty = input.Specialty
	}
	if input.UserID != nil {
		doctor.UserID = input.UserID
	}

	if err := database.DB.Save(&doctor).Error; err != nil {
		utils.InternalError(c, "failed to update doctor")
		return
	}

	utils.SuccessWithMessage(c, "doctor updated successfully", doctor)
}

func DeleteDoctor(c *gin.Context) {
	id := c.Param("id")

	var doctor models.Doctor
	if err := database.DB.First(&doctor, id).Error; err != nil {
		utils.NotFound(c, "doctor not found")
		return
	}

	if err := database.DB.Delete(&doctor).Error; err != nil {
		utils.InternalError(c, "failed to delete doctor")
		return
	}

	utils.SuccessWithMessage(c, "doctor deleted successfully", nil)
}
