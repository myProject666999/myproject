package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/middleware"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var likeService = &service.LikeService{}

type LikeHandler struct{}

func (h *LikeHandler) ToggleLike(c *gin.Context) {
	var req struct {
		ArticleID uint64 `json:"article_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	liked, err := likeService.ToggleLike(db, userID, req.ArticleID)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	likeCount, _ := likeService.GetLikeCount(db, req.ArticleID)
	response.Success(c, gin.H{
		"liked":      liked,
		"like_count": likeCount,
	})
}

func (h *LikeHandler) CheckLike(c *gin.Context) {
	articleIDStr := c.Query("article_id")
	articleID, err := strconv.ParseUint(articleIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid article_id")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	liked, err := likeService.CheckLike(db, userID, articleID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"liked": liked,
	})
}