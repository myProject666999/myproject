package handlers

import (
	"net/http"
	"price-monitor/database"
	"price-monitor/middleware"
	"price-monitor/models"
	"price-monitor/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AlertHandler struct{}

type CreateAlertRequest struct {
	ProductID        uint64   `json:"product_id" binding:"required"`
	AlertType        string   `json:"alert_type" binding:"required,oneof=price_drop below_threshold daily weekly"`
	ThresholdPrice   *float64 `json:"threshold_price"`
	ThresholdPercent *float64 `json:"threshold_percent"`
	NotifyEmail      int8     `json:"notify_email"`
	NotifySMS        int8     `json:"notify_sms"`
	NotifyWechat     int8     `json:"notify_wechat"`
	NotifyWebpush    int8     `json:"notify_webpush"`
}

type UpdateAlertRequest struct {
	ThresholdPrice   *float64 `json:"threshold_price"`
	ThresholdPercent *float64 `json:"threshold_percent"`
	NotifyEmail      *int8    `json:"notify_email"`
	NotifySMS        *int8    `json:"notify_sms"`
	NotifyWechat     *int8    `json:"notify_wechat"`
	NotifyWebpush    *int8    `json:"notify_webpush"`
	Status           *int8    `json:"status"`
}

func (h *AlertHandler) CreateAlert(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var req CreateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	var product models.Product
	if err := database.DB.Where("id = ? AND user_id = ?", req.ProductID, userID).First(&product).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "商品不存在")
		return
	}

	alert := models.AlertSetting{
		UserID:           userID,
		ProductID:        req.ProductID,
		AlertType:        req.AlertType,
		ThresholdPrice:   req.ThresholdPrice,
		ThresholdPercent: req.ThresholdPercent,
		NotifyEmail:      req.NotifyEmail,
		NotifySMS:        req.NotifySMS,
		NotifyWechat:     req.NotifyWechat,
		NotifyWebpush:    req.NotifyWebpush,
		Status:           1,
	}

	if err := database.DB.Create(&alert).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "创建提醒失败")
		return
	}

	utils.SendSuccess(c, alert)
}

func (h *AlertHandler) GetAlerts(c *gin.Context) {
	userID := middleware.GetUserID(c)
	productID := c.Query("product_id")
	alertType := c.Query("alert_type")

	db := database.DB.Model(&models.AlertSetting{}).Where("user_id = ?", userID)

	if productID != "" {
		db = db.Where("product_id = ?", productID)
	}
	if alertType != "" {
		db = db.Where("alert_type = ?", alertType)
	}

	var alerts []models.AlertSetting
	db.Order("created_at DESC").Find(&alerts)

	utils.SendSuccess(c, alerts)
}

func (h *AlertHandler) GetAlert(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var alert models.AlertSetting
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&alert).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "提醒不存在")
		return
	}

	utils.SendSuccess(c, alert)
}

func (h *AlertHandler) UpdateAlert(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var alert models.AlertSetting
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&alert).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "提醒不存在")
		return
	}

	var req UpdateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.SendError(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	updates := map[string]interface{}{}
	if req.ThresholdPrice != nil {
		updates["threshold_price"] = *req.ThresholdPrice
	}
	if req.ThresholdPercent != nil {
		updates["threshold_percent"] = *req.ThresholdPercent
	}
	if req.NotifyEmail != nil {
		updates["notify_email"] = *req.NotifyEmail
	}
	if req.NotifySMS != nil {
		updates["notify_sms"] = *req.NotifySMS
	}
	if req.NotifyWechat != nil {
		updates["notify_wechat"] = *req.NotifyWechat
	}
	if req.NotifyWebpush != nil {
		updates["notify_webpush"] = *req.NotifyWebpush
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	if err := database.DB.Model(&alert).Updates(updates).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "更新失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "更新成功"})
}

func (h *AlertHandler) DeleteAlert(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	var alert models.AlertSetting
	if err := database.DB.Where("id = ? AND user_id = ?", id, userID).First(&alert).Error; err != nil {
		utils.SendError(c, http.StatusNotFound, "提醒不存在")
		return
	}

	database.DB.Delete(&alert)
	utils.SendSuccess(c, gin.H{"message": "删除成功"})
}

func (h *AlertHandler) GetAlertLogs(c *gin.Context) {
	userID := middleware.GetUserID(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	isRead := c.Query("is_read")
	alertType := c.Query("alert_type")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	db := database.DB.Model(&models.AlertLog{}).Where("user_id = ?", userID)

	if isRead != "" {
		db = db.Where("is_read = ?", isRead)
	}
	if alertType != "" {
		db = db.Where("alert_type = ?", alertType)
	}

	var total int64
	db.Count(&total)

	var logs []models.AlertLog
	offset := (page - 1) * pageSize
	db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&logs)

	utils.SendPage(c, logs, total, page, pageSize)
}

func (h *AlertHandler) MarkAsRead(c *gin.Context) {
	userID := middleware.GetUserID(c)
	id := c.Param("id")

	if err := database.DB.Model(&models.AlertLog{}).
		Where("id = ? AND user_id = ?", id, userID).
		Update("is_read", 1).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "标记失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "标记成功"})
}

func (h *AlertHandler) MarkAllAsRead(c *gin.Context) {
	userID := middleware.GetUserID(c)

	if err := database.DB.Model(&models.AlertLog{}).
		Where("user_id = ? AND is_read = ?", userID, 0).
		Update("is_read", 1).Error; err != nil {
		utils.SendError(c, http.StatusInternalServerError, "标记失败")
		return
	}

	utils.SendSuccess(c, gin.H{"message": "全部标记为已读"})
}

func (h *AlertHandler) GetUnreadCount(c *gin.Context) {
	userID := middleware.GetUserID(c)

	var count int64
	database.DB.Model(&models.AlertLog{}).
		Where("user_id = ? AND is_read = ?", userID, 0).
		Count(&count)

	utils.SendSuccess(c, gin.H{"count": count})
}
