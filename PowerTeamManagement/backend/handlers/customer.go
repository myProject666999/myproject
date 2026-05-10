package handlers

import (
	"net/http"
	"strconv"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateCustomerRequest struct {
	Name     string `json:"name" binding:"required"`
	Company  string `json:"company"`
	Industry string `json:"industry"`
	Address  string `json:"address"`
	Website  string `json:"website"`
	Remark   string `json:"remark"`
}

func GetCustomers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	search := c.Query("search")

	offset := (page - 1) * pageSize

	var customers []models.Customer
	var total int64

	query := database.DB.Preload("Contacts")

	if search != "" {
		query = query.Where("name LIKE ? OR company LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Model(&models.Customer{}).Count(&total)
	query.Offset(offset).Limit(pageSize).Find(&customers)

	c.JSON(http.StatusOK, gin.H{
		"data":      customers,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllCustomers(c *gin.Context) {
	var customers []models.Customer
	database.DB.Find(&customers)
	c.JSON(http.StatusOK, customers)
}

func GetCustomer(c *gin.Context) {
	id := c.Param("id")

	var customer models.Customer
	if err := database.DB.Preload("Contacts").First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

func CreateCustomer(c *gin.Context) {
	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	customer := models.Customer{
		Name:     req.Name,
		Company:  req.Company,
		Industry: req.Industry,
		Address:  req.Address,
		Website:  req.Website,
		Remark:   req.Remark,
		CreatedBy: userID.(uint),
	}

	if err := database.DB.Create(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create customer"})
		return
	}

	c.JSON(http.StatusCreated, customer)
}

func UpdateCustomer(c *gin.Context) {
	id := c.Param("id")

	var req CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var customer models.Customer
	if err := database.DB.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	customer.Name = req.Name
	customer.Company = req.Company
	customer.Industry = req.Industry
	customer.Address = req.Address
	customer.Website = req.Website
	customer.Remark = req.Remark

	if err := database.DB.Save(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update customer"})
		return
	}

	c.JSON(http.StatusOK, customer)
}

func DeleteCustomer(c *gin.Context) {
	id := c.Param("id")

	var customer models.Customer
	if err := database.DB.First(&customer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Customer not found"})
		return
	}

	if err := database.DB.Delete(&customer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete customer"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Customer deleted successfully"})
}
