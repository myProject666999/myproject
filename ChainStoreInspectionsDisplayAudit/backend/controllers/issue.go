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

type IssueController struct{}

func NewIssueController() *IssueController {
	return &IssueController{}
}

func (ctrl *IssueController) GetIssueList(c *gin.Context) {
	var issues []models.Issue
	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	status := c.Query("status")
	issueLevel := c.Query("issueLevel")
	issueType := c.Query("issueType")
	storeID := c.Query("storeId")

	query := database.DB.Model(&models.Issue{}).Preload("Store").Preload("Discoverer").Preload("Assignee").Preload("Photos")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if issueLevel != "" {
		query = query.Where("issue_level = ?", issueLevel)
	}
	if issueType != "" {
		query = query.Where("issue_type = ?", issueType)
	}
	if storeID != "" {
		query = query.Where("store_id = ?", storeID)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&issues).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取问题列表失败")
		return
	}

	utils.SuccessResponse(c, gin.H{
		"list":     issues,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}

func (ctrl *IssueController) GetIssueDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的问题ID")
		return
	}

	var issue models.Issue
	if err := database.DB.Preload("Store").Preload("Discoverer").Preload("Assignee").Preload("Photos").Preload("Rectifications").First(&issue, id).Error; err != nil {
		utils.NotFoundResponse(c, "问题不存在")
		return
	}

	utils.SuccessResponse(c, issue)
}

func generateIssueCode() string {
	now := time.Now()
	dateStr := now.Format("200601")

	var maxSeq int
	var lastIssue models.Issue
	prefix := fmt.Sprintf("ISS%s%%", dateStr)

	database.DB.Where("issue_code LIKE ?", prefix).Order("issue_code DESC").First(&lastIssue)

	if lastIssue.ID > 0 {
		seqStr := lastIssue.IssueCode[len(lastIssue.IssueCode)-3:]
		maxSeq, _ = strconv.Atoi(seqStr)
	}

	return fmt.Sprintf("ISS%s%03d", dateStr, maxSeq+1)
}

func (ctrl *IssueController) CreateIssue(c *gin.Context) {
	var issue models.Issue
	if err := c.ShouldBindJSON(&issue); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if issue.Title == "" {
		utils.BadRequestResponse(c, "问题标题不能为空")
		return
	}
	if issue.StoreID == 0 {
		utils.BadRequestResponse(c, "门店ID不能为空")
		return
	}
	if issue.TaskID == 0 {
		utils.BadRequestResponse(c, "任务ID不能为空")
		return
	}
	if issue.DiscovererID == 0 {
		utils.BadRequestResponse(c, "发现人ID不能为空")
		return
	}

	var store models.Store
	if err := database.DB.First(&store, issue.StoreID).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	var task models.InspectionTask
	if err := database.DB.First(&task, issue.TaskID).Error; err != nil {
		utils.NotFoundResponse(c, "任务不存在")
		return
	}

	var discoverer models.User
	if err := database.DB.First(&discoverer, issue.DiscovererID).Error; err != nil {
		utils.NotFoundResponse(c, "发现人不存在")
		return
	}

	issue.IssueCode = generateIssueCode()
	issue.Status = "pending"
	if issue.DiscoverTime.IsZero() {
		issue.DiscoverTime = time.Now()
	}

	if err := database.DB.Create(&issue).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建问题失败")
		return
	}

	utils.SuccessResponse(c, issue)
}

func (ctrl *IssueController) UpdateIssue(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的问题ID")
		return
	}

	var issue models.Issue
	if err := database.DB.First(&issue, id).Error; err != nil {
		utils.NotFoundResponse(c, "问题不存在")
		return
	}

	var updateData models.Issue
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	if updateData.Title != "" {
		issue.Title = updateData.Title
	}
	issue.Description = updateData.Description
	if updateData.IssueLevel != "" {
		issue.IssueLevel = updateData.IssueLevel
	}
	if updateData.IssueType != "" {
		issue.IssueType = updateData.IssueType
	}

	if err := database.DB.Save(&issue).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新问题失败")
		return
	}

	utils.SuccessResponse(c, issue)
}

func (ctrl *IssueController) DeleteIssue(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的问题ID")
		return
	}

	var issue models.Issue
	if err := database.DB.First(&issue, id).Error; err != nil {
		utils.NotFoundResponse(c, "问题不存在")
		return
	}

	if err := database.DB.Delete(&issue).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除问题失败")
		return
	}

	utils.SuccessResponse(c, nil)
}

func (ctrl *IssueController) AssignIssue(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的问题ID")
		return
	}

	var issue models.Issue
	if err := database.DB.First(&issue, id).Error; err != nil {
		utils.NotFoundResponse(c, "问题不存在")
		return
	}

	if issue.Status != "pending" {
		utils.BadRequestResponse(c, "只有待派单的问题才能派单")
		return
	}

	var assignData struct {
		AssigneeID uint64 `json:"assigneeId" binding:"required"`
		Deadline   string `json:"deadline" binding:"required"`
	}
	if err := c.ShouldBindJSON(&assignData); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	var assignee models.User
	if err := database.DB.First(&assignee, assignData.AssigneeID).Error; err != nil {
		utils.NotFoundResponse(c, "整改人不存在")
		return
	}

	issue.AssigneeID = assignData.AssigneeID
	issue.Deadline = assignData.Deadline
	issue.Status = "assigned"

	if err := database.DB.Save(&issue).Error; err != nil {
		utils.InternalServerErrorResponse(c, "派单失败")
		return
	}

	utils.SuccessResponse(c, issue)
}
