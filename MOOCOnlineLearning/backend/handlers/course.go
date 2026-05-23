package handlers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"mooc-platform/middleware"
	"mooc-platform/models"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type CourseHandler struct {
	courseService *services.CourseService
}

func NewCourseHandler(courseService *services.CourseService) *CourseHandler {
	return &CourseHandler{courseService: courseService}
}

func (h *CourseHandler) Create(c *gin.Context) {
	var req struct {
		Title       string   `json:"title" binding:"required,max=200"`
		Description string   `json:"description" binding:"required"`
		CoverImage  string   `json:"cover_image"`
		CategoryID  uint64   `json:"category_id"`
		Tags        []string `json:"tags"`
		Level       uint8    `json:"level"`
		Duration    uint     `json:"duration"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)
	course := &models.Course{
		Title:       req.Title,
		Description: req.Description,
		CoverImage:  req.CoverImage,
		CategoryID:  req.CategoryID,
		Tags:        strings.Join(req.Tags, ","),
		Level:       req.Level,
		Duration:    req.Duration,
		TeacherID:   uint64(userID.(uint)),
		Status:      0,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := h.courseService.Create(course); err != nil {
		utils.Response(c, http.StatusInternalServerError, "创建失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "创建成功", course)
}

func (h *CourseHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	keyword := c.Query("keyword")
	categoryID := c.Query("category_id")
	level := c.Query("level")
	teacherID := c.Query("teacher_id")

	courses, total, err := h.courseService.List(page, size, keyword, categoryID, level, teacherID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", gin.H{
		"list":  courses,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

func (h *CourseHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	course, err := h.courseService.GetByID(id)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "课程不存在", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", course)
}

func (h *CourseHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)
	course, err := h.courseService.GetByID(id)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "课程不存在", nil)
		return
	}
	if course.TeacherID != uint64(userID.(uint)) {
		utils.Response(c, http.StatusForbidden, "无权修改", nil)
		return
	}

	var req struct {
		Title       string   `json:"title"`
		Description string   `json:"description"`
		CoverImage  string   `json:"cover_image"`
		CategoryID  uint64   `json:"category_id"`
		Tags        []string `json:"tags"`
		Level       uint8    `json:"level"`
		Duration    uint     `json:"duration"`
		Status      uint8    `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	if req.Title != "" {
		course.Title = req.Title
	}
	if req.Description != "" {
		course.Description = req.Description
	}
	if req.CoverImage != "" {
		course.CoverImage = req.CoverImage
	}
	if req.CategoryID != 0 {
		course.CategoryID = req.CategoryID
	}
	if req.Tags != nil {
		course.Tags = strings.Join(req.Tags, ",")
	}
	if req.Level != 0 {
		course.Level = req.Level
	}
	if req.Duration != 0 {
		course.Duration = req.Duration
	}
	if req.Status != 0 {
		course.Status = req.Status
	}
	course.UpdatedAt = time.Now()

	if err := h.courseService.Update(course); err != nil {
		utils.Response(c, http.StatusInternalServerError, "更新失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "更新成功", course)
}

func (h *CourseHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)
	course, err := h.courseService.GetByID(id)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "课程不存在", nil)
		return
	}
	if course.TeacherID != uint64(userID.(uint)) {
		utils.Response(c, http.StatusForbidden, "无权删除", nil)
		return
	}

	if err := h.courseService.Delete(id); err != nil {
		utils.Response(c, http.StatusInternalServerError, "删除失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "删除成功", nil)
}

func (h *CourseHandler) HotList(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	courses, err := h.courseService.HotCourses(limit)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}
	utils.Response(c, http.StatusOK, "获取成功", courses)
}
