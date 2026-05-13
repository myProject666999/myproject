package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"

	"samecity-express/config"
	"samecity-express/internal/model"
	"samecity-express/pkg/utils"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

type AdminLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *AdminHandler) Login(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var admin model.Admin
	if err := config.DB.Where("username = ?", req.Username).First(&admin).Error; err != nil {
		utils.BadRequest(c, "管理员不存在")
		return
	}

	if admin.Status != 1 {
		utils.BadRequest(c, "账号已被禁用")
		return
	}

	if !utils.CheckPasswordHash(req.Password, admin.Password) {
		utils.BadRequest(c, "密码错误")
		return
	}

	token, err := utils.GenerateToken(0, 0, admin.ID, admin.Username, "admin")
	if err != nil {
		utils.InternalServerError(c, "生成Token失败")
		return
	}

	utils.Success(c, gin.H{
		"admin": admin,
		"token": token,
	})
}

func (h *AdminHandler) GetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var orders []*model.Order
	var total int64

	query := config.DB.Model(&model.Order{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Preload("User").Preload("Rider").
		Order("created_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&orders)

	utils.Success(c, gin.H{
		"orders": orders,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (h *AdminHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var users []*model.User
	var total int64

	query := config.DB.Model(&model.User{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order("created_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&users)

	utils.Success(c, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"size":  pageSize,
	})
}

func (h *AdminHandler) GetRiders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var riders []*model.Rider
	var total int64

	query := config.DB.Model(&model.Rider{})
	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order("created_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&riders)

	utils.Success(c, gin.H{
		"riders": riders,
		"total":  total,
		"page":   page,
		"size":   pageSize,
	})
}

func (h *AdminHandler) UpdateRiderStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "骑手ID无效")
		return
	}

	var req struct {
		Status int `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var rider model.Rider
	if err := config.DB.First(&rider, id).Error; err != nil {
		utils.NotFound(c, "骑手不存在")
		return
	}

	if err := config.DB.Model(&rider).Update("status", req.Status).Error; err != nil {
		utils.BadRequest(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", nil)
}

func (h *AdminHandler) GetPricingRules(c *gin.Context) {
	var rules []*model.PricingRule
	if err := config.DB.Order("priority DESC").Find(&rules).Error; err != nil {
		utils.BadRequest(c, "获取失败")
		return
	}

	utils.Success(c, rules)
}

func (h *AdminHandler) UpdatePricingRule(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		utils.BadRequest(c, "规则ID无效")
		return
	}

	var rule model.PricingRule
	if err := config.DB.First(&rule, id).Error; err != nil {
		utils.NotFound(c, "规则不存在")
		return
	}

	var data map[string]interface{}
	if err := c.ShouldBindJSON(&data); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := config.DB.Model(&rule).Updates(data).Error; err != nil {
		utils.BadRequest(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", rule)
}
