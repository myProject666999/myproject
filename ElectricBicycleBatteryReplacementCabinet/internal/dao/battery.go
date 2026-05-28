package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"encoding/json"
	"fmt"
	"time"
)

func GetBatteryList(req *model.BatteryListReq) ([]model.Battery, int64, error) {
	var list []model.Battery
	var total int64

	query := database.DB.Model(&model.Battery{})

	if req.BatteryNo != "" {
		query = query.Where("battery_no LIKE ?", "%"+req.BatteryNo+"%")
	}
	if req.Status != nil {
		query = query.Where("status = ?", *req.Status)
	}
	if req.CabinetID != nil {
		query = query.Where("cabinet_id = ?", *req.CabinetID)
	}
	if req.MinSOC != nil {
		query = query.Where("current_soc >= ?", *req.MinSOC)
	}
	if req.MaxSOC != nil {
		query = query.Where("current_soc <= ?", *req.MaxSOC)
	}
	if req.MinHealth != nil {
		query = query.Where("health_status >= ?", *req.MinHealth)
	}

	query.Count(&total)

	offset := (req.Page - 1) * req.PageSize
	err := query.Offset(offset).Limit(req.PageSize).Order("id DESC").Find(&list).Error

	return list, total, err
}

func GetBatteryByID(id uint64) (*model.Battery, error) {
	var battery model.Battery
	err := database.DB.Where("id = ?", id).First(&battery).Error
	if err != nil {
		return nil, err
	}
	return &battery, nil
}

func GetBatteryByNo(batteryNo string) (*model.Battery, error) {
	var battery model.Battery
	err := database.DB.Where("battery_no = ?", batteryNo).First(&battery).Error
	if err != nil {
		return nil, err
	}
	return &battery, nil
}

func UpdateBatteryStatus(batteryID uint64, status int) error {
	return database.DB.Model(&model.Battery{}).
		Where("id = ?", batteryID).
		Update("status", status).Error
}

func UpdateBattery(battery *model.Battery) error {
	return database.DB.Save(battery).Error
}

func ReportBatteryStatus(req *model.BatteryStatusReportReq) error {
	now := time.Now()
	updates := map[string]interface{}{
		"current_soc":    req.CurrentSOC,
		"health_status":  req.HealthStatus,
		"temperature":    req.Temperature,
		"status":         req.Status,
		"last_report_at": now,
	}

	err := database.DB.Model(&model.Battery{}).
		Where("id = ?", req.BatteryID).
		Updates(updates).Error
	if err != nil {
		return err
	}

	history := &model.BatteryStatusHistory{
		BatteryID:    req.BatteryID,
		CurrentSOC:   req.CurrentSOC,
		HealthStatus: req.HealthStatus,
		Temperature:  req.Temperature,
		Status:       req.Status,
		ReportAt:     now,
	}

	battery, err := GetBatteryByID(req.BatteryID)
	if err == nil && battery.CabinetID != nil {
		history.CabinetID = battery.CabinetID
	}

	return database.DB.Create(history).Error
}

func GetBatteryStats() (*model.BatteryStatsVO, error) {
	var stats model.BatteryStatsVO

	database.DB.Model(&model.Battery{}).Count(&stats.TotalCount)
	database.DB.Model(&model.Battery{}).Where("status = ?", model.BatteryStatusAvailable).Count(&stats.AvailableCount)
	database.DB.Model(&model.Battery{}).Where("status = ?", model.BatteryStatusInUse).Count(&stats.InUseCount)
	database.DB.Model(&model.Battery{}).Where("status = ?", model.BatteryStatusCharging).Count(&stats.ChargingCount)
	database.DB.Model(&model.Battery{}).Where("status = ?", model.BatteryStatusAbnormal).Count(&stats.AbnormalCount)
	database.DB.Model(&model.Battery{}).Where("status = ?", model.BatteryStatusOffline).Count(&stats.OfflineCount)
	database.DB.Model(&model.Battery{}).Where("current_soc < 30 AND status IN (?,?)", model.BatteryStatusAvailable, model.BatteryStatusCharging).Count(&stats.LowSocCount)
	database.DB.Model(&model.Battery{}).Where("health_status < 85 AND status != ?", model.BatteryStatusOffline).Count(&stats.LowHealthCount)

	return &stats, nil
}

func GetBatteryStatusHistory(batteryID uint64, page, pageSize int) ([]model.BatteryStatusHistory, int64, error) {
	var list []model.BatteryStatusHistory
	var total int64

	query := database.DB.Model(&model.BatteryStatusHistory{}).Where("battery_id = ?", batteryID)
	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("report_at DESC").Find(&list).Error

	return list, total, err
}

func OfflineBattery(batteryID uint64, reason string) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	err := tx.Model(&model.Battery{}).
		Where("id = ?", batteryID).
		Updates(map[string]interface{}{
			"status":     model.BatteryStatusOffline,
			"cabinet_id": nil,
			"slot_id":    nil,
		}).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	err = tx.Model(&model.CabinetSlot{}).
		Where("battery_id = ?", batteryID).
		Updates(map[string]interface{}{
			"battery_id": nil,
			"status":     model.SlotStatusEmpty,
		}).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	alertNo := fmt.Sprintf("ALT%s", time.Now().Format("20060102150405"))
	content, _ := json.Marshal(map[string]interface{}{
		"battery_id": batteryID,
		"reason":     reason,
	})
	contentStr := string(content)

	battery, _ := GetBatteryByID(batteryID)
	alert := &model.Alert{
		AlertNo:   alertNo,
		Type:      model.AlertTypeBatteryAbnormal,
		Level:     model.AlertLevelImportant,
		BatteryID: &batteryID,
		Title:     "电池下线",
		Content:   &contentStr,
		Status:    model.AlertStatusResolved,
	}
	if battery != nil && battery.CabinetID != nil {
		alert.CabinetID = battery.CabinetID
	}

	err = tx.Create(alert).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func GetBatteriesByCabinet(cabinetID uint64) ([]model.Battery, error) {
	var batteries []model.Battery
	err := database.DB.Where("cabinet_id = ?", cabinetID).Find(&batteries).Error
	return batteries, err
}
