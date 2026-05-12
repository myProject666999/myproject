package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"samecity-express/internal/service"
	"samecity-express/pkg/utils"
)

type ExceptionHandler struct {
	service *service.ExceptionService
}

func NewExceptionHandler() *ExceptionHandler {
	return &ExceptionHandler{
		service: service.NewExceptionService(),
	}
}

type CreateExceptionRequest struct {
	OrderID     uint   `json:"order_id" binding:"required"`
	Type        int    `json:"type" binding:"required"`
	Description string `json:"description" binding:"required"`
	Photos      string `json:"photos"`
}

func (h *ExceptionHandler) CreateException(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req CreateExceptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	exception, err := h.service.CreateException(userID, req.OrderID, req.Type, req.Description, req.Photos)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, exception)
}

func (h *ExceptionHandler) GetUserExceptions(c *gin.Context) {
	userID := c.GetUint("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var status *int
	if statusStr := c.Query("status"); statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = &s
		}
	}

	exceptions, total, err := h.service.GetExceptions(&userID, nil, status, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"exceptions": exceptions,
		"total":      total,
		"page":       page,
		"size":       pageSize,
	})
}

func (h *ExceptionHandler) GetRiderExceptions(c *gin.Context) {
	riderID := c.GetUint("rider_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var status *int
	if statusStr := c.Query("status"); statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = &s
		}
	}

	exceptions, total, err := h.service.GetExceptions(nil, &riderID, status, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"exceptions": exceptions,
		"total":      total,
		"page":       page,
		"size":       pageSize,
	})
}

func (h *ExceptionHandler) GetAllExceptions(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var status *int
	if statusStr := c.Query("status"); statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil {
			status = &s
		}
	}

	exceptions, total, err := h.service.GetExceptions(nil, nil, status, page, pageSize)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, gin.H{
		"exceptions": exceptions,
		"total":      total,
		"page":       page,
		"size":       pageSize,
	})
}

func (h *ExceptionHandler) GetException(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "异常工单ID无效")
		return
	}

	exception, err := h.service.GetExceptionByID(uint(id))
	if err != nil {
		utils.NotFound(c, "异常工单不存在")
		return
	}

	utils.Success(c, exception)
}

type HandleExceptionRequest struct {
	HandleResult  string  `json:"handle_result" binding:"required"`
	Compensation  float64 `json:"compensation"`
	Status        int     `json:"status" binding:"required"`
}

func (h *ExceptionHandler) HandleException(c *gin.Context) {
	adminID := c.GetUint("admin_id")

	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "异常工单ID无效")
		return
	}

	var req HandleExceptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	exception, err := h.service.HandleException(adminID, uint(id), req.HandleResult, req.Compensation, req.Status)
	if err != nil {
		utils.BadRequest(c, err.Error())
		return
	}

	utils.Success(c, exception)
}
