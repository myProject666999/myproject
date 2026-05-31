package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"online-knowledge-paid/config"
	"online-knowledge-paid/middleware"
	"online-knowledge-paid/model"
	"online-knowledge-paid/pkg/jwt"
	"online-knowledge-paid/pkg/response"
	"online-knowledge-paid/service"
)

var articleService = &service.ArticleService{}
var subscriptionService = &service.SubscriptionService{}
var jwtSecret string

func init() {
	cfg := config.Load()
	jwtSecret = cfg.JWT.Secret
}

type ArticleHandler struct{}

func (h *ArticleHandler) CreateArticle(c *gin.Context) {
	var req struct {
		ColumnID     uint64 `json:"column_id"`
		Title        string `json:"title"`
		Summary      string `json:"summary"`
		Content      string `json:"content"`
		TrialContent string `json:"trial_content"`
		IsFree       int8   `json:"is_free"`
		SortOrder    int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	article := &model.Article{
		ColumnID:     req.ColumnID,
		Title:        req.Title,
		Summary:      req.Summary,
		Content:      req.Content,
		TrialContent: req.TrialContent,
		IsFree:       req.IsFree,
		AuthorID:     userID,
		SortOrder:    req.SortOrder,
	}
	if err := articleService.CreateArticle(db, article); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, article)
}

func (h *ArticleHandler) GetArticlesByColumn(c *gin.Context) {
	columnIDStr := c.Query("column_id")
	columnID, err := strconv.ParseUint(columnIDStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid column_id")
		return
	}
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	db := getDB(c)
	articles, total, err := articleService.GetArticlesByColumn(db, columnID, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  articles,
		"total": total,
	})
}

func (h *ArticleHandler) GetArticleByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	article, err := articleService.GetArticleByID(db, id)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "article not found")
		return
	}

	if article.IsFree == 1 {
		response.Success(c, article)
		return
	}

	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	if userID == 0 {
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				claims, err := jwt.ParseToken(parts[1], jwtSecret)
				if err == nil {
					userID = claims.UserID
					role = claims.Role
				}
			}
		}
	}

	if role == 2 || userID == article.AuthorID {
		response.Success(c, article)
		return
	}

	if userID > 0 {
		subscribed, _ := subscriptionService.CheckSubscription(db, userID, article.ColumnID)
		if subscribed {
			response.Success(c, article)
			return
		}
	}

	article.Content = ""
	response.Success(c, article)
}

func (h *ArticleHandler) UpdateArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	article, err := articleService.GetArticleByID(db, id)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "article not found")
		return
	}
	var req struct {
		Title        string `json:"title"`
		Summary      string `json:"summary"`
		Content      string `json:"content"`
		TrialContent string `json:"trial_content"`
		IsFree       int8   `json:"is_free"`
		SortOrder    int    `json:"sort_order"`
		Status       int8   `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	article.Title = req.Title
	article.Summary = req.Summary
	article.Content = req.Content
	article.TrialContent = req.TrialContent
	article.IsFree = req.IsFree
	article.SortOrder = req.SortOrder
	article.Status = req.Status
	if err := articleService.UpdateArticle(db, article); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, article)
}

func (h *ArticleHandler) DeleteArticle(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	if err := articleService.DeleteArticle(db, id); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ArticleHandler) GetMyArticles(c *gin.Context) {
	userID := middleware.GetUserID(c)
	db := getDB(c)
	articles, err := articleService.GetArticlesByAuthor(db, userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, articles)
}