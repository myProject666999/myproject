package controllers

import (
	"net/http"
	"strconv"

	"english-learning/database"

	"github.com/gin-gonic/gin"
)

func GetAnnouncements(c *gin.Context) {
	announcements := database.DB.GetAllAnnouncements()
	c.JSON(http.StatusOK, announcements)
}

func GetLatestAnnouncements(c *gin.Context) {
	announcements := database.DB.GetLatestAnnouncements(5)
	c.JSON(http.StatusOK, announcements)
}

func GetAnnouncement(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	announcement, err := database.DB.GetAnnouncementByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Announcement not found"})
		return
	}
	c.JSON(http.StatusOK, announcement)
}
