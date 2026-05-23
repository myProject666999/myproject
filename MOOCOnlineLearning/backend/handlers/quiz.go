package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type QuizHandler struct {
	quizService *services.QuizService
}

func NewQuizHandler(quizService *services.QuizService) *QuizHandler {
	return &QuizHandler{quizService: quizService}
}

func (h *QuizHandler) GetQuestions(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	questions, err := h.quizService.GetQuestions(courseID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", questions)
}

func (h *QuizHandler) Submit(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	var req struct {
		Answers []services.AnswerItem `json:"answers" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	result, err := h.quizService.Submit(uint64(userID.(uint)), courseID, req.Answers)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "提交失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "提交成功", result)
}

func (h *QuizHandler) GetScore(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	score, err := h.quizService.GetScore(uint64(userID.(uint)), courseID)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "成绩不存在", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", score)
}

func (h *QuizHandler) GetMyScores(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	scores, err := h.quizService.GetMyScores(uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", scores)
}
