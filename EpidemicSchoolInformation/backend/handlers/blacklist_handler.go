package handlers

import (
	"net/http"

	"github.com/epidemic-system/database"
	"github.com/epidemic-system/models"
	"github.com/gin-gonic/gin"
)

func GetBlacklists(c *gin.Context) {
	var blacklists []models.Blacklist
	query := database.DB
	if keyword := c.Query("keyword"); keyword != "" {
		query = query.Where("name LIKE ? OR id_card LIKE ? OR phone LIKE ? OR reason LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	query.Find(&blacklists)
	c.JSON(http.StatusOK, blacklists)
}

func GetBlacklist(c *gin.Context) {
	id := c.Param("id")
	var blacklist models.Blacklist
	if err := database.DB.First(&blacklist, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blacklist not found"})
		return
	}
	c.JSON(http.StatusOK, blacklist)
}

func CreateBlacklist(c *gin.Context) {
	var blacklist models.Blacklist
	if err := c.ShouldBindJSON(&blacklist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&blacklist)
	c.JSON(http.StatusCreated, blacklist)
}

func UpdateBlacklist(c *gin.Context) {
	id := c.Param("id")
	var blacklist models.Blacklist
	if err := database.DB.First(&blacklist, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blacklist not found"})
		return
	}
	if err := c.ShouldBindJSON(&blacklist); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&blacklist)
	c.JSON(http.StatusOK, blacklist)
}

func DeleteBlacklist(c *gin.Context) {
	id := c.Param("id")
	var blacklist models.Blacklist
	if err := database.DB.First(&blacklist, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blacklist not found"})
		return
	}
	database.DB.Delete(&blacklist)
	c.JSON(http.StatusOK, gin.H{"message": "Blacklist deleted successfully", "id": id})
}

func SearchBlacklists(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Keyword is required"})
		return
	}
	var blacklists []models.Blacklist
	database.DB.Where("name LIKE ? OR id_card LIKE ? OR phone LIKE ? OR reason LIKE ?", 
		"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%").Find(&blacklists)
	c.JSON(http.StatusOK, blacklists)
}
