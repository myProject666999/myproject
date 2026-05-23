package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewService *services.ReviewService
}

func NewReviewHandler(reviewService *services.ReviewService) *ReviewHandler {
	return &ReviewHandler{reviewService: reviewService}
}

func (h *ReviewHandler) Create(c *gin.Context) {
	var req struct {
		CourseID uint64 `json:"course_id" binding:"required"`
		Rating   uint8  `json:"rating" binding:"required,min=1,max=5"`
		Content  string `json:"content" binding:"required,max=1000"`
		ParentID uint64 `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	review, err := h.reviewService.Create(uint64(userID.(uint)), req.CourseID, req.Rating, req.Content, req.ParentID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "评论失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "评论成功", review)
}

func (h *ReviewHandler) ListByCourse(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

	list, total, err := h.reviewService.ListByCourse(courseID, page, size)
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

func (h *ReviewHandler) GetStats(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	stats, err := h.reviewService.GetStats(courseID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", stats)
}

func (h *ReviewHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	var req struct {
		Rating  uint8  `json:"rating" binding:"required,min=1,max=5"`
		Content string `json:"content" binding:"required,max=1000"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	if err := h.reviewService.Update(id, uint64(userID.(uint)), req.Rating, req.Content); err != nil {
		utils.Response(c, http.StatusInternalServerError, "更新失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "更新成功", gin.H{
		"id":      id,
		"rating":  req.Rating,
		"content": req.Content,
	})
}

func (h *ReviewHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	if err := h.reviewService.Delete(id, uint64(userID.(uint))); err != nil {
		utils.Response(c, http.StatusInternalServerError, "删除失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "删除成功", nil)
}
