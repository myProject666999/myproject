package controllers

import (
	"net/http"
	"strconv"

	"english-learning/database"

	"github.com/gin-gonic/gin"
)

func GetListeningMaterials(c *gin.Context) {
	level := c.Query("level")
	yearStr := c.Query("year")

	var year int
	if yearStr != "" {
		year, _ = strconv.Atoi(yearStr)
	}

	materials := database.DB.GetListeningMaterials(level, year)
	c.JSON(http.StatusOK, materials)
}

func GetListeningMaterial(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	material, err := database.DB.GetListeningMaterialByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Listening material not found"})
		return
	}
	c.JSON(http.StatusOK, material)
}

func GetAvailableYears(c *gin.Context) {
	level := c.Query("level")

	materials := database.DB.GetListeningMaterials(level, 0)
	yearSet := make(map[int]bool)
	for _, m := range materials {
		yearSet[m.Year] = true
	}

	years := make([]int, 0, len(yearSet))
	for y := range yearSet {
		years = append(years, y)
	}

	for i := range years {
		for j := i + 1; j < len(years); j++ {
			if years[i] < years[j] {
				years[i], years[j] = years[j], years[i]
			}
		}
	}

	c.JSON(http.StatusOK, years)
}
