package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TaskController struct{}

func NewTaskController() *TaskController {
	return &TaskController{}
}

func (ctrl *TaskController) GetTaskList(c *gin.Context) {
	var tasks []models.InspectionTask
	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	status := c.Query("status")
	inspectorID := c.Query("inspectorId")
	storeID := c.Query("storeId")

	query := database.DB.Model(&models.InspectionTask{}).Preload("Store").Preload("Inspector").Preload("Template")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if inspectorID != "" {
		query = query.Where("inspector_id = ?", inspectorID)
	}
	if storeID != "" {
		query = query.Where("store_id = ?", storeID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&tasks).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取任务列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":     tasks,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (ctrl *TaskController) GetTaskDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.Preload("Store").Preload("Inspector").Preload("Template").First(&task, id).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	utils.SuccessResponse(c, task)
}

func generateTaskCode() string {
	now := time.Now()
	dateStr := now.Format("200601")

	var maxSeq int
	var lastTask models.InspectionTask
	prefix := fmt.Sprintf("TASK%s%%", dateStr)

	database.DB.Where("task_code LIKE ?", prefix).Order("task_code DESC").First(&lastTask)

	if lastTask.ID > 0 {
		seqStr := lastTask.TaskCode[len(lastTask.TaskCode)-3:]
		maxSeq, _ = strconv.Atoi(seqStr)
	}

	return fmt.Sprintf("TASK%s%03d", dateStr, maxSeq+1)
}

func (ctrl *TaskController) CreateTask(c *gin.Context) {
	var task models.InspectionTask
	if err := c.ShouldBindJSON(&task); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if task.TaskName == "" {
		utils.BadRequestResponse(c, "任务名称不能为空")
		return
	}
	if task.TaskType == "" {
		utils.BadRequestResponse(c, "任务类型不能为空")
		return
	}
	if task.TemplateID == 0 {
		utils.BadRequestResponse(c, "模板ID不能为空")
		return
	}
	if task.StoreID == 0 {
		utils.BadRequestResponse(c, "门店ID不能为空")
		return
	}
	if task.InspectorID == 0 {
		utils.BadRequestResponse(c, "巡店员ID不能为空")
		return
	}

	var template models.ChecklistTemplate
	if err := database.DB.First(&template, task.TemplateID).Error; err != nil {
		utils.NotFoundResponse(c, "模板不存在")
		return
	}

	var store models.Store
	if err := database.DB.First(&store, task.StoreID).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	var inspector models.User
	if err := database.DB.First(&inspector, task.InspectorID).Error; err != nil {
		utils.NotFoundResponse(c, "巡店员不存在")
		return
	}

	task.TaskCode = generateTaskCode()
	task.Status = "pending"

	if err := database.DB.Create(&task).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建任务失败")
		return
	}

	utils.SuccessResponse(c, task)
}

func (ctrl *TaskController) UpdateTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	var updateData models.InspectionTask
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	task.TaskName = updateData.TaskName
	task.TaskType = updateData.TaskType
	task.TemplateID = updateData.TemplateID
	task.StoreID = updateData.StoreID
	task.InspectorID = updateData.InspectorID
	task.PlanDate = updateData.PlanDate
	task.Priority = updateData.Priority
	task.Remark = updateData.Remark

	if err := database.DB.Save(&task).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新任务失败")
		return
	}

	utils.SuccessResponse(c, task)
}

func (ctrl *TaskController) DeleteTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	if err := database.DB.Delete(&task).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除任务失败")
		return
	}

	utils.SuccessResponse(c, nil)
}

func (ctrl *TaskController) StartTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.First(&task, id).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	if task.Status != "pending" {
		utils.BadRequestResponse(c, "只有待开始的任务才能开始")
		return
	}

	task.Status = "in_progress"
	task.StartTime = time.Now()

	if err := database.DB.Save(&task).Error; err != nil {
		utils.InternalServerErrorResponse(c, "开始任务失败")
		return
	}

	utils.SuccessResponse(c, task)
}

func (ctrl *TaskController) CompleteTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的任务ID")
		return
	}

	var task models.InspectionTask
	if err := database.DB.Preload("Template").First(&task, id).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	if task.Status != "in_progress" {
		utils.BadRequestResponse(c, "只有进行中的任务才能完成")
		return
	}

	var records []models.InspectionRecord
	if err := database.DB.Where("task_id = ?", id).Find(&records).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取巡检记录失败")
		return
	}

	totalScore := 0
	for _, record := range records {
		totalScore += record.Score
	}

	task.Status = "completed"
	task.EndTime = time.Now()
	task.ActualScore = totalScore
	if task.Template.PassScore > 0 {
		if totalScore >= task.Template.PassScore {
			task.IsPass = 1
		} else {
			task.IsPass = 0
		}
	}

	if err := database.DB.Save(&task).Error; err != nil {
		utils.InternalServerErrorResponse(c, "完成任务失败")
		return
	}

	utils.SuccessResponse(c, task)
}
