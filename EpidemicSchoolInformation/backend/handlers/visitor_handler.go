package handlers

import (
	"net/http"

	"github.com/epidemic-system/database"
	"github.com/epidemic-system/models"
	"github.com/gin-gonic/gin"
)

func GetVisitors(c *gin.Context) {
	var visitors []models.Visitor
	query := database.DB
	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ? OR id_card LIKE ? OR phone LIKE ? OR visit_reason LIKE ? OR visit_person LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Find(&visitors)
	c.JSON(http.StatusOK, visitors)
}

func GetVisitor(c *gin.Context) {
	id := c.Param("id")
	var visitor models.Visitor
	if err := database.DB.First(&visitor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}
	c.JSON(http.StatusOK, visitor)
}

func CreateVisitor(c *gin.Context) {
	var visitor models.Visitor
	if err := c.ShouldBindJSON(&visitor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&visitor)
	c.JSON(http.StatusCreated, visitor)
}

func UpdateVisitor(c *gin.Context) {
	id := c.Param("id")
	var visitor models.Visitor
	if err := database.DB.First(&visitor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}
	if err := c.ShouldBindJSON(&visitor); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&visitor)
	c.JSON(http.StatusOK, visitor)
}

func DeleteVisitor(c *gin.Context) {
	id := c.Param("id")
	var visitor models.Visitor
	if err := database.DB.First(&visitor, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visitor not found"})
		return
	}
	database.DB.Delete(&visitor)
	c.JSON(http.StatusOK, gin.H{"message": "Visitor deleted successfully", "id": id})
}

func SearchVisitors(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keyword is required"})
		return
	}
	var visitors []models.Visitor
	database.DB.Where("name LIKE ? OR id_card LIKE ? OR phone LIKE ? OR visit_reason LIKE ? OR visit_person LIKE ? OR address LIKE ?", 
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%").Find(&visitors)
	c.JSON(http.StatusOK, visitors)
}
