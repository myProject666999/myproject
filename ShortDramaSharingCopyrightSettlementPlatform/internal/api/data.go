package api

import (
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PlayDataCreateRequest struct {
	DramaID       uint64 `json:"drama_id" binding:"required"`
	EpisodeNo     int    `json:"episode_no"`
	PlayCount     int64  `json:"play_count"`
	PlayDuration  int64  `json:"play_duration"`
	UniqueViewers int64  `json:"unique_viewers"`
	DataDate      string `json:"data_date" binding:"required"`
	DataSource    string `json:"data_source" binding:"required"`
}

type PaymentDataCreateRequest struct {
	DramaID       uint64  `json:"drama_id" binding:"required"`
	EpisodeNo     int     `json:"episode_no"`
	PaymentAmount float64 `json:"payment_amount"`
	PaymentCount  int     `json:"payment_count"`
	UniquePayers  int     `json:"unique_payers"`
	DataDate      string  `json:"data_date" binding:"required"`
	DataSource    string  `json:"data_source" binding:"required"`
}

func ImportPlayData(c *gin.Context) {
	var req PlayDataCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	dataDate, err := time.Parse("2006-01-02", req.DataDate)
	if err != nil {
		utils.Error(c, "日期格式错误，请使用 YYYY-MM-DD")
		return
	}

	var existing model.PlayData
	result := dao.DB.Where("drama_id = ? AND data_date = ? AND episode_no = ?",
		req.DramaID, dataDate, req.EpisodeNo).First(&existing)

	if result.Error == nil {
		updates := map[string]interface{}{
			"play_count":     req.PlayCount,
			"play_duration":  req.PlayDuration,
			"unique_viewers": req.UniqueViewers,
			"data_source":    req.DataSource,
		}
		if err := dao.DB.Model(&existing).Updates(updates).Error; err != nil {
			utils.Error(c, "更新播放数据失败: "+err.Error())
			return
		}
		utils.Success(c, existing)
		return
	}

	playData := &model.PlayData{
		DataNo:        utils.GenerateNo("PLAY"),
		DramaID:       req.DramaID,
		EpisodeNo:     req.EpisodeNo,
		PlayCount:     req.PlayCount,
		PlayDuration:  req.PlayDuration,
		UniqueViewers: req.UniqueViewers,
		DataDate:      dataDate,
		DataSource:    req.DataSource,
		Status:        1,
	}

	if err := dao.DB.Create(playData).Error; err != nil {
		utils.Error(c, "导入播放数据失败: "+err.Error())
		return
	}

	utils.Success(c, playData)
}

func ImportPaymentData(c *gin.Context) {
	var req PaymentDataCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	dataDate, err := time.Parse("2006-01-02", req.DataDate)
	if err != nil {
		utils.Error(c, "日期格式错误，请使用 YYYY-MM-DD")
		return
	}

	var existing model.PaymentData
	result := dao.DB.Where("drama_id = ? AND data_date = ? AND episode_no = ?",
		req.DramaID, dataDate, req.EpisodeNo).First(&existing)

	if result.Error == nil {
		updates := map[string]interface{}{
			"payment_amount": req.PaymentAmount,
			"payment_count":  req.PaymentCount,
			"unique_payers":  req.UniquePayers,
			"data_source":    req.DataSource,
		}
		if err := dao.DB.Model(&existing).Updates(updates).Error; err != nil {
			utils.Error(c, "更新付费数据失败: "+err.Error())
			return
		}
		utils.Success(c, existing)
		return
	}

	paymentData := &model.PaymentData{
		DataNo:        utils.GenerateNo("PAY"),
		DramaID:       req.DramaID,
		EpisodeNo:     req.EpisodeNo,
		PaymentAmount: req.PaymentAmount,
		PaymentCount:  req.PaymentCount,
		UniquePayers:  req.UniquePayers,
		DataDate:      dataDate,
		DataSource:    req.DataSource,
		Status:        1,
	}

	if err := dao.DB.Create(paymentData).Error; err != nil {
		utils.Error(c, "导入付费数据失败: "+err.Error())
		return
	}

	utils.Success(c, paymentData)
}

func ListPlayData(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dramaID := c.Query("drama_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := dao.DB.Model(&model.PlayData{})

	if dramaID != "" {
		query = query.Where("drama_id = ?", dramaID)
	}
	if startDate != "" {
		query = query.Where("data_date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("data_date <= ?", endDate)
	}

	var total int64
	query.Count(&total)

	var data []model.PlayData
	offset := (page - 1) * pageSize
	query.Order("data_date DESC, id DESC").Offset(offset).Limit(pageSize).Find(&data)

	utils.Page(c, data, total, page, pageSize)
}

func ListPaymentData(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dramaID := c.Query("drama_id")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	query := dao.DB.Model(&model.PaymentData{})

	if dramaID != "" {
		query = query.Where("drama_id = ?", dramaID)
	}
	if startDate != "" {
		query = query.Where("data_date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("data_date <= ?", endDate)
	}

	var total int64
	query.Count(&total)

	var data []model.PaymentData
	offset := (page - 1) * pageSize
	query.Order("data_date DESC, id DESC").Offset(offset).Limit(pageSize).Find(&data)

	utils.Page(c, data, total, page, pageSize)
}

func BatchImportPlayData(c *gin.Context) {
	var items []PlayDataCreateRequest
	if err := c.ShouldBindJSON(&items); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	successCount := 0
	failCount := 0

	for _, item := range items {
		dataDate, err := time.Parse("2006-01-02", item.DataDate)
		if err != nil {
			failCount++
			continue
		}

		playData := &model.PlayData{
			DataNo:        utils.GenerateNo("PLAY"),
			DramaID:       item.DramaID,
			EpisodeNo:     item.EpisodeNo,
			PlayCount:     item.PlayCount,
			PlayDuration:  item.PlayDuration,
			UniqueViewers: item.UniqueViewers,
			DataDate:      dataDate,
			DataSource:    item.DataSource,
			Status:        1,
		}

		if err := dao.DB.Create(playData).Error; err != nil {
			failCount++
		} else {
			successCount++
		}
	}

	utils.Success(c, gin.H{
		"success_count": successCount,
		"fail_count":    failCount,
	})
}

func RegisterDataRoutes(r *gin.Engine) {
	dataGroup := r.Group("/api/data")
	dataGroup.Use(middleware.AuthMiddleware())
	{
		dataGroup.POST("/play", middleware.AdminMiddleware(), ImportPlayData)
		dataGroup.POST("/payment", middleware.AdminMiddleware(), ImportPaymentData)
		dataGroup.POST("/play/batch", middleware.AdminMiddleware(), BatchImportPlayData)
		dataGroup.GET("/play", ListPlayData)
		dataGroup.GET("/payment", ListPaymentData)
	}
}
