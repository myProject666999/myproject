package handlers

import (
	"net/http"
	"strconv"
	"time"

	"power-team-management/database"
	"power-team-management/models"

	"github.com/gin-gonic/gin"
)

type CreateOpportunityRequest struct {
	Name          string                 `json:"name" binding:"required"`
	CustomerID    uint                   `json:"customer_id" binding:"required"`
	Status        models.OpportunityStatus `json:"status"`
	Amount        float64                `json:"amount"`
	Probability   int                    `json:"probability"`
	ExpectedClose *time.Time             `json:"expected_close"`
	Description   string                 `json:"description"`
	AssignedToID  uint                   `json:"assigned_to_id"`
}

func GetOpportunities(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	search := c.Query("search")
	assignedTo := c.Query("assigned_to")

	offset := (page - 1) * pageSize

	var opportunities []models.Opportunity
	var total int64

	query := database.DB.Preload("Customer").Preload("AssignedTo")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	if assignedTo != "" {
		query = query.Where("assigned_to_id = ?", assignedTo)
	}

	query.Model(&models.Opportunity{}).Count(&total)
	query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&opportunities)

	c.JSON(http.StatusOK, gin.H{
		"data":      opportunities,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity models.Opportunity
	if err := database.DB.Preload("Customer").Preload("AssignedTo").Preload("CreatedBy").First(&opportunity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opportunity not found"})
		return
	}

	c.JSON(http.StatusOK, opportunity)
}

func CreateOpportunity(c *gin.Context) {
	var req CreateOpportunityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	status := req.Status
	if status == "" {
		status = models.StatusNew
	}

	opportunity := models.Opportunity{
		Name:          req.Name,
		CustomerID:    req.CustomerID,
		Status:        status,
		Amount:        req.Amount,
		Probability:   req.Probability,
		ExpectedClose: req.ExpectedClose,
		Description:   req.Description,
		AssignedToID:  req.AssignedToID,
		CreatedByID:   userID.(uint),
	}

	if err := database.DB.Create(&opportunity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create opportunity"})
		return
	}

	c.JSON(http.StatusCreated, opportunity)
}

func UpdateOpportunity(c *gin.Context) {
	id := c.Param("id")

	var req CreateOpportunityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var opportunity models.Opportunity
	if err := database.DB.First(&opportunity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opportunity not found"})
		return
	}

	opportunity.Name = req.Name
	opportunity.CustomerID = req.CustomerID
	if req.Status != "" {
		opportunity.Status = req.Status
	}
	opportunity.Amount = req.Amount
	opportunity.Probability = req.Probability
	opportunity.ExpectedClose = req.ExpectedClose
	opportunity.Description = req.Description
	opportunity.AssignedToID = req.AssignedToID

	if err := database.DB.Save(&opportunity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update opportunity"})
		return
	}

	c.JSON(http.StatusOK, opportunity)
}

func DeleteOpportunity(c *gin.Context) {
	id := c.Param("id")

	var opportunity models.Opportunity
	if err := database.DB.First(&opportunity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Opportunity not found"})
		return
	}

	if err := database.DB.Delete(&opportunity).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete opportunity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Opportunity deleted successfully"})
}
