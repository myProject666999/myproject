package controllers

import (
	"encoding/json"
	"strconv"
	"time"

	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"

	"github.com/gin-gonic/gin"
)

type SyncController struct{}

func NewSyncController() *SyncController {
	return &SyncController{}
}

type SyncUploadRequest struct {
	SyncBatchNo string                     `json:"syncBatchNo" binding:"required"`
	DeviceUUID  string                     `json:"deviceUuid" binding:"required"`
	Records     []models.InspectionRecord  `json:"records"`
	Photos      []models.Photo             `json:"photos"`
	Issues      []models.Issue             `json:"issues"`
	Rectifications []models.Rectification  `json:"rectifications"`
}

type SyncPendingResponse struct {
	Records        []models.InspectionRecord  `json:"records"`
	Photos         []models.Photo             `json:"photos"`
	Issues         []models.Issue             `json:"issues"`
	Rectifications []models.Rectification    `json:"rectifications"`
	LastSyncTime   time.Time                  `json:"lastSyncTime"`
}

type SyncConfirmRequest struct {
	SyncBatchNo string `json:"syncBatchNo" binding:"required"`
}

func (ctrl *SyncController) Upload(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req SyncUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	dataJSON, _ := json.Marshal(req)

	syncRecord := models.OfflineSyncRecord{
		SyncBatchNo: req.SyncBatchNo,
		DeviceUUID:  req.DeviceUUID,
		UserID:      userID.(uint64),
		DataType:    "batch",
		DataCount:   len(req.Records) + len(req.Photos) + len(req.Issues) + len(req.Rectifications),
		SyncStatus:  "processing",
		SyncTime:    time.Now(),
		DataJSON:    string(dataJSON),
	}

	if err := database.DB.Create(&syncRecord).Error; err != nil {
		syncRecord.SyncStatus = "failed"
		syncRecord.ErrorMsg = err.Error()
		database.DB.Save(&syncRecord)
		utils.InternalServerErrorResponse(c, "创建同步记录失败")
		return
	}

	tx := database.DB.Begin()

	if len(req.Records) > 0 {
		for i := range req.Records {
			req.Records[i].SyncStatus = 1
		}
		if err := tx.Create(&req.Records).Error; err != nil {
			tx.Rollback()
			syncRecord.SyncStatus = "failed"
			syncRecord.ErrorMsg = "保存巡检记录失败: " + err.Error()
			database.DB.Save(&syncRecord)
			utils.InternalServerErrorResponse(c, syncRecord.ErrorMsg)
			return
		}
	}

	if len(req.Photos) > 0 {
		for i := range req.Photos {
			req.Photos[i].SyncStatus = 1
		}
		if err := tx.Create(&req.Photos).Error; err != nil {
			tx.Rollback()
			syncRecord.SyncStatus = "failed"
			syncRecord.ErrorMsg = "保存照片失败: " + err.Error()
			database.DB.Save(&syncRecord)
			utils.InternalServerErrorResponse(c, syncRecord.ErrorMsg)
			return
		}
	}

	if len(req.Issues) > 0 {
		for i := range req.Issues {
			req.Issues[i].SyncStatus = 1
		}
		if err := tx.Create(&req.Issues).Error; err != nil {
			tx.Rollback()
			syncRecord.SyncStatus = "failed"
			syncRecord.ErrorMsg = "保存问题失败: " + err.Error()
			database.DB.Save(&syncRecord)
			utils.InternalServerErrorResponse(c, syncRecord.ErrorMsg)
			return
		}
	}

	if len(req.Rectifications) > 0 {
		for i := range req.Rectifications {
			req.Rectifications[i].SyncStatus = 1
		}
		if err := tx.Create(&req.Rectifications).Error; err != nil {
			tx.Rollback()
			syncRecord.SyncStatus = "failed"
			syncRecord.ErrorMsg = "保存整改失败: " + err.Error()
			database.DB.Save(&syncRecord)
			utils.InternalServerErrorResponse(c, syncRecord.ErrorMsg)
			return
		}
	}

	tx.Commit()

	syncRecord.SyncStatus = "success"
	syncRecord.ErrorMsg = ""
	database.DB.Save(&syncRecord)

	utils.SuccessResponse(c, gin.H{
		"syncBatchNo": req.SyncBatchNo,
		"recordCount": len(req.Records),
		"photoCount":  len(req.Photos),
		"issueCount":  len(req.Issues),
		"rectCount":   len(req.Rectifications),
	})
}

func (ctrl *SyncController) GetPending(c *gin.Context) {
	userID, _ := c.Get("userID")

	lastSyncStr := c.Query("lastSyncTime")
	var lastSyncTime time.Time
	if lastSyncStr != "" {
		if t, err := time.Parse(time.RFC3339, lastSyncStr); err == nil {
			lastSyncTime = t
		}
	}

	var records []models.InspectionRecord
	var photos []models.Photo
	var issues []models.Issue
	var rectifications []models.Rectification

	query := database.DB.Where("sync_status = ? AND inspector_id = ?", 0, userID)
	if !lastSyncTime.IsZero() {
		query = query.Where("updated_at > ?", lastSyncTime)
	}
	query.Find(&records)

	photoQuery := database.DB.Where("sync_status = ? AND uploader_id = ?", 0, userID)
	if !lastSyncTime.IsZero() {
		photoQuery = photoQuery.Where("created_at > ?", lastSyncTime)
	}
	photoQuery.Find(&photos)

	issueQuery := database.DB.Where("sync_status = ? AND discoverer_id = ?", 0, userID)
	if !lastSyncTime.IsZero() {
		issueQuery = issueQuery.Where("updated_at > ?", lastSyncTime)
	}
	issueQuery.Find(&issues)

	rectQuery := database.DB.Where("sync_status = ? AND rectifier_id = ?", 0, userID)
	if !lastSyncTime.IsZero() {
		rectQuery = rectQuery.Where("updated_at > ?", lastSyncTime)
	}
	rectQuery.Find(&rectifications)

	utils.SuccessResponse(c, SyncPendingResponse{
		Records:        records,
		Photos:         photos,
		Issues:         issues,
		Rectifications: rectifications,
		LastSyncTime:   time.Now(),
	})
}

func (ctrl *SyncController) Confirm(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req SyncConfirmRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequestResponse(c, "参数错误: "+err.Error())
		return
	}

	tx := database.DB.Begin()

	result := tx.Model(&models.InspectionRecord{}).
		Where("sync_status = ? AND inspector_id = ?", 0, userID).
		Update("sync_status", 1)
	if result.Error != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "确认同步失败")
		return
	}

	result = tx.Model(&models.Photo{}).
		Where("sync_status = ? AND uploader_id = ?", 0, userID).
		Update("sync_status", 1)
	if result.Error != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "确认同步失败")
		return
	}

	result = tx.Model(&models.Issue{}).
		Where("sync_status = ? AND discoverer_id = ?", 0, userID).
		Update("sync_status", 1)
	if result.Error != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "确认同步失败")
		return
	}

	result = tx.Model(&models.Rectification{}).
		Where("sync_status = ? AND rectifier_id = ?", 0, userID).
		Update("sync_status", 1)
	if result.Error != nil {
		tx.Rollback()
		utils.InternalServerErrorResponse(c, "确认同步失败")
		return
	}

	tx.Model(&models.OfflineSyncRecord{}).
		Where("sync_batch_no = ? AND user_id = ?", req.SyncBatchNo, userID).
		Updates(map[string]interface{}{
			"sync_status": "success",
			"sync_time":   time.Now(),
		})

	tx.Commit()

	utils.SuccessResponse(c, gin.H{
		"message": "同步确认成功",
	})
}

func (ctrl *SyncController) GetSyncHistory(c *gin.Context) {
	userID, _ := c.Get("userID")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "10"))

	var records []models.OfflineSyncRecord
	var total int64

	query := database.DB.Model(&models.OfflineSyncRecord{}).
		Where("user_id = ?", userID)

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&records)

	utils.SuccessResponse(c, gin.H{
		"list":     records,
		"total":    total,
		"page":     page,
		"pageSize": pageSize,
	})
}
