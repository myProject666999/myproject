package controllers

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"hospital-medical-record/config"
	"hospital-medical-record/database"
	"hospital-medical-record/models"
	"hospital-medical-record/utils"

	"github.com/gin-gonic/gin"
)

func GetMedicines(c *gin.Context) {
	page, pageSize := utils.GetPaginationParams(c)
	keyword := c.Query("keyword")
	category := c.Query("category")
	status := c.Query("status")

	db := database.DB.Model(&models.Medicine{})

	if keyword != "" {
		likePattern := "%" + strings.ToLower(keyword) + "%"
		db = db.Where("LOWER(medicine_no) LIKE ? OR LOWER(name) LIKE ? OR LOWER(generic_name) LIKE ? OR LOWER(manufacturer) LIKE ?", likePattern, likePattern, likePattern, likePattern)
	}

	if category != "" {
		db = db.Where("category = ?", category)
	}

	if status != "" {
		db = db.Where("status = ?", status)
	}

	var total int64
	db.Count(&total)

	var medicines []models.Medicine
	offset := (page - 1) * pageSize
	db.Order("id DESC").Offset(offset).Limit(pageSize).Find(&medicines)

	utils.Success(c, utils.NewPagination(page, pageSize, total, medicines))
}

func GetMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine models.Medicine
	if err := database.DB.First(&medicine, id).Error; err != nil {
		utils.NotFound(c, "medicine not found")
		return
	}

	utils.Success(c, medicine)
}

func CreateMedicine(c *gin.Context) {
	var medicine models.Medicine
	if err := c.ShouldBindJSON(&medicine); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	var existingMedicine models.Medicine
	if err := database.DB.Where("medicine_no = ?", medicine.MedicineNo).First(&existingMedicine).Error; err == nil {
		utils.BadRequest(c, "medicine number already exists")
		return
	}

	if err := database.DB.Create(&medicine).Error; err != nil {
		utils.InternalError(c, "failed to create medicine")
		return
	}

	utils.SuccessWithMessage(c, "medicine created successfully", medicine)
}

func UpdateMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine models.Medicine
	if err := database.DB.First(&medicine, id).Error; err != nil {
		utils.NotFound(c, "medicine not found")
		return
	}

	var input models.Medicine
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "invalid request format")
		return
	}

	if input.MedicineNo != "" {
		var existingMedicine models.Medicine
		if err := database.DB.Where("medicine_no = ? AND id != ?", input.MedicineNo, id).First(&existingMedicine).Error; err == nil {
			utils.BadRequest(c, "medicine number already exists")
			return
		}
		medicine.MedicineNo = input.MedicineNo
	}

	if input.Name != "" {
		medicine.Name = input.Name
	}
	if input.GenericName != "" {
		medicine.GenericName = input.GenericName
	}
	if input.Manufacturer != "" {
		medicine.Manufacturer = input.Manufacturer
	}
	if input.Specification != "" {
		medicine.Specification = input.Specification
	}
	if input.DosageForm != "" {
		medicine.DosageForm = input.DosageForm
	}
	if input.Category != "" {
		medicine.Category = input.Category
	}
	if input.Unit != "" {
		medicine.Unit = input.Unit
	}
	if input.Price != 0 {
		medicine.Price = input.Price
	}
	if input.Stock != 0 {
		medicine.Stock = input.Stock
	}
	if input.Description != "" {
		medicine.Description = input.Description
	}
	if input.ImageURL != "" {
		medicine.ImageURL = input.ImageURL
	}

	if err := database.DB.Save(&medicine).Error; err != nil {
		utils.InternalError(c, "failed to update medicine")
		return
	}

	utils.SuccessWithMessage(c, "medicine updated successfully", medicine)
}

func DeleteMedicine(c *gin.Context) {
	id := c.Param("id")

	var medicine models.Medicine
	if err := database.DB.First(&medicine, id).Error; err != nil {
		utils.NotFound(c, "medicine not found")
		return
	}

	if err := database.DB.Delete(&medicine).Error; err != nil {
		utils.InternalError(c, "failed to delete medicine")
		return
	}

	utils.SuccessWithMessage(c, "medicine deleted successfully", nil)
}

func UploadMedicineImage(c *gin.Context) {
	uploadDir := config.AppConfig.Upload.Dir
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		utils.InternalError(c, "failed to create upload directory")
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		utils.BadRequest(c, "no image file uploaded")
		return
	}
	defer file.Close()

	if header.Size > config.AppConfig.Upload.MaxSize {
		utils.BadRequest(c, "file size exceeds limit")
		return
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}
	if !allowedExts[ext] {
		utils.BadRequest(c, "unsupported file format")
		return
	}

	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%d%s", timestamp, ext)
	filepath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(filepath)
	if err != nil {
		utils.InternalError(c, "failed to save file")
		return
	}
	defer dst.Close()

	if _, err = io.Copy(dst, file); err != nil {
		utils.InternalError(c, "failed to save file")
		return
	}

	imageURL := fmt.Sprintf("/uploads/%s", filename)
	utils.Success(c, gin.H{
		"url": imageURL,
	})
}
