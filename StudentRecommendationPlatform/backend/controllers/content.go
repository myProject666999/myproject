package controllers

import (
	"net/http"
	"strconv"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func ListBooks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.Book{})
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR author LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	var books []models.Book

	query.Count(&total)
	query.Preload("Category").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&books)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      books,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetBook(c *gin.Context) {
	id := c.Param("id")

	var book models.Book
	if err := config.DB.Preload("Category").First(&book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "书籍不存在"})
		return
	}

	config.DB.Model(&book).UpdateColumn("views", book.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": book})
}

func ListAdminBooks(c *gin.Context) {
	ListBooks(c)
}

func CreateBook(c *gin.Context) {
	var book models.Book
	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&book).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": book})
}

func UpdateBook(c *gin.Context) {
	id := c.Param("id")

	var book models.Book
	if err := config.DB.First(&book, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "书籍不存在"})
		return
	}

	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&book)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": book})
}

func DeleteBook(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Book{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListKnowledgePoints(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.KnowledgePoint{})
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	var points []models.KnowledgePoint

	query.Count(&total)
	query.Preload("Category").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&points)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      points,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetKnowledgePoint(c *gin.Context) {
	id := c.Param("id")

	var point models.KnowledgePoint
	if err := config.DB.Preload("Category").First(&point, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "知识点不存在"})
		return
	}

	config.DB.Model(&point).UpdateColumn("views", point.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": point})
}

func ListAdminKnowledgePoints(c *gin.Context) {
	ListKnowledgePoints(c)
}

func CreateKnowledgePoint(c *gin.Context) {
	var point models.KnowledgePoint
	if err := c.ShouldBindJSON(&point); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&point).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": point})
}

func UpdateKnowledgePoint(c *gin.Context) {
	id := c.Param("id")

	var point models.KnowledgePoint
	if err := config.DB.First(&point, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "知识点不存在"})
		return
	}

	if err := c.ShouldBindJSON(&point); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&point)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": point})
}

func DeleteKnowledgePoint(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.KnowledgePoint{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ExportKnowledgePoints(c *gin.Context) {
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.KnowledgePoint{})
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var points []models.KnowledgePoint
	query.Preload("Category").Find(&points)

	f := excelize.NewFile()
	sheet := "Sheet1"

	headers := []string{"ID", "标题", "分类", "浏览量", "创建时间"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, header)
	}

	for i, point := range points {
		row := i + 2
		f.SetCellValue(sheet, "A"+strconv.Itoa(row), point.ID)
		f.SetCellValue(sheet, "B"+strconv.Itoa(row), point.Title)
		f.SetCellValue(sheet, "C"+strconv.Itoa(row), point.Category.Name)
		f.SetCellValue(sheet, "D"+strconv.Itoa(row), point.Views)
		f.SetCellValue(sheet, "E"+strconv.Itoa(row), point.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=knowledge_points.xlsx")
	f.Write(c.Writer)
}

func ListCourses(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")
	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.Course{})
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR teacher LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	var courses []models.Course

	query.Count(&total)
	query.Preload("Category").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&courses)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      courses,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetCourse(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := config.DB.Preload("Category").First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "课程不存在"})
		return
	}

	config.DB.Model(&course).UpdateColumn("views", course.Views+1)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": course})
}

func ListAdminCourses(c *gin.Context) {
	ListCourses(c)
}

func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": course})
}

func UpdateCourse(c *gin.Context) {
	id := c.Param("id")

	var course models.Course
	if err := config.DB.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "课程不存在"})
		return
	}

	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Save(&course)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": course})
}

func DeleteCourse(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Course{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ExportCourses(c *gin.Context) {
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	query := config.DB.Model(&models.Course{})
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR teacher LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var courses []models.Course
	query.Preload("Category").Find(&courses)

	f := excelize.NewFile()
	sheet := "Sheet1"

	headers := []string{"ID", "标题", "讲师", "分类", "浏览量", "创建时间"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, header)
	}

	for i, course := range courses {
		row := i + 2
		f.SetCellValue(sheet, "A"+strconv.Itoa(row), course.ID)
		f.SetCellValue(sheet, "B"+strconv.Itoa(row), course.Title)
		f.SetCellValue(sheet, "C"+strconv.Itoa(row), course.Teacher)
		f.SetCellValue(sheet, "D"+strconv.Itoa(row), course.Category.Name)
		f.SetCellValue(sheet, "E"+strconv.Itoa(row), course.Views)
		f.SetCellValue(sheet, "F"+strconv.Itoa(row), course.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=courses.xlsx")
	f.Write(c.Writer)
}

func ListCourseComments(c *gin.Context) {
	courseID := c.Param("id")

	var comments []models.Comment
	config.DB.Where("type = ? AND target_id = ?", "course", courseID).Preload("User").Find(&comments)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": comments})
}
