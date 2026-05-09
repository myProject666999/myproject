package controllers

import (
	"net/http"
	"sort"
	"strconv"
	"time"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func ListBooks(c *gin.Context) {
	page, pageSize := parsePageInfo(c)
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	config.DB.Lock()
	defer config.DB.Unlock()

	var books []models.Book
	for _, book := range config.DB.Books {
		if categoryID != "" && book.CategoryID != parseUint(categoryID) {
			continue
		}
		if keyword != "" && !config.Contains(book.Title, keyword) && !config.Contains(book.Author, keyword) {
			continue
		}
		books = append(books, book)
	}

	sort.Slice(books, func(i, j int) bool {
		return books[i].CreatedAt.After(books[j].CreatedAt)
	})

	for i := range books {
		books[i].Category = config.DB.GetCategory(books[i].CategoryID)
	}

	paginated, total := paginate(books, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetBook(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	book, exists := config.DB.Books[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "书籍不存在"})
		return
	}

	book.Views++
	book.Category = config.DB.GetCategory(book.CategoryID)
	config.DB.Books[id] = book

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

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.BookIDCounter++
	book.ID = config.DB.BookIDCounter
	book.CreatedAt = time.Now()
	book.UpdatedAt = time.Now()
	config.DB.Books[book.ID] = book

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": book})
}

func UpdateBook(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	book, exists := config.DB.Books[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "书籍不存在"})
		return
	}

	if err := c.ShouldBindJSON(&book); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	book.ID = id
	book.UpdatedAt = time.Now()
	config.DB.Books[id] = book

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": book})
}

func DeleteBook(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Books, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListKnowledgePoints(c *gin.Context) {
	page, pageSize := parsePageInfo(c)
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	config.DB.Lock()
	defer config.DB.Unlock()

	var points []models.KnowledgePoint
	for _, point := range config.DB.KnowledgePoints {
		if categoryID != "" && point.CategoryID != parseUint(categoryID) {
			continue
		}
		if keyword != "" && !config.Contains(point.Title, keyword) {
			continue
		}
		points = append(points, point)
	}

	sort.Slice(points, func(i, j int) bool {
		return points[i].CreatedAt.After(points[j].CreatedAt)
	})

	for i := range points {
		points[i].Category = config.DB.GetCategory(points[i].CategoryID)
	}

	paginated, total := paginate(points, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetKnowledgePoint(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	point, exists := config.DB.KnowledgePoints[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "知识点不存在"})
		return
	}

	point.Views++
	point.Category = config.DB.GetCategory(point.CategoryID)
	config.DB.KnowledgePoints[id] = point

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

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.KnowledgePointIDCounter++
	point.ID = config.DB.KnowledgePointIDCounter
	point.CreatedAt = time.Now()
	point.UpdatedAt = time.Now()
	config.DB.KnowledgePoints[point.ID] = point

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": point})
}

func UpdateKnowledgePoint(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	point, exists := config.DB.KnowledgePoints[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "知识点不存在"})
		return
	}

	if err := c.ShouldBindJSON(&point); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	point.ID = id
	point.UpdatedAt = time.Now()
	config.DB.KnowledgePoints[id] = point

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": point})
}

func DeleteKnowledgePoint(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.KnowledgePoints, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ExportKnowledgePoints(c *gin.Context) {
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	config.DB.Lock()
	defer config.DB.Unlock()

	var points []models.KnowledgePoint
	for _, point := range config.DB.KnowledgePoints {
		if categoryID != "" && point.CategoryID != parseUint(categoryID) {
			continue
		}
		if keyword != "" && !config.Contains(point.Title, keyword) {
			continue
		}
		points = append(points, point)
	}

	f := excelize.NewFile()
	sheet := "Sheet1"

	headers := []string{"ID", "标题", "分类", "浏览量", "创建时间"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, header)
	}

	for i, point := range points {
		row := i + 2
		categoryName := "-"
		if category := config.DB.GetCategory(point.CategoryID); category.ID > 0 {
			categoryName = category.Name
		}
		f.SetCellValue(sheet, "A"+itoa(row), point.ID)
		f.SetCellValue(sheet, "B"+itoa(row), point.Title)
		f.SetCellValue(sheet, "C"+itoa(row), categoryName)
		f.SetCellValue(sheet, "D"+itoa(row), point.Views)
		f.SetCellValue(sheet, "E"+itoa(row), point.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=knowledge_points.xlsx")
	f.Write(c.Writer)
}

func ListCourses(c *gin.Context) {
	page, pageSize := parsePageInfo(c)
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	config.DB.Lock()
	defer config.DB.Unlock()

	var courses []models.Course
	for _, course := range config.DB.Courses {
		if categoryID != "" && course.CategoryID != parseUint(categoryID) {
			continue
		}
		if keyword != "" && !config.Contains(course.Title, keyword) && !config.Contains(course.Teacher, keyword) {
			continue
		}
		courses = append(courses, course)
	}

	sort.Slice(courses, func(i, j int) bool {
		return courses[i].CreatedAt.After(courses[j].CreatedAt)
	})

	for i := range courses {
		courses[i].Category = config.DB.GetCategory(courses[i].CategoryID)
	}

	paginated, total := paginate(courses, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetCourse(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	course, exists := config.DB.Courses[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "课程不存在"})
		return
	}

	course.Views++
	course.Category = config.DB.GetCategory(course.CategoryID)
	config.DB.Courses[id] = course

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

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.CourseIDCounter++
	course.ID = config.DB.CourseIDCounter
	course.CreatedAt = time.Now()
	course.UpdatedAt = time.Now()
	config.DB.Courses[course.ID] = course

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": course})
}

func UpdateCourse(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	course, exists := config.DB.Courses[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "课程不存在"})
		return
	}

	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	course.ID = id
	course.UpdatedAt = time.Now()
	config.DB.Courses[id] = course

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": course})
}

func DeleteCourse(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Courses, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ExportCourses(c *gin.Context) {
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	config.DB.Lock()
	defer config.DB.Unlock()

	var courses []models.Course
	for _, course := range config.DB.Courses {
		if categoryID != "" && course.CategoryID != parseUint(categoryID) {
			continue
		}
		if keyword != "" && !config.Contains(course.Title, keyword) && !config.Contains(course.Teacher, keyword) {
			continue
		}
		courses = append(courses, course)
	}

	f := excelize.NewFile()
	sheet := "Sheet1"

	headers := []string{"ID", "标题", "讲师", "分类", "浏览量", "创建时间"}
	for i, header := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, header)
	}

	for i, course := range courses {
		row := i + 2
		categoryName := "-"
		if category := config.DB.GetCategory(course.CategoryID); category.ID > 0 {
			categoryName = category.Name
		}
		f.SetCellValue(sheet, "A"+itoa(row), course.ID)
		f.SetCellValue(sheet, "B"+itoa(row), course.Title)
		f.SetCellValue(sheet, "C"+itoa(row), course.Teacher)
		f.SetCellValue(sheet, "D"+itoa(row), categoryName)
		f.SetCellValue(sheet, "E"+itoa(row), course.Views)
		f.SetCellValue(sheet, "F"+itoa(row), course.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=courses.xlsx")
	f.Write(c.Writer)
}

func ListCourseComments(c *gin.Context) {
	courseID := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	var comments []models.Comment
	for _, comment := range config.DB.Comments {
		if comment.Type == "course" && comment.TargetID == courseID {
			comment.User = config.DB.GetUser(comment.UserID)
			comments = append(comments, comment)
		}
	}

	sort.Slice(comments, func(i, j int) bool {
		return comments[i].CreatedAt.After(comments[j].CreatedAt)
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": comments})
}

func itoa(i int) string {
	return strconv.Itoa(i)
}
