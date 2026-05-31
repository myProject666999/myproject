package api

import (
	"strconv"

	"emergency-material/internal/middleware"
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type MaterialController struct {
	materialService *service.MaterialService
}

func NewMaterialController() *MaterialController {
	return &MaterialController{
		materialService: service.NewMaterialService(),
	}
}

func (ctrl *MaterialController) GetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := &service.MaterialQuery{
		Page:           page,
		PageSize:       pageSize,
		Code:           c.Query("code"),
		Name:           c.Query("name"),
		EmergencyLevel: c.Query("emergency_level"),
	}

	if categoryIDStr := c.Query("category_id"); categoryIDStr != "" {
		if categoryID, err := strconv.ParseUint(categoryIDStr, 10, 64); err == nil {
			query.CategoryID = &categoryID
		}
	}

	if statusStr := c.Query("status"); statusStr != "" {
		if status, err := strconv.ParseInt(statusStr, 10, 8); err == nil {
			s := int8(status)
			query.Status = &s
		}
	}

	result, err := ctrl.materialService.GetMaterialList(c.Request.Context(), query)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *MaterialController) GetDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	material, err := ctrl.materialService.GetMaterialDetail(c.Request.Context(), id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, material)
}

func (ctrl *MaterialController) Create(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	material, err := ctrl.materialService.CreateMaterial(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, material)
}

func (ctrl *MaterialController) Update(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.UpdateMaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ID = id
	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	material, err := ctrl.materialService.UpdateMaterial(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, material)
}

func (ctrl *MaterialController) Delete(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	err = ctrl.materialService.DeleteMaterial(c.Request.Context(), id, userID.(uint64), username.(string))
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *MaterialController) GetCategoryList(c *gin.Context) {
	result, err := ctrl.materialService.GetCategoryList(c.Request.Context())
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}

func (ctrl *MaterialController) CreateCategory(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	var req service.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	category, err := ctrl.materialService.CreateCategory(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, category)
}

func (ctrl *MaterialController) UpdateCategory(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	var req service.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, "参数错误: "+err.Error())
		return
	}

	req.ID = id
	req.OperatorID = userID.(uint64)
	req.OperatorName = username.(string)

	category, err := ctrl.materialService.UpdateCategory(c.Request.Context(), &req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, category)
}

func (ctrl *MaterialController) DeleteCategory(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)
	username, _ := c.Get(middleware.UsernameKey)

	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		response.Error(c, "无效的ID")
		return
	}

	err = ctrl.materialService.DeleteCategory(c.Request.Context(), id, userID.(uint64), username.(string))
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *MaterialController) GetDashboardData(c *gin.Context) {
	result, err := ctrl.materialService.GetDashboardData(c.Request.Context())
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, result)
}
