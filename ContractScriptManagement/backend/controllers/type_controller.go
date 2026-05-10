package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetScriptTypes(c *gin.Context) {
	var types []models.ScriptType
	config.DB.Order("id ASC").Find(&types)
	utils.Success(c, types)
}

func GetScriptTypesPaginated(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var types []models.ScriptType
	var total int64

	config.DB.Model(&models.ScriptType{}).Count(&total)
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&types)

	utils.Success(c, gin.H{
		"list":      types,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateScriptType(c *gin.Context) {
	var req struct {
		Name string `json:"name" binding:"required"`
		Desc string `json:"desc"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var existingType models.ScriptType
	if err := config.DB.Where("name = ?", req.Name).First(&existingType).Error; err == nil {
		utils.BadRequest(c, "类型名称已存在")
		return
	}

	scriptType := models.ScriptType{
		Name: req.Name,
		Desc: req.Desc,
	}

	if err := config.DB.Create(&scriptType).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, scriptType)
}

func GetScriptType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var scriptType models.ScriptType
	if err := config.DB.First(&scriptType, id).Error; err != nil {
		utils.NotFound(c, "类型不存在")
		return
	}

	utils.Success(c, scriptType)
}

func UpdateScriptType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var scriptType models.ScriptType
	if err := config.DB.First(&scriptType, id).Error; err != nil {
		utils.NotFound(c, "类型不存在")
		return
	}

	var req struct {
		Name string `json:"name"`
		Desc string `json:"desc"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Name != "" {
		scriptType.Name = req.Name
	}
	scriptType.Desc = req.Desc

	if err := config.DB.Save(&scriptType).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, scriptType)
}

func DeleteScriptType(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.ScriptType{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
