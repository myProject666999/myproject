package api

import (
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/internal/service"
	"short-drama-platform/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CalculateShareRequest struct {
	DramaID          uint64 `json:"drama_id" binding:"required"`
	SettlementPeriod string `json:"settlement_period" binding:"required"`
	TaskType         int8   `json:"task_type" binding:"required"`
}

func CalculateShare(c *gin.Context) {
	var req CalculateShareRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	service := service.NewShareCalculationService()
	taskNo, err := service.CalculateShare(req.DramaID, req.SettlementPeriod, req.TaskType)
	if err != nil {
		utils.Error(c, "分账计算失败: "+err.Error())
		return
	}

	utils.Success(c, gin.H{"task_no": taskNo})
}

func ListCalculationTasks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dramaID := c.Query("drama_id")
	status := c.Query("status")
	settlementPeriod := c.Query("settlement_period")

	query := dao.DB.Model(&model.ShareCalculationTask{})

	if dramaID != "" {
		query = query.Where("drama_id = ?", dramaID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if settlementPeriod != "" {
		query = query.Where("settlement_period = ?", settlementPeriod)
	}

	var total int64
	query.Count(&total)

	var tasks []model.ShareCalculationTask
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&tasks)

	utils.Page(c, tasks, total, page, pageSize)
}

func GetShareDetails(c *gin.Context) {
	taskID := c.Param("task_id")

	var details []model.ShareDetail
	dao.DB.Where("task_id = ?", taskID).Find(&details)

	utils.Success(c, details)
}

func GetStakeholderShareDetails(c *gin.Context) {
	stakeholderID := c.Param("stakeholder_id")
	settlementPeriod := c.Query("settlement_period")

	query := dao.DB.Model(&model.ShareDetail{}).Where("stakeholder_id = ?", stakeholderID)
	if settlementPeriod != "" {
		query = query.Where("settlement_period = ?", settlementPeriod)
	}

	var details []model.ShareDetail
	query.Order("created_at DESC").Find(&details)

	utils.Success(c, details)
}

func RegisterShareCalculationRoutes(r *gin.Engine) {
	shareGroup := r.Group("/api/share")
	shareGroup.Use(middleware.AuthMiddleware())
	{
		shareGroup.POST("/calculate", middleware.AdminMiddleware(), CalculateShare)
		shareGroup.GET("/tasks", ListCalculationTasks)
		shareGroup.GET("/details/:task_id", GetShareDetails)
		shareGroup.GET("/stakeholder/:stakeholder_id", GetStakeholderShareDetails)
	}
}
