package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/middleware"
	"online-knowledge-paid/model"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var commentService = &service.CommentService{}

type CommentHandler struct{}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	var req struct {
		ArticleID uint64  `json:"article_id"`
		Content   string  `json:"content"`
		ParentID  *uint64 `json:"parent_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	comment := &model.Comment{
		ArticleID: req.ArticleID,
		UserID:    userID,
		Content:   req.Content,
		ParentID:  req.ParentID,
	}
	if err := commentService.CreateComment(db, comment); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, comment)
}

func (h *CommentHandler) GetCommentsByArticle(c *gin.Context) {
	articleIDStr := c.Query("article_id")
	articleID, err := strconv.ParseUint(articleIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid article_id")
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	db := getDB(c)
	comments, total, err := commentService.GetCommentsByArticle(db, articleID, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  comments,
		"total": total,
	})
}

func (h *CommentHandler) DeleteComment(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	if err := commentService.DeleteComment(db, id); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, nil)
}