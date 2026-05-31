package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type RecordController struct{}

func NewRecordController() *RecordController {
	return &RecordController{}
}

func (ctrl *RecordController) GetRecordList(c *gin.Context) {
	var records []models.InspectionRecord
	var total int64

	taskID := c.Query("taskId")
	if taskID == "" {
		utils.BadRequestResponse(c, "任务ID不能为空")
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	query := database.DB.Model(&models.InspectionRecord{}).
		Where("task_id = ?", taskID).
		Preload("Photos").
		Preload("Item")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&records).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取巡检记录列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":     records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (ctrl *RecordController) GetRecordDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的记录ID")
		return
	}

	var record models.InspectionRecord
	if err := database.DB.Preload("Photos").Preload("Item").First(&record, id).Error; err != nil {
		utils.NotFoundResponse(c, "记录不存在")
		return
	}

	utils.SuccessResponse(c, record)
}

func (ctrl *RecordController) CreateRecord(c *gin.Context) {
	var record models.InspectionRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if record.TaskID == 0 {
		utils.BadRequestResponse(c, "任务ID不能为空")
		return
	}
	if record.ItemID == 0 {
		utils.BadRequestResponse(c, "检查项ID不能为空")
		return
	}
	if record.InspectorID == 0 {
		utils.BadRequestResponse(c, "巡检员ID不能为空")
		return
	}

	var task models.InspectionTask
	if err := database.DB.First(&task, record.TaskID).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	var item models.ChecklistItem
	if err := database.DB.First(&item, record.ItemID).Error; err != nil {
		utils.NotFoundResponse(c, "检查项不存在")
		return
	}

	var inspector models.User
	if err := database.DB.First(&inspector, record.InspectorID).Error; err != nil {
		utils.NotFoundResponse(c, "巡检员不存在")
		return
	}

	record.CheckTime = time.Now()

	if record.HasPhoto != 1 {
		record.HasPhoto = 0
	}

	if err := database.DB.Create(&record).Error; err != nil {
		utils.InternalServerErrorResponse(c, "提交巡检记录失败")
		return
	}

	utils.SuccessResponse(c, record)
}

func (ctrl *RecordController) UpdateRecord(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的记录ID")
		return
	}

	var record models.InspectionRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		utils.NotFoundResponse(c, "记录不存在")
		return
	}

	var updateData models.InspectionRecord
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	record.Score = updateData.Score
	record.IsPass = updateData.IsPass
	record.CheckResult = updateData.CheckResult
	record.Longitude = updateData.Longitude
	record.Latitude = updateData.Latitude
	record.LocationAddress = updateData.LocationAddress
	record.HasPhoto = updateData.HasPhoto

	if err := database.DB.Save(&record).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新巡检记录失败")
		return
	}

	utils.SuccessResponse(c, record)
}

func (ctrl *RecordController) DeleteRecord(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的记录ID")
		return
	}

	var record models.InspectionRecord
	if err := database.DB.First(&record, id).Error; err != nil {
		utils.NotFoundResponse(c, "记录不存在")
		return
	}

	var photos []models.Photo
	database.DB.Where("record_id = ?", id).Find(&photos)
	for _, photo := range photos {
		utils.DeletePhoto(photo.PhotoURL)
	}

	if err := database.DB.Delete(&record).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除巡检记录失败")
		return
	}

	utils.SuccessResponse(c, nil)
}
