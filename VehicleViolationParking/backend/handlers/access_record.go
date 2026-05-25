package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"vehicle-parking/backend/models"
	"vehicle-parking/backend/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AccessRecordHandler struct {
	DB *gorm.DB
}

func NewAccessRecordHandler(db *gorm.DB) *AccessRecordHandler {
	return &AccessRecordHandler{DB: db}
}

type EntryRequest struct {
	PlateNumber string `json:"plate_number" binding:"required"`
	SpotID      *uint  `json:"spot_id"`
}

type ExitRequest struct {
	PlateNumber string `json:"plate_number" binding:"required"`
	PayMethod   string `json:"pay_method"`
}

func (h *AccessRecordHandler) Entry(c *gin.Context) {
	var req EntryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var vehicle models.Vehicle
	var vehicleID *uint
	h.DB.Where("plate_number = ?", req.PlateNumber).First(&vehicle)
	if vehicle.ID > 0 {
		vid := vehicle.ID
		vehicleID = &vid
		if vehicle.CardType == 2 && vehicle.CardExpireTime != nil && vehicle.CardExpireTime.Before(time.Now()) {
			utils.Fail(c, http.StatusBadRequest, "月卡已过期")
			return
		}
	}

	var spot *models.ParkingSpot
	var spotID *uint
	if req.SpotID != nil {
		var s models.ParkingSpot
		if h.DB.First(&s, *req.SpotID).Error == nil {
			if s.Status != 0 {
				utils.Fail(c, http.StatusBadRequest, "该车位已被占用")
				return
			}
			spot = &s
			sid := s.ID
			spotID = &sid
		}
	}

	now := time.Now()
	record := models.AccessRecord{
		PlateNumber: req.PlateNumber,
		VehicleID:   vehicleID,
		AccessType:  1,
		AccessTime:  now,
		SpotID:      spotID,
		EntryTime:   &now,
	}

	tx := h.DB.Begin()
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "入场记录创建失败")
		return
	}

	if spot != nil {
		if err := tx.Model(&models.ParkingSpot{}).
			Where("id = ?", spot.ID).
			Updates(map[string]interface{}{
				"status":               1,
				"current_vehicle_id":   vehicleID,
				"current_plate_number": req.PlateNumber,
			}).Error; err != nil {
			tx.Rollback()
			utils.Fail(c, http.StatusInternalServerError, "车位状态更新失败")
			return
		}

		if utils.RedisClient != nil {
			ctx := context.Background()
			utils.CacheSpotStatus(ctx, &utils.SpotCache{
				SpotID:      spot.ID,
				SpotNumber:  spot.SpotNumber,
				Status:      1,
				PlateNumber: req.PlateNumber,
				VehicleID:   vehicle.ID,
				EntryTime:   now.Format("2006-01-02 15:04:05"),
			})
			utils.SetVehicleSpot(ctx, req.PlateNumber, spot.ID)
		}
	}

	tx.Commit()
	utils.Success(c, record)
}

func (h *AccessRecordHandler) Exit(c *gin.Context) {
	var req ExitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var entryRecord models.AccessRecord
	if err := h.DB.Where("plate_number = ? AND access_type = 1", req.PlateNumber).
		Order("access_time DESC").
		First(&entryRecord).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "未找到入场记录")
		return
	}

	if entryRecord.ParkingDuration > 0 {
		utils.Fail(c, http.StatusBadRequest, "该车辆已出场")
		return
	}

	var vehicle models.Vehicle
	var isMonthlyCard bool
	h.DB.Where("plate_number = ?", req.PlateNumber).First(&vehicle)
	if vehicle.ID > 0 && vehicle.CardType == 2 && vehicle.CardExpireTime != nil && vehicle.CardExpireTime.After(time.Now()) {
		isMonthlyCard = true
	}

	var fee float64
	var duration int
	if !isMonthlyCard {
		var rule models.BillingRule
		vehicleType := 1
		if vehicle.VehicleType > 0 {
			vehicleType = vehicle.VehicleType
		}
		h.DB.Where("vehicle_type = ? AND status = 1", vehicleType).
			Order("priority DESC").
			First(&rule)

		if rule.ID > 0 {
			exitTime := time.Now()
			entryTime := entryRecord.EntryTime
			if entryTime == nil {
				entryTime = &entryRecord.AccessTime
			}
			calcFee, calcDuration, err := utils.CalculateParkingFee(&rule, *entryTime, exitTime)
			if err != nil {
				utils.Fail(c, http.StatusInternalServerError, "计费失败")
				return
			}
			fee = calcFee
			duration = calcDuration
		}
	}

	now := time.Now()
	tx := h.DB.Begin()

	payMethod := req.PayMethod
	if payMethod == "" {
		if isMonthlyCard {
			payMethod = "月卡"
		} else {
			payMethod = "现金"
		}
	}

	exitRecord := models.AccessRecord{
		PlateNumber:     req.PlateNumber,
		VehicleID:       entryRecord.VehicleID,
		AccessType:      2,
		AccessTime:      now,
		SpotID:          entryRecord.SpotID,
		EntryRecordID:   &entryRecord.ID,
		EntryTime:       entryRecord.EntryTime,
		ExitTime:        &now,
		ParkingDuration: duration,
		ParkingFee:      fee,
		PayStatus:       1,
		PayTime:         &now,
		PayMethod:       payMethod,
	}

	if err := tx.Create(&exitRecord).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "出场记录创建失败")
		return
	}

	if err := tx.Model(&entryRecord).Updates(map[string]interface{}{
		"exit_time":        &now,
		"parking_duration": duration,
		"parking_fee":      fee,
		"pay_status":       1,
		"pay_time":         &now,
		"pay_method":       payMethod,
	}).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "更新入场记录失败")
		return
	}

	if entryRecord.SpotID != nil {
		if err := tx.Model(&models.ParkingSpot{}).
			Where("id = ?", *entryRecord.SpotID).
			Updates(map[string]interface{}{
				"status":               0,
				"current_vehicle_id":   nil,
				"current_plate_number": "",
			}).Error; err != nil {
			tx.Rollback()
			utils.Fail(c, http.StatusInternalServerError, "车位状态更新失败")
			return
		}

		if utils.RedisClient != nil {
			ctx := context.Background()
			utils.DeleteSpotStatus(ctx, *entryRecord.SpotID)
			utils.DeleteVehicleSpot(ctx, req.PlateNumber)
		}
	}

	tx.Commit()

	utils.Success(c, gin.H{
		"exit_record":  exitRecord,
		"is_monthly":   isMonthlyCard,
		"parking_fee":  fee,
		"duration_min": duration,
	})
}

func (h *AccessRecordHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	plateNumber := c.Query("plate_number")
	accessType := c.Query("access_type")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	query := h.DB.Model(&models.AccessRecord{})
	if plateNumber != "" {
		query = query.Where("plate_number LIKE ?", "%"+plateNumber+"%")
	}
	if accessType != "" {
		query = query.Where("access_type = ?", accessType)
	}
	if startDate != "" {
		query = query.Where("access_time >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("access_time <= ?", endDate+" 23:59:59")
	}

	var total int64
	query.Count(&total)

	var records []models.AccessRecord
	offset := (page - 1) * pageSize
	query.Order("access_time DESC").Offset(offset).Limit(pageSize).Find(&records)

	utils.Success(c, gin.H{
		"list":      records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func (h *AccessRecordHandler) GetById(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var record models.AccessRecord
	if err := h.DB.First(&record, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "记录不存在")
		return
	}

	utils.Success(c, record)
}

func (h *AccessRecordHandler) GetActiveByPlate(c *gin.Context) {
	plateNumber := c.Param("plate")

	var record models.AccessRecord
	if err := h.DB.Where("plate_number = ? AND access_type = 1 AND parking_duration = 0", plateNumber).
		Order("access_time DESC").
		First(&record).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			utils.Success(c, nil)
			return
		}
		utils.Fail(c, http.StatusInternalServerError, "查询失败")
		return
	}

	utils.Success(c, record)
}

func (h *AccessRecordHandler) CalculateFee(c *gin.Context) {
	plateNumber := c.Query("plate_number")

	var entryRecord models.AccessRecord
	if err := h.DB.Where("plate_number = ? AND access_type = 1", plateNumber).
		Order("access_time DESC").
		First(&entryRecord).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "未找到入场记录")
		return
	}

	if entryRecord.ParkingDuration > 0 {
		utils.Success(c, gin.H{
			"already_exited": true,
			"fee":            entryRecord.ParkingFee,
		})
		return
	}

	var vehicle models.Vehicle
	h.DB.Where("plate_number = ?", plateNumber).First(&vehicle)

	var isMonthlyCard bool
	if vehicle.ID > 0 && vehicle.CardType == 2 && vehicle.CardExpireTime != nil && vehicle.CardExpireTime.After(time.Now()) {
		isMonthlyCard = true
	}

	if isMonthlyCard {
		utils.Success(c, gin.H{
			"is_monthly_card": true,
			"fee":             0,
			"message":         "月卡车辆免费",
		})
		return
	}

	var rule models.BillingRule
	vehicleType := 1
	if vehicle.VehicleType > 0 {
		vehicleType = vehicle.VehicleType
	}
	h.DB.Where("vehicle_type = ? AND status = 1", vehicleType).
		Order("priority DESC").
		First(&rule)

	if rule.ID == 0 {
		utils.Fail(c, http.StatusNotFound, "未找到计费规则")
		return
	}

	entryTime := entryRecord.EntryTime
	if entryTime == nil {
		entryTime = &entryRecord.AccessTime
	}

	now := time.Now()
	fee, duration, err := utils.CalculateParkingFee(&rule, *entryTime, now)
	if err != nil {
		utils.Fail(c, http.StatusInternalServerError, "计费失败")
		return
	}

	utils.Success(c, gin.H{
		"is_monthly_card": false,
		"fee":             fee,
		"duration_min":    duration,
		"entry_time":      entryTime.Format("2006-01-02 15:04:05"),
		"exit_time":       now.Format("2006-01-02 15:04:05"),
		"rule_name":       rule.RuleName,
		"free_duration":   rule.FreeDuration,
	})
}

func (h *AccessRecordHandler) Statistics(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	if startDate == "" {
		now := time.Now()
		startDate = now.AddDate(0, 0, -7).Format("2006-01-02")
	}
	if endDate == "" {
		endDate = time.Now().Format("2006-01-02")
	}

	var stats struct {
		TotalEntries  int64   `json:"total_entries"`
		TotalExits    int64   `json:"total_exits"`
		TotalRevenue  float64 `json:"total_revenue"`
		CurrentInside int64   `json:"current_inside"`
	}

	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 1 AND access_time >= ? AND access_time <= ?", startDate, endDate+" 23:59:59").
		Count(&stats.TotalEntries)

	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 2 AND access_time >= ? AND access_time <= ?", startDate, endDate+" 23:59:59").
		Count(&stats.TotalExits)

	h.DB.Model(&models.AccessRecord{}).
		Where("access_type = 2 AND pay_status = 1 AND access_time >= ? AND access_time <= ?", startDate, endDate+" 23:59:59").
		Select("COALESCE(SUM(parking_fee), 0)").
		Scan(&stats.TotalRevenue)

	h.DB.Raw(`
		SELECT COUNT(*) FROM (
			SELECT plate_number FROM access_records 
			WHERE access_type = 1 AND parking_duration = 0 
			AND created_at >= ? AND created_at <= ?
			GROUP BY plate_number
		) t
	`, startDate, endDate+" 23:59:59").Scan(&stats.CurrentInside)

	utils.Success(c, stats)
}

func (h *AccessRecordHandler) Trend(c *gin.Context) {
	days, _ := strconv.Atoi(c.DefaultQuery("days", "7"))
	if days < 1 || days > 30 {
		days = 7
	}

	type TrendItem struct {
		Date       string  `json:"date"`
		Entries    int64   `json:"entries"`
		Exits      int64   `json:"exits"`
		Revenue    float64 `json:"revenue"`
	}

	var result []TrendItem

	now := time.Now()
	for i := days - 1; i >= 0; i-- {
		date := now.AddDate(0, 0, -i).Format("2006-01-02")
		var item TrendItem
		item.Date = date

		h.DB.Model(&models.AccessRecord{}).
			Where("access_type = 1 AND DATE(access_time) = ?", date).
			Count(&item.Entries)

		h.DB.Model(&models.AccessRecord{}).
			Where("access_type = 2 AND DATE(access_time) = ?", date).
			Count(&item.Exits)

		h.DB.Model(&models.AccessRecord{}).
			Where("access_type = 2 AND pay_status = 1 AND DATE(access_time) = ?", date).
			Select("COALESCE(SUM(parking_fee), 0)").
			Scan(&item.Revenue)

		result = append(result, item)
	}

	utils.Success(c, result)
}

func (h *AccessRecordHandler) AssignSpot(c *gin.Context) {
	var req struct {
		RecordID uint `json:"record_id" binding:"required"`
		SpotID   uint `json:"spot_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var record models.AccessRecord
	if err := h.DB.First(&record, req.RecordID).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "记录不存在")
		return
	}

	if record.ParkingDuration > 0 {
		utils.Fail(c, http.StatusBadRequest, "车辆已出场")
		return
	}

	var spot models.ParkingSpot
	if err := h.DB.First(&spot, req.SpotID).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "车位不存在")
		return
	}

	if spot.Status != 0 {
		utils.Fail(c, http.StatusBadRequest, "该车位已被占用")
		return
	}

	tx := h.DB.Begin()

	if err := tx.Model(&record).Update("spot_id", req.SpotID).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "更新记录失败")
		return
	}

	if err := tx.Model(&spot).Updates(map[string]interface{}{
		"status":               1,
		"current_vehicle_id":   record.VehicleID,
		"current_plate_number": record.PlateNumber,
	}).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "更新车位状态失败")
		return
	}

	if utils.RedisClient != nil {
		ctx := context.Background()
		utils.CacheSpotStatus(ctx, &utils.SpotCache{
			SpotID:      spot.ID,
			SpotNumber:  spot.SpotNumber,
			Status:      1,
			PlateNumber: record.PlateNumber,
			EntryTime:   time.Now().Format("2006-01-02 15:04:05"),
		})
		utils.SetVehicleSpot(ctx, record.PlateNumber, spot.ID)
	}

	tx.Commit()
	utils.Success(c, nil)
}

func (h *AccessRecordHandler) Pay(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	var req struct {
		PayMethod string `json:"pay_method" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误")
		return
	}

	var record models.AccessRecord
	if err := h.DB.First(&record, id).Error; err != nil {
		utils.Fail(c, http.StatusNotFound, "记录不存在")
		return
	}

	if record.PayStatus != 0 {
		utils.Fail(c, http.StatusBadRequest, "该记录已支付")
		return
	}

	now := time.Now()
	if err := h.DB.Model(&record).Updates(map[string]interface{}{
		"pay_status": 1,
		"pay_time":   &now,
		"pay_method": req.PayMethod,
	}).Error; err != nil {
		utils.Fail(c, http.StatusInternalServerError, "支付失败")
		return
	}

	utils.Success(c, nil)
}

func (h *AccessRecordHandler) ManualEntry(c *gin.Context) {
	var req struct {
		PlateNumber string    `json:"plate_number" binding:"required"`
		EntryTime   time.Time `json:"entry_time" binding:"required"`
		SpotID      *uint     `json:"spot_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	var vehicle models.Vehicle
	var vehicleID *uint
	h.DB.Where("plate_number = ?", req.PlateNumber).First(&vehicle)
	if vehicle.ID > 0 {
		vid := vehicle.ID
		vehicleID = &vid
	}

	record := models.AccessRecord{
		PlateNumber: req.PlateNumber,
		VehicleID:   vehicleID,
		AccessType:  1,
		AccessTime:  req.EntryTime,
		SpotID:      req.SpotID,
		EntryTime:   &req.EntryTime,
	}

	tx := h.DB.Begin()
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "创建失败")
		return
	}

	if req.SpotID != nil {
		tx.Model(&models.ParkingSpot{}).
			Where("id = ?", *req.SpotID).
			Updates(map[string]interface{}{
				"status":               1,
				"current_vehicle_id":   vehicleID,
				"current_plate_number": req.PlateNumber,
			})
	}

	tx.Commit()
	utils.Success(c, record)
}

func (h *AccessRecordHandler) ManualExit(c *gin.Context) {
	var req struct {
		PlateNumber     string    `json:"plate_number" binding:"required"`
		EntryTime       time.Time `json:"entry_time" binding:"required"`
		ExitTime        time.Time `json:"exit_time" binding:"required"`
		ParkingDuration int       `json:"parking_duration"`
		ParkingFee      float64   `json:"parking_fee"`
		SpotID          *uint     `json:"spot_id"`
		PayMethod       string    `json:"pay_method"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, http.StatusBadRequest, "参数错误: "+err.Error())
		return
	}

	var vehicle models.Vehicle
	var vehicleID *uint
	h.DB.Where("plate_number = ?", req.PlateNumber).First(&vehicle)
	if vehicle.ID > 0 {
		vid := vehicle.ID
		vehicleID = &vid
	}

	var duration int
	var fee float64

	if req.ParkingDuration > 0 {
		duration = req.ParkingDuration
	} else {
		duration = int(req.ExitTime.Sub(req.EntryTime).Minutes())
	}

	if req.ParkingFee > 0 {
		fee = req.ParkingFee
	} else {
		var rule models.BillingRule
		vehicleType := 1
		if vehicle.VehicleType > 0 {
			vehicleType = vehicle.VehicleType
		}
		h.DB.Where("vehicle_type = ? AND status = 1", vehicleType).
			Order("priority DESC").
			First(&rule)
		if rule.ID > 0 {
			fee, _, _ = utils.CalculateParkingFee(&rule, req.EntryTime, req.ExitTime)
		}
	}

	payMethod := req.PayMethod
	if payMethod == "" {
		payMethod = "现金"
	}

	entryRecord := models.AccessRecord{
		PlateNumber:     req.PlateNumber,
		VehicleID:       vehicleID,
		AccessType:      1,
		AccessTime:      req.EntryTime,
		SpotID:          req.SpotID,
		EntryTime:       &req.EntryTime,
		ExitTime:        &req.ExitTime,
		ParkingDuration: duration,
		ParkingFee:      fee,
		PayStatus:       1,
		PayTime:         &req.ExitTime,
		PayMethod:       payMethod,
	}

	exitRecord := models.AccessRecord{
		PlateNumber:     req.PlateNumber,
		VehicleID:       vehicleID,
		AccessType:      2,
		AccessTime:      req.ExitTime,
		SpotID:          req.SpotID,
		EntryTime:       &req.EntryTime,
		ExitTime:        &req.ExitTime,
		ParkingDuration: duration,
		ParkingFee:      fee,
		PayStatus:       1,
		PayTime:         &req.ExitTime,
		PayMethod:       payMethod,
	}

	tx := h.DB.Begin()
	if err := tx.Create(&entryRecord).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, fmt.Sprintf("创建入场记录失败: %v", err))
		return
	}

	exitRecord.EntryRecordID = &entryRecord.ID
	if err := tx.Create(&exitRecord).Error; err != nil {
		tx.Rollback()
		utils.Fail(c, http.StatusInternalServerError, "创建出场记录失败")
		return
	}

	tx.Commit()
	utils.Success(c, gin.H{
		"entry_record": entryRecord,
		"exit_record":  exitRecord,
		"fee":          fee,
		"duration":     duration,
	})
}
