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

type RectificationController struct{}

func NewRectificationController() *RectificationController {
	return &RectificationController{}
}

func (ctrl *RectificationController) GetRectificationList(c *gin.Context) {
	var rectifications []models.Rectification
	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	status := c.Query("status")
	issueID := c.Query("issueId")
	rectifierID := c.Query("rectifierId")

	query := database.DB.Model(&models.Rectification{}).Preload("Rectifier").Preload("Rechecker").Preload("StatusLogs.Operator")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if issueID != "" {
		query = query.Where("issue_id = ?", issueID)
	}
	if rectifierID != "" {
		query = query.Where("rectifier_id = ?", rectifierID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&rectifications).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取整改单列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":     rectifications,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (ctrl *RectificationController) GetRectificationDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的整改单ID")
		return
	}

	var rectification models.Rectification
	if err := database.DB.Preload("Rectifier").Preload("Rechecker").Preload("StatusLogs.Operator").First(&rectification, id).Error; err != nil {
		utils.NotFoundResponse(c, "整改单不存在")
		return
	}

	utils.SuccessResponse(c, rectification)
}

func generateRectificationNo() string {
	now := time.Now()
	dateStr := now.Format("200601")

	var maxSeq int
	var lastRectification models.Rectification
	prefix := fmt.Sprintf("RECT%s%%", dateStr)

	database.DB.Where("rectification_no LIKE ?", prefix).Order("rectification_no DESC").First(&lastRectification)

	if lastRectification.ID > 0 {
		seqStr := lastRectification.RectificationNo[len(lastRectification.RectificationNo)-3:]
		maxSeq, _ = strconv.Atoi(seqStr)
	}

	return fmt.Sprintf("RECT%s%03d", dateStr, maxSeq+1)
}

func addStatusLog(rectificationID uint64, issueID uint64, fromStatus string, toStatus string, operatorID uint64, remark string) error {
	log := models.RectificationStatusLog{
		RectificationID: rectificationID,
		IssueID:         issueID,
		FromStatus:      fromStatus,
		ToStatus:        toStatus,
		OperatorID:      operatorID,
		Remark:          remark,
	}
	return database.DB.Create(&log).Error
}

func (ctrl *RectificationController) CreateRectification(c *gin.Context) {
	var rectification models.Rectification
	if err := c.ShouldBindJSON(&rectification); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if rectification.IssueID == 0 {
		utils.BadRequestResponse(c, "问题ID不能为空")
		return
	}
	if rectification.RectifierID == 0 {
		utils.BadRequestResponse(c, "整改人ID不能为空")
		return
	}

	var issue models.Issue
	if err := database.DB.First(&issue, rectification.IssueID).Error; err != nil {
		utils.NotFoundResponse(c, "问题不存在")
		return
	}

	var rectifier models.User
	if err := database.DB.First(&rectifier, rectification.RectifierID).Error; err != nil {
		utils.NotFoundResponse(c, "整改人不存在")
		return
	}

	rectification.RectificationNo = generateRectificationNo()
	rectification.Status = "pending"
	rectification.Deadline = issue.Deadline

	tx := database.DB.Begin()

	if err := tx.Create(&rectification).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "创建整改单失败")
		return
	}

	if err := addStatusLog(rectification.ID, rectification.IssueID, "", "pending", rectification.RectifierID, "创建整改单"); err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "记录状态日志失败")
		return
	}

	issue.RectificationCount++
	issue.Status = "rectifying"
	if err := tx.Save(&issue).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "更新问题状态失败")
		return
	}

	tx.Commit()

	utils.SuccessResponse(c, rectification)
}

func (ctrl *RectificationController) UpdateRectification(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的整改单ID")
		return
	}

	var rectification models.Rectification
	if err := database.DB.First(&rectification, id).Error; err != nil {
		utils.NotFoundResponse(c, "整改单不存在")
		return
	}

	if rectification.Status != "pending" {
		utils.BadRequestResponse(c, "只能编辑待整改状态的整改单")
		return
	}

	var updateData models.Rectification
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	rectification.Description = updateData.Description
	if updateData.RectifierID > 0 {
		var rectifier models.User
		if err := database.DB.First(&rectifier, updateData.RectifierID).Error; err != nil {
			utils.NotFoundResponse(c, "整改人不存在")
			return
		}
		rectification.RectifierID = updateData.RectifierID
	}

	if err := database.DB.Save(&rectification).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新整改单失败")
		return
	}

	utils.SuccessResponse(c, rectification)
}

func (ctrl *RectificationController) SubmitRectification(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的整改单ID")
		return
	}

	var rectification models.Rectification
	if err := database.DB.First(&rectification, id).Error; err != nil {
		utils.NotFoundResponse(c, "整改单不存在")
		return
	}

	if rectification.Status != "pending" {
		utils.BadRequestResponse(c, "只能提交待整改状态的整改单")
		return
	}

	var submitData struct {
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&submitData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	fromStatus := rectification.Status
	rectification.Status = "submitted"
	rectification.SubmitTime = time.Now()
	if submitData.Description != "" {
		rectification.Description = submitData.Description
	}

	tx := database.DB.Begin()

	if err := tx.Save(&rectification).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "提交整改失败")
		return
	}

	if err := addStatusLog(rectification.ID, rectification.IssueID, fromStatus, "submitted", rectification.RectifierID, "提交整改，申请复查"); err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "记录状态日志失败")
		return
	}

	var issue models.Issue
	if err := tx.First(&issue, rectification.IssueID).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "获取问题信息失败")
		return
	}
	issue.Status = "rechecking"
	if err := tx.Save(&issue).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "更新问题状态失败")
		return
	}

	tx.Commit()

	utils.SuccessResponse(c, rectification)
}

func (ctrl *RectificationController) RecheckRectification(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的整改单ID")
		return
	}

	var rectification models.Rectification
	if err := database.DB.First(&rectification, id).Error; err != nil {
		utils.NotFoundResponse(c, "整改单不存在")
		return
	}

	if rectification.Status != "submitted" {
		utils.BadRequestResponse(c, "只能复查已提交状态的整改单")
		return
	}

	var recheckData struct {
		RecheckerID      uint64  `json:"recheckerId" binding:"required"`
		RecheckResult    string  `json:"recheckResult" binding:"required"`
		RecheckLongitude float64 `json:"recheckLongitude"`
		RecheckLatitude  float64 `json:"recheckLatitude"`
		IsPassed         bool    `json:"isPassed" binding:"required"`
	}
	if err := c.ShouldBindJSON(&recheckData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	var rechecker models.User
	if err := database.DB.First(&rechecker, recheckData.RecheckerID).Error; err != nil {
		utils.NotFoundResponse(c, "复查人不存在")
		return
	}

	fromStatus := rectification.Status
	toStatus := "passed"
	remark := "复查通过"
	if !recheckData.IsPassed {
		toStatus = "rejected"
		remark = "复查不通过，需重新整改"
	}

	rectification.Status = toStatus
	rectification.RecheckerID = recheckData.RecheckerID
	rectification.RecheckTime = time.Now()
	rectification.RecheckResult = recheckData.RecheckResult
	rectification.RecheckLongitude = recheckData.RecheckLongitude
	rectification.RecheckLatitude = recheckData.RecheckLatitude

	tx := database.DB.Begin()

	if err := tx.Save(&rectification).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "复查失败")
		return
	}

	if err := addStatusLog(rectification.ID, rectification.IssueID, fromStatus, toStatus, recheckData.RecheckerID, remark); err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "记录状态日志失败")
		return
	}

	var issue models.Issue
	if err := tx.First(&issue, rectification.IssueID).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "获取问题信息失败")
		return
	}

	if recheckData.IsPassed {
		issue.Status = "resolved"
		issue.IsRectified = 1
		issue.ActualResolveTime = time.Now()
	} else {
		issue.Status = "rectifying"
	}

	if err := tx.Save(&issue).Error; err != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "更新问题状态失败")
		return
	}

	tx.Commit()

	utils.SuccessResponse(c, rectification)
}
