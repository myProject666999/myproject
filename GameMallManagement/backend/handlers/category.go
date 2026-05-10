package handlers

import (
	"gamemall/database"
	"gamemall/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, name FROM categories ORDER BY id")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败"})
		return
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var cat models.Category
		if err := rows.Scan(&cat.ID, &cat.Name); err != nil {
			continue
		}
		categories = append(categories, cat)
	}

	c.JSON(http.StatusOK, categories)
}

func CreateCategory(c *gin.Context) {
	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "分类名称不能为空"})
		return
	}

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM categories WHERE name = ?", input.Name).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "分类已存在"})
		return
	}

	result, err := database.DB.Exec("INSERT INTO categories (name) VALUES (?)", input.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	id, _ := result.LastInsertId()
	c.JSON(http.StatusOK, models.Category{ID: uint(id), Name: input.Name})
}

func UpdateCategory(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM categories WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "分类不存在"})
		return
	}

	var input struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "分类名称不能为空"})
		return
	}

	_, err = database.DB.Exec("UPDATE categories SET name = ? WHERE id = ?", input.Name, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败"})
		return
	}

	c.JSON(http.StatusOK, models.Category{ID: uint(existingID), Name: input.Name})
}

func DeleteCategory(c *gin.Context) {
	id := c.Param("id")

	var existingID int
	err := database.DB.QueryRow("SELECT id FROM categories WHERE id = ?", id).Scan(&existingID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "分类不存在"})
		return
	}

	_, err = database.DB.Exec("DELETE FROM categories WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
