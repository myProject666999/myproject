package controllers

import (
	"strings"

	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

func GetNurses(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	department := c.Query("department")

	db := database.DB.Model(&models.Nurse{}).Preload("User")

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(employee_no) LIKE ? OR LOWER(department) LIKE ?", likePattern, likePattern)
	}

	if department != "" {
		db = db.Where("department = ?", department)
	}

	var total int64
	db.Count(&total)

	var nurses []models.Nurse
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&nurses)

	utils.Success(c, utils.NewPagination(page, pageSize, total, nurses))
}

func GetNurse(c *gin.Context) {
	id := c.Param("id")

	var nurse models.Nurse
	if err := database.DB.Preload("User").First(&nurse, id).Error; err != nil {
		utils.NotFound(c, "nurse not found")
		return
	}

	utils.Success(c, nurse)
}

func CreateNurse(c *gin.Context) {
	var nurse models.Nurse
	if err := c.ShouldBindJSON(&nurse); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingNurse models.Nurse
	if err := database.DB.Where("employee_no = ?", nurse.EmployeeNo).First(&existingNurse).Error; err == nil {
		utils.BadRequest(c, "employee number already exists")
		return
	}

	if err := database.DB.Create(&nurse).Error; err != nil {
		utils.InternalError(c, "failed to create nurse")
		return
	}

	utils.SuccessWithMessage(c, "nurse created successfully", nurse)
}

func UpdateNurse(c *gin.Context) {
	id := c.Param("id")

	var nurse models.Nurse
	if err := database.DB.First(&nurse, id).Error; err != nil {
		utils.NotFound(c, "nurse not found")
		return
	}

	var input models.Nurse
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if input.EmployeeNo != "" {
		var existingNurse models.Nurse
		if err := database.DB.Where("employee_no = ? AND id != ?", input.EmployeeNo, id).First(&existingNurse).Error; err == nil {
			utils.BadRequest(c, "employee number already exists")
			return
		}
		nurse.EmployeeNo = input.EmployeeNo
	}

	if input.Department != "" {
		nurse.Department = input.Department
	}
	if input.Title != "" {
		nurse.Title = input.Title
	}
	if input.UserID != nil {
		nurse.UserID = input.UserID
	}

	if err := database.DB.Save(&nurse).Error; err != nil {
		utils.InternalError(c, "failed to update nurse")
		return
	}

	utils.SuccessWithMessage(c, "nurse updated successfully", nurse)
}

func DeleteNurse(c *gin.Context) {
	id := c.Param("id")

	var nurse models.Nurse
	if err := database.DB.First(&nurse, id).Error; err != nil {
		utils.NotFound(c, "nurse not found")
		return
	}

	if err := database.DB.Delete(&nurse).Error; err != nil {
		utils.InternalError(c, "failed to delete nurse")
		return
	}

	utils.SuccessWithMessage(c, "nurse deleted successfully", nil)
}
