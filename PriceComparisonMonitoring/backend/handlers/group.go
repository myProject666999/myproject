package handlers

import (
	"net/http"
	"price-monitor/database"
	"price-monitor/middleware"
	"price-monitor/models"
	"price-monitor/utils"

	"github.com/gin-gonic/gin"
)

type GroupHandler struct{}

type CreateGroupRequest struct {
	Name        string `json:"name" binding:"required,max=50"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Sort        int    `json:"sort"`
}

type UpdateGroupRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Sort        *int   `json:"sort"`
}

func (h *GroupHandler) CreateGroup(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	group := models.ProductGroup{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		Sort:        req.Sort,
	}

	if err := database.DB.Create(&group).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "创建分组失败")
		return
	}

	utils.SendSuccess(c, group)
}

func (h *GroupHandler) GetGroups(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var groups []models.ProductGroup
	database.DB.Where("user_id = ?", userID).Order("sort ASC, id ASC").Find(&groups)

	type GroupWithCount struct {
		models.ProductGroup
		ProductCount int64 `json:"product_count"`
	}

	result := make([]GroupWithCount, 0)
	for _, group := range groups {
		var count int64
		database.DB.Model(&models.Product{}).Where("group_id = ? AND user_id = ?", group.ID, userID).Count(&count)
		result = append(result, GroupWithCount{
			ProductGroup: group,
			ProductCount: count,
		})
	}

	utils.SendSuccess(c, result)
}

func (h *GroupHandler) GetGroup(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var group models.ProductGroup
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&group).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "分组不存在")
		return
	}

	utils.SendSuccess(c, group)
}

func (h *GroupHandler) UpdateGroup(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var group models.ProductGroup
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&group).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "分组不存在")
		return
	}

	var req UpdateGroupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	if req.Sort != nil {
		updates["sort"] = *req.Sort
	}

	if err := database.DB.Model(&group).Updates(updates).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "更新成功"})
}

func (h *GroupHandler) DeleteGroup(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var group models.ProductGroup
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&group).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "分组不存在")
		return
	}

	database.DB.Model(&models.Product{}).Where("group_id = ? AND user_id = ?", id, userID).Update("group_id", nil)
	database.DB.Delete(&group)

	utils.SendSuccess(c, gin.H{"message": "删除成功"})
}
