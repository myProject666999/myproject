package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetTaskTypeList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var taskTypes []models.TaskType
	var total int64

	database.DB.Model(&models.TaskType{}).Count(&total)
	offset := (page - 1) * pageSize
	database.DB.Offset(offset).Limit(pageSize).Order("sort_order ASC, id DESC").Find(&taskTypes)

	utils.Success(c, gin.H{
		"list":      taskTypes,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetAllTaskTypes(c *gin.Context) {
	var taskTypes []models.TaskType
	database.DB.Where("status = 1").Order("sort_order ASC").Find(&taskTypes)
	utils.Success(c, taskTypes)
}

func GetTaskTypeDetail(c *gin.Context) {
	id := c.Param("id")
	var taskType models.TaskType
	if err := database.DB.First(&taskType, id).Error; err != nil {
		utils.NotFound(c, "任务类型不存在")
		return
	}
	utils.Success(c, taskType)
}

type CreateTaskTypeRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	SortOrder   int    `json:"sort_order"`
	Status      int    `json:"status"`
}

func CreateTaskType(c *gin.Context) {
	var req CreateTaskTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	taskType := models.TaskType{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		SortOrder:   req.SortOrder,
		Status:      req.Status,
	}

	if err := database.DB.Create(&taskType).Error; err != nil {
		utils.InternalServerError(c, "创建任务类型失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", taskType)
}

func UpdateTaskType(c *gin.Context) {
	id := c.Param("id")
	var req CreateTaskTypeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var taskType models.TaskType
	if err := database.DB.First(&taskType, id).Error; err != nil {
		utils.NotFound(c, "任务类型不存在")
		return
	}

	if err := database.DB.Model(&taskType).Updates(models.TaskType{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		SortOrder:   req.SortOrder,
		Status:      req.Status,
	}).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", taskType)
}

func DeleteTaskType(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.TaskType{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
