package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"script-management/config"
	"script-management/models"
	"script-management/utils"
)

func GetRooms(c *gin.Context) {
	var rooms []models.Room
	config.DB.Where("status = 1").Order("id ASC").Find(&rooms)
	utils.Success(c, rooms)
}

func GetAllRooms(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var rooms []models.Room
	var total int64

	config.DB.Model(&models.Room{}).Count(&total)
	offset := (page - 1) * pageSize
	config.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&rooms)

	utils.Success(c, gin.H{
		"list":      rooms,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func CreateRoom(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Capacity int    `json:"capacity"`
		Desc     string `json:"desc"`
		Status   int    `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	room := models.Room{
		Name:     req.Name,
		Capacity: req.Capacity,
		Desc:     req.Desc,
		Status:   req.Status,
	}

	if err := config.DB.Create(&room).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, room)
}

func GetRoom(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var room models.Room
	if err := config.DB.First(&room, id).Error; err != nil {
		utils.NotFound(c, "房间不存在")
		return
	}

	utils.Success(c, room)
}

func UpdateRoom(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	var room models.Room
	if err := config.DB.First(&room, id).Error; err != nil {
		utils.NotFound(c, "房间不存在")
		return
	}

	var req map[string]interface{}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if v, exists := req["name"]; exists && v != nil {
		room.Name = v.(string)
	}
	if v, exists := req["capacity"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			room.Capacity = int(val)
		case int:
			room.Capacity = val
		}
	}
	if v, exists := req["desc"]; exists && v != nil {
		room.Desc = v.(string)
	}
	if v, exists := req["status"]; exists && v != nil {
		switch val := v.(type) {
		case float64:
			room.Status = int(val)
		case int:
			room.Status = val
		case bool:
			if val {
				room.Status = 1
			} else {
				room.Status = 0
			}
		}
	}

	if err := config.DB.Save(&room).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	utils.Success(c, room)
}

func DeleteRoom(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.BadRequest(c, "无效的ID")
		return
	}

	if err := config.DB.Delete(&models.Room{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.Success(c, nil)
}
