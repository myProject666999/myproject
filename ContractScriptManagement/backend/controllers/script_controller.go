package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetScripts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	typeID := c.Query("type_id")
	keyword := c.Query("keyword")

	var scripts []models.Script
	var total int64

	query := config.DB.Model(&models.Script{}).Preload("Type").Where("status = 1")
	if typeID != "" {
		query = query.Where("type_id = ?", typeID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("hot DESC, id DESC").Find(&scripts)

	utils.Success(c, gin.H{
		"list":      scripts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllScripts(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	typeID := c.Query("type_id")
	keyword := c.Query("keyword")

	var scripts []models.Script
	var total int64

	query := config.DB.Model(&models.Script{}).Preload("Type")
	if typeID != "" {
		query = query.Where("type_id = ?", typeID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&scripts)

	utils.Success(c, gin.H{
		"list":      scripts,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var script models.Script
	if err := config.DB.Preload("Type").First(&script, id).Error; err != nil {
		utils.NotFound(c, "剧本不存在")
		return
	}

	config.DB.Model(&script).UpdateColumn("hot", script.Hot+1)

	utils.Success(c, script)
}

func CreateScript(c *gin.Context) {
	var req struct {
		Title       string  `json:"title" binding:"required"`
		TypeID      uint    `json:"type_id" binding:"required"`
		Price       float64 `json:"price"`
		Description string  `json:"description"`
		Players     int     `json:"players"`
		Duration    int     `json:"duration"`
		Cover       string  `json:"cover"`
		Images      string  `json:"images"`
		Status      int     `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	script := models.Script{
		Title:       req.Title,
		TypeID:      req.TypeID,
		Price:       req.Price,
		Description: req.Description,
		Players:     req.Players,
		Duration:    req.Duration,
		Cover:       req.Cover,
		Images:      req.Images,
		Status:      req.Status,
	}

	if err := config.DB.Create(&script).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, script)
}

func UpdateScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var script models.Script
	if err := config.DB.First(&script, id).Error; err != nil {
		utils.NotFound(c, "剧本不存在")
		return
	}

	var req map[string]interface{}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if v, exists := req["title"]; exists && v != nil {
		script.Title = v.(string)
	}
	if v, exists := req["type_id"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			script.TypeID = uint(val)
		case int:
			script.TypeID = uint(val)
		}
	}
	if v, exists := req["price"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			script.Price = val
		case int:
			script.Price = float64(val)
		}
	}
	if v, exists := req["description"]; exists && v != nil {
		script.Description = v.(string)
	}
	if v, exists := req["players"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			script.Players = int(val)
		case int:
			script.Players = val
		}
	}
	if v, exists := req["duration"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			script.Duration = int(val)
		case int:
			script.Duration = val
		}
	}
	if v, exists := req["cover"]; exists && v != nil {
		script.Cover = v.(string)
	}
	if v, exists := req["images"]; exists && v != nil {
		script.Images = v.(string)
	}
	if v, exists := req["status"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			script.Status = int(val)
		case int:
			script.Status = val
		case bool:
			if val {
				script.Status = 1
			} else {
				script.Status = 0
			}
		}
	}

	if err := config.DB.Save(&script).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, script)
}

func DeleteScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.Script{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func GetHotScripts(c *gin.Context) {
	var scripts []models.Script
	config.DB.Preload("Type").Where("status = 1").Order("hot DESC").Limit(8).Find(&scripts)
	utils.Success(c, scripts)
}
