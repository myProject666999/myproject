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

var columnService = &service.ColumnService{}

type ColumnHandler struct{}

func (h *ColumnHandler) CreateColumn(c *gin.Context) {
	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		CoverImage  string  `json:"cover_image"`
		Price       float64 `json:"price"`
		IsFree      int8    `json:"is_free"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	userID := middleware.GetUserID(c)
	db := getDB(c)
	column := &model.Column{
		Title:       req.Title,
		Description: req.Description,
		CoverImage:  req.CoverImage,
		AuthorID:    userID,
		Price:       req.Price,
		IsFree:      req.IsFree,
	}
	if err := columnService.CreateColumn(db, column); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, column)
}

func (h *ColumnHandler) GetColumns(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	if page < 1 {
		page = 1
	}
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if pageSize < 1 {
		pageSize = 10
	}
	if pageSize > 100 {
		pageSize = 100
	}
	db := getDB(c)
	columns, total, err := columnService.GetColumns(db, page, pageSize)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, gin.H{
		"list":  columns,
		"total": total,
	})
}

func (h *ColumnHandler) GetColumnByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	column, err := columnService.GetColumnByID(db, id)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "column not found")
		return
	}
	response.Success(c, column)
}

func (h *ColumnHandler) UpdateColumn(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	column, err := columnService.GetColumnByID(db, id)
	if err != nil {
		response.Fail(c, http.StatusNotFound, "column not found")
		return
	}
	var req struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		CoverImage  string  `json:"cover_image"`
		Price       float64 `json:"price"`
		IsFree      int8    `json:"is_free"`
		Status      int8    `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid request parameters")
		return
	}
	column.Title = req.Title
	column.Description = req.Description
	column.CoverImage = req.CoverImage
	column.Price = req.Price
	column.IsFree = req.IsFree
	column.Status = req.Status
	if err := columnService.UpdateColumn(db, column); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, column)
}

func (h *ColumnHandler) DeleteColumn(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		response.Fail(c, http.StatusBadRequest, "invalid id")
		return
	}
	db := getDB(c)
	if err := columnService.DeleteColumn(db, id); err != nil {
		response.Fail(c, http.StatusBadRequest, err.Error())
		return
	}
	response.Success(c, nil)
}

func (h *ColumnHandler) GetMyColumns(c *gin.Context) {
	userID := middleware.GetUserID(c)
	db := getDB(c)
	columns, err := columnService.GetColumnsByAuthor(db, userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}
	response.Success(c, columns)
}