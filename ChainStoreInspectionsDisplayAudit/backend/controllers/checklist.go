package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ChecklistController struct{}

func NewChecklistController() *ChecklistController {
	return &ChecklistController{}
}

func (ctrl *ChecklistController) GetTemplateList(c *gin.Context) {
	var templates []models.ChecklistTemplate
	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	templateType := c.Query("templateType")
	status := c.Query("status")

	query := database.DB.Model(&models.ChecklistTemplate{})

	if templateType != "" {
		query = query.Where("template_type = ?", templateType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&templates).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取模板列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":  templates,
		"total": total,
		"page":  page,
		"pageSize": pageSize,
	})
}

func (ctrl *ChecklistController) GetTemplateDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的模板ID")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.Preload("Items").First(&template, id).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	utils.SuccessResponse(c, template)
}

func (ctrl *ChecklistController) CreateTemplate(c *gin.Context) {
	var template models.ChecklistTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if template.TemplateName == "" {
		utils.BadRequestResponse(c, "模板名称不能为空")
		return
	}
	if template.TemplateType == "" {
		utils.BadRequestResponse(c, "模板类型不能为空")
		return
	}

	if err := database.DB.Create(&template).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建模板失败")
		return
	}

	utils.SuccessResponse(c, template)
}

func (ctrl *ChecklistController) UpdateTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的模板ID")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.First(&template, id).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	var updateData models.ChecklistTemplate
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	template.TemplateName = updateData.TemplateName
	template.TemplateType = updateData.TemplateType
	template.Description = updateData.Description
	template.TotalScore = updateData.TotalScore
	template.PassScore = updateData.PassScore
	template.Version = updateData.Version
	template.Status = updateData.Status

	if err := database.DB.Save(&template).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新模板失败")
		return
	}

	utils.SuccessResponse(c, template)
}

func (ctrl *ChecklistController) DeleteTemplate(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的模板ID")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.First(&template, id).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	if err := database.DB.Delete(&template).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除模板失败")
		return
	}

	utils.SuccessResponse(c, nil)
}

func (ctrl *ChecklistController) GetTemplateItems(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的模板ID")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.First(&template, id).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	var items []models.ChecklistItem
	if err := database.DB.Where("template_id = ?", id).Order("sort_order ASC, id ASC").Find(&items).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取检查项列表失败")
		return
	}

	utils.SuccessResponse(c, items)
}

func (ctrl *ChecklistController) CreateItem(c *gin.Context) {
	var item models.ChecklistItem
	if err := c.ShouldBindJSON(&item); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if item.TemplateID == 0 {
		utils.BadRequestResponse(c, "模板ID不能为空")
		return
	}
	if item.ItemName == "" {
		utils.BadRequestResponse(c, "检查项名称不能为空")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.First(&template, item.TemplateID).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	if err := database.DB.Create(&item).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建检查项失败")
		return
	}

	utils.SuccessResponse(c, item)
}

func (ctrl *ChecklistController) UpdateItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的检查项ID")
		return
	}

	var item models.ChecklistItem
	if err := database.DB.First(&item, id).Error; err != nil {
		utils.NotFoundResponse(c, "检查项不存在")
		return
	}

	var updateData models.ChecklistItem
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	item.ItemName = updateData.ItemName
	item.ItemCode = updateData.ItemCode
	item.ItemDescription = updateData.ItemDescription
	item.Category = updateData.Category
	item.Score = updateData.Score
	item.SortOrder = updateData.SortOrder
	item.IsRequired = updateData.IsRequired
	item.NeedPhoto = updateData.NeedPhoto
	item.ScoringCriteria = updateData.ScoringCriteria

	if err := database.DB.Save(&item).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新检查项失败")
		return
	}

	utils.SuccessResponse(c, item)
}

func (ctrl *ChecklistController) DeleteItem(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的检查项ID")
		return
	}

	var item models.ChecklistItem
	if err := database.DB.First(&item, id).Error; err != nil {
		utils.NotFoundResponse(c, "检查项不存在")
		return
	}

	if err := database.DB.Delete(&item).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除检查项失败")
		return
	}

	utils.SuccessResponse(c, nil)
}
