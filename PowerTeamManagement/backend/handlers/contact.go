package handlers

import (
	"net/http"
	"strconv"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateContactRequest struct {
	CustomerID uint   `json:"customer_id" binding:"required"`
	Name       string `json:"name" binding:"required"`
	Position   string `json:"position"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Wechat     string `json:"wechat"`
	Address    string `json:"address"`
	IsPrimary  bool   `json:"is_primary"`
	Remark     string `json:"remark"`
}

func GetContacts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")
	customerID := c.Query("customer_id")

	offset := (page - 1) * pageSize

	var contacts []models.Contact
	var total int64

	query := database.DB.Preload("Customer")

	if search != "" {
		query = query.Where("name LIKE ? OR phone LIKE ? OR email LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if customerID != "" {
		query = query.Where("customer_id = ?", customerID)
	}

	query.Model(&models.Contact{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&contacts)

	c.JSON(http.StatusOK, gin.H{
		"data":      contacts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetContact(c *gin.Context) {
	id := c.Param("id")

	var contact models.Contact
	if err := database.DB.Preload("Customer").First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	c.JSON(http.StatusOK, contact)
}

func CreateContact(c *gin.Context) {
	var req CreateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contact := models.Contact{
		CustomerID: req.CustomerID,
		Name:       req.Name,
		Position:   req.Position,
		Phone:      req.Phone,
		Email:      req.Email,
		Wechat:     req.Wechat,
		Address:    req.Address,
		IsPrimary:  req.IsPrimary,
		Remark:     req.Remark,
	}

	if err := database.DB.Create(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create contact"})
		return
	}

	c.JSON(http.StatusCreated, contact)
}

func UpdateContact(c *gin.Context) {
	id := c.Param("id")

	var req CreateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var contact models.Contact
	if err := database.DB.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	contact.CustomerID = req.CustomerID
	contact.Name = req.Name
	contact.Position = req.Position
	contact.Phone = req.Phone
	contact.Email = req.Email
	contact.Wechat = req.Wechat
	contact.Address = req.Address
	contact.IsPrimary = req.IsPrimary
	contact.Remark = req.Remark

	if err := database.DB.Save(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update contact"})
		return
	}

	c.JSON(http.StatusOK, contact)
}

func DeleteContact(c *gin.Context) {
	id := c.Param("id")

	var contact models.Contact
	if err := database.DB.First(&contact, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
		return
	}

	if err := database.DB.Delete(&contact).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete contact"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}
