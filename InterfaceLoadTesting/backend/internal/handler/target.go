package handler

import (
	"load-testing/internal/model"
	"load-testing/internal/repository"
	"load-testing/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CreateTargetRequest struct {
	Name        string `json:"name" binding:"required,max=100"`
	BaseURL     string `json:"base_url" binding:"required,url,max=255"`
	Description string `json:"description"`
	AllowedIPs  string `json:"allowed_ips"`
	AuthToken   string `json:"auth_token"`
}

type UpdateTargetRequest struct {
	Name        string `json:"name" binding:"max=100"`
	BaseURL     string `json:"base_url" binding:"omitempty,url,max=255"`
	Description string `json:"description"`
	AllowedIPs  string `json:"allowed_ips"`
	AuthToken   string `json:"auth_token"`
	Status      *int8  `json:"status"`
}

func CreateTarget(c *gin.Context) {
	userID := c.GetUint64("userID")

	var req CreateTargetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters: "+err.Error())
		return
	}

	target := &model.Target{
		Name:        req.Name,
		BaseURL:     req.BaseURL,
		Description: req.Description,
		AllowedIPs:  req.AllowedIPs,
		AuthToken:   req.AuthToken,
		Status:      1,
		CreatedBy:   userID,
	}

	if err := repository.DB.Create(target).Error; err != nil {
		utils.InternalError(c, "Failed to create target")
		return
	}

	utils.Success(c, target)
}

func GetTargetList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	offset := (page - 1) * pageSize

	query := repository.DB.Model(&model.Target{})
	if keyword != "" {
		query = query.Where("name LIKE ? OR base_url LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var targets []model.Target
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&targets)

	utils.Success(c, gin.H{
		"list":  targets,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func GetTarget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid target ID")
		return
	}

	var target model.Target
	if err := repository.DB.First(&target, id).Error; err != nil {
		utils.NotFound(c, "Target not found")
		return
	}

	utils.Success(c, target)
}

func UpdateTarget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid target ID")
		return
	}

	var target model.Target
	if err := repository.DB.First(&target, id).Error; err != nil {
		utils.NotFound(c, "Target not found")
		return
	}

	var req UpdateTargetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "Invalid request parameters: "+err.Error())
		return
	}

	if req.Name != "" {
		target.Name = req.Name
	}
	if req.BaseURL != "" {
		target.BaseURL = req.BaseURL
	}
	if req.Description != "" {
		target.Description = req.Description
	}
	if req.AllowedIPs != "" {
		target.AllowedIPs = req.AllowedIPs
	}
	if req.AuthToken != "" {
		target.AuthToken = req.AuthToken
	}
	if req.Status != nil {
		target.Status = *req.Status
	}

	if err := repository.DB.Save(&target).Error; err != nil {
		utils.InternalError(c, "Failed to update target")
		return
	}

	utils.Success(c, target)
}

func DeleteTarget(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequest(c, "Invalid target ID")
		return
	}

	var count int64
	repository.DB.Model(&model.Task{}).Where("target_id = ?", id).Count(&count)
	if count > 0 {
		utils.BadRequest(c, "Cannot delete target with existing tasks")
		return
	}

	if err := repository.DB.Delete(&model.Target{}, id).Error; err != nil {
		utils.InternalError(c, "Failed to delete target")
		return
	}

	utils.Success(c, nil)
}
