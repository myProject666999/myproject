package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type TeacherHandler struct {
	courseService   *services.CourseService
	progressService *services.ProgressService
	reviewService   *services.ReviewService
}

func NewTeacherHandler(courseService *services.CourseService, progressService *services.ProgressService, reviewService *services.ReviewService) *TeacherHandler {
	return &TeacherHandler{
		courseService:   courseService,
		progressService: progressService,
		reviewService:   reviewService,
	}
}

func (h *TeacherHandler) MyCourses(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	status := c.Query("status")

	courses, total, err := h.courseService.ListByTeacher(uint64(userID.(uint)), page, size, status)
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

func (h *TeacherHandler) Publish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	if err := h.courseService.Publish(id, uint64(userID.(uint))); err != nil {
		utils.Response(c, http.StatusInternalServerError, "发布失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "发布成功", nil)
}

func (h *TeacherHandler) Offline(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	if err := h.courseService.Offline(id, uint64(userID.(uint))); err != nil {
		utils.Response(c, http.StatusInternalServerError, "下架失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "下架成功", nil)
}

func (h *TeacherHandler) CourseStats(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	stats, err := h.progressService.GetCourseStats(id, uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", stats)
}

func (h *TeacherHandler) CourseReviews(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

	list, total, err := h.reviewService.ListByCourseForTeacher(id, uint64(userID.(uint)), page, size)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", gin.H{
		"list":  list,
		"total": total,
		"page":  page,
		"size":  size,
	})
}

func (h *TeacherHandler) DeleteReview(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	if err := h.reviewService.TeacherDelete(id, uint64(userID.(uint))); err != nil {
		utils.Response(c, http.StatusInternalServerError, "删除失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "删除成功", nil)
}
