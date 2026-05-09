package handlers

import (
	"net/http"
	"student-management/database"
	"student-management/models"

	"github.com/gin-gonic/gin"
)

type BatchDeleteRequest struct {
	IDs []uint `json:"ids" binding:"required"`
}

func GetStudents(c *gin.Context) {
	studentNo := c.Query("studentNo")
	name := c.Query("name")
	
	var students []models.Student
	query := database.DB
	
	if studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if name != "" {
		query = query.Where("name LIKE ?", "%"+name+"%")
	}
	
	query.Find(&students)
	c.JSON(http.StatusOK, gin.H{"data": students})
}

func GetStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	
	if err := database.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": student})
}

func CreateStudent(c *gin.Context) {
	var student models.Student
	
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	var existing models.Student
	if database.DB.Where("student_no = ?", student.StudentNo).First(&existing).Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "StudentNo already exists"})
		return
	}
	
	if err := database.DB.Create(&student).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": student})
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")
	var student models.Student
	
	if err := database.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	
	if err := c.ShouldBindJSON(&student); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if err := database.DB.Save(&student).Error; err != nil {
		if IsForeignKeyError(err) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot update student: there are grades associated with this student"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"data": student})
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")
	
	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Student not found"})
		return
	}
	
	hasGrades, err := StudentHasGrades(student.StudentNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check grades"})
		return
	}
	if hasGrades {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Cannot delete student: there are grades associated with this student",
			"detail":  "StudentNo: " + student.StudentNo,
		})
		return
	}
	
	result := database.DB.Delete(&models.Student{}, id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"message": "Student deleted successfully"})
}

func BatchDeleteStudents(c *gin.Context) {
	var req BatchDeleteRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if len(req.IDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No IDs provided"})
		return
	}
	
	var students []models.Student
	if err := database.DB.Find(&students, req.IDs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find students"})
		return
	}
	
	for _, student := range students {
		hasGrades, err := StudentHasGrades(student.StudentNo)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check grades"})
			return
		}
		if hasGrades {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Cannot delete student: there are grades associated with this student",
				"detail":  "StudentNo: " + student.StudentNo,
			})
			return
		}
	}
	
	result := database.DB.Delete(&models.Student{}, req.IDs)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"message": "Students deleted successfully",
		"count":   result.RowsAffected,
	})
}
