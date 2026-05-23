package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type ProgressHandler struct {
	progressService *services.ProgressService
}

func NewProgressHandler(progressService *services.ProgressService) *ProgressHandler {
	return &ProgressHandler{progressService: progressService}
}

func (h *ProgressHandler) Report(c *gin.Context) {
	var req struct {
		CourseID   uint64 `json:"course_id" binding:"required"`
		LessonID   uint64 `json:"lesson_id" binding:"required"`
		Position   uint   `json:"position"`
		TotalWatchTime uint `json:"total_watch_time"`
		Completed  bool   `json:"completed"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	progress, err := h.progressService.Report(uint64(userID.(uint)), req.CourseID, req.LessonID, req.Position, req.TotalWatchTime, req.Completed)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "上报失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "上报成功", progress)
}

func (h *ProgressHandler) GetCourseProgress(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	progress, err := h.progressService.GetCourseProgress(uint64(userID.(uint)), courseID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", progress)
}

func (h *ProgressHandler) GetMyCourses(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

	list, total, err := h.progressService.GetMyCourses(uint64(userID.(uint)), page, size)
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

func (h *ProgressHandler) GetLessonProgress(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}
	lessonID, err := strconv.ParseUint(c.Param("lesson_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	progress, err := h.progressService.GetLessonProgress(uint64(userID.(uint)), courseID, lessonID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", progress)
}
