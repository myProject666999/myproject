package controllers

import (
	"net/http"
	"recruithub/config"
	"recruithub/models"

	"github.com/gin-gonic/gin"
)

func GetCompanies(c *gin.Context) {
	isFamous := c.Query("famous")

	query := config.DB.Where("verified = ?", true)
	if isFamous == "true" {
		query = query.Where("is_famous = ?", true)
	}

	var companies []models.Company
	query.Order("created_at DESC").Find(&companies)

	c.JSON(http.StatusOK, gin.H{"companies": companies})
}

func GetFamousCompanies(c *gin.Context) {
	var companies []models.Company
	config.DB.Where("is_famous = ? AND verified = ?", true, true).Find(&companies)
	c.JSON(http.StatusOK, gin.H{"companies": companies})
}

func GetCompanyDetail(c *gin.Context) {
	id := c.Param("id")

	var company models.Company
	if err := config.DB.First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "企业不存在"})
		return
	}

	var jobs []models.Job
	config.DB.Where("company_id = ? AND status = ?", id, 1).Order("created_at DESC").Find(&jobs)

	c.JSON(http.StatusOK, gin.H{"company": company, "jobs": jobs})
}

func CreateCompany(c *gin.Context) {
	userID := c.GetUint("user_id")

	var existingCompany models.Company
	if err := config.DB.Where("user_id = ?", userID).First(&existingCompany).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "已存在企业信息"})
		return
	}

	var company models.Company
	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	company.UserID = userID

	if err := config.DB.Create(&company).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "创建成功", "company": company})
}

func UpdateCompany(c *gin.Context) {
	userID := c.GetUint("user_id")

	var company models.Company
	if err := config.DB.Where("user_id = ?", userID).First(&company).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "企业信息不存在"})
		return
	}

	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&company)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "company": company})
}
