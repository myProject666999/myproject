package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"excel-viewer/config"
	"excel-viewer/models"
	"excel-viewer/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

func UploadExcel(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	ext := filepath.Ext(file.Filename)
	if ext != ".xlsx" && ext != ".xls" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only Excel files are allowed"})
		return
	}

	storedName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePath := filepath.Join(config.GetUploadDir(), storedName)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	f, err := excelize.OpenFile(filePath)
	if err != nil {
		os.Remove(filePath)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Excel file"})
		return
	}
	defer f.Close()

	sheetCount := len(f.GetSheetList())

	excelFile := &models.ExcelFile{
		Filename:   file.Filename,
		StoredName: storedName,
		FilePath:   filePath,
		FileSize:   file.Size,
		SheetCount: sheetCount,
	}

	if err := models.CreateExcelFile(excelFile); err != nil {
		log.Printf("Failed to save file info: %v", err)
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file info: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":          excelFile.ID,
		"filename":    excelFile.Filename,
		"sheet_count": excelFile.SheetCount,
		"sheets":      f.GetSheetList(),
	})
}

func GetExcelInfo(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	excelFile, err := models.GetExcelFileByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	f, err := excelize.OpenFile(excelFile.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer f.Close()

	c.JSON(http.StatusOK, gin.H{
		"id":          excelFile.ID,
		"filename":    excelFile.Filename,
		"sheet_count": excelFile.SheetCount,
		"sheets":      f.GetSheetList(),
	})
}

func GetSheetData(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	sheetName := c.Query("sheet")

	excelFile, err := models.GetExcelFileByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	f, err := excelize.OpenFile(excelFile.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer f.Close()

	if sheetName == "" {
		sheetName = f.GetSheetList()[0]
	}

	data, err := utils.GetSheetData(f, sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read sheet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sheet":     data.Name,
		"sheets":    f.GetSheetList(),
		"rows":      data.Rows,
		"filename":  excelFile.Filename,
	})
}

func ExportCSV(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	sheetName := c.Query("sheet")

	excelFile, err := models.GetExcelFileByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	f, err := excelize.OpenFile(excelFile.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer f.Close()

	if sheetName == "" {
		sheetName = f.GetSheetList()[0]
	}

	csvPath, err := utils.ExportToCSV(f, sheetName, config.GetUploadDir())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to export CSV"})
		return
	}

	c.FileAttachment(csvPath, fmt.Sprintf("%s.csv", sheetName))
}

func CreateShareLink(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))

	excelFile, err := models.GetExcelFileByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	token := utils.GenerateShareToken()
	expireAt := time.Now().AddDate(0, 0, days)

	excelFile.ShareToken = &token
	excelFile.ShareExpireAt = &expireAt

	if err := models.UpdateExcelFile(excelFile); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create share link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"share_token": token,
		"expire_at":   expireAt,
		"share_url":   fmt.Sprintf("/share/%s", token),
	})
}

func GetSharedSheetData(c *gin.Context) {
	token := c.Param("token")
	sheetName := c.Query("sheet")

	excelFile, err := models.GetExcelFileByToken(token)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Share link not found or expired"})
		return
	}

	if excelFile.ShareExpireAt != nil && time.Now().After(*excelFile.ShareExpireAt) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Share link expired"})
		return
	}

	f, err := excelize.OpenFile(excelFile.FilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
		return
	}
	defer f.Close()

	if sheetName == "" {
		sheetName = f.GetSheetList()[0]
	}

	data, err := utils.GetSheetData(f, sheetName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read sheet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sheet":     data.Name,
		"sheets":    f.GetSheetList(),
		"rows":      data.Rows,
		"filename":  excelFile.Filename,
	})
}
