package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"errors"
	"fmt"
	"time"
)

func GetAlertList(req *model.AlertListReq) ([]model.AlertVO, int64, error) {
	var list []model.AlertVO
	var total int64

	query := database.DB.Table("alert a").
		Select("a.*, " +
			"c.name as cabinet_name, c.cabinet_no, " +
			"b.battery_no, " +
			"ad.real_name as handler_name").
		Joins("LEFT JOIN cabinet c ON a.cabinet_id = c.id").
		Joins("LEFT JOIN battery b ON a.battery_id = b.id").
		Joins("LEFT JOIN admin ad ON a.handler_id = ad.id")

	if req.Type != nil {
		query = query.Where("a.type = ?", *req.Type)
	}
	if req.Level != nil {
		query = query.Where("a.level = ?", *req.Level)
	}
	if req.Status != nil {
		query = query.Where("a.status = ?", *req.Status)
	}
	if req.CabinetID != nil {
		query = query.Where("a.cabinet_id = ?", *req.CabinetID)
	}
	if req.BatteryID != nil {
		query = query.Where("a.battery_id = ?", *req.BatteryID)
	}
	if req.StartTime != nil {
		query = query.Where("a.created_at >= ?", *req.StartTime)
	}
	if req.EndTime != nil {
		query = query.Where("a.created_at <= ?", *req.EndTime)
	}

	query.Count(&total)

	offset := (req.Page - 1) * req.PageSize
	err := query.Offset(offset).Limit(req.PageSize).
		Order("a.level ASC, a.created_at DESC").
		Scan(&list).Error

	return list, total, err
}

func GetAlertByID(id uint64) (*model.AlertVO, error) {
	var vo model.AlertVO
	err := database.DB.Table("alert a").
		Select("a.*, " +
			"c.name as cabinet_name, c.cabinet_no, " +
			"b.battery_no, " +
			"ad.real_name as handler_name").
		Joins("LEFT JOIN cabinet c ON a.cabinet_id = c.id").
		Joins("LEFT JOIN battery b ON a.battery_id = b.id").
		Joins("LEFT JOIN admin ad ON a.handler_id = ad.id").
		Where("a.id = ?", id).
		Scan(&vo).Error
	if err != nil {
		return nil, err
	}
	if vo.ID == 0 {
		return nil, nil
	}
	return &vo, nil
}

func CreateAlert(req *model.AlertCreateReq) (*model.Alert, error) {
	alertNo := fmt.Sprintf("ALT%s", time.Now().Format("20060102150405"))

	alert := &model.Alert{
		AlertNo:   alertNo,
		Type:      req.Type,
		Level:     req.Level,
		CabinetID: req.CabinetID,
		BatteryID: req.BatteryID,
		SlotID:    req.SlotID,
		Title:     req.Title,
		Status:    model.AlertStatusPending,
	}
	if req.Content != "" {
		alert.Content = &req.Content
	}

	err := database.DB.Create(alert).Error
	return alert, err
}

func HandleAlert(req *model.AlertHandleReq) error {
	now := time.Now()
	result := database.DB.Model(&model.Alert{}).
		Where("id = ? AND status IN (?, ?)", req.AlertID, model.AlertStatusPending, model.AlertStatusProcessing).
		Updates(map[string]interface{}{
			"status":        req.Status,
			"handler_id":    req.HandlerID,
			"handle_time":   now,
			"handle_result": req.HandleResult,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("alert not found or already handled")
	}
	return nil
}

func GetAlertStats() (*model.AlertStatsVO, error) {
	var stats model.AlertStatsVO
	today := time.Now().Format("2006-01-02")

	database.DB.Model(&model.Alert{}).Count(&stats.TotalCount)
	database.DB.Model(&model.Alert{}).Where("status = ?", model.AlertStatusPending).Count(&stats.PendingCount)
	database.DB.Model(&model.Alert{}).Where("status = ?", model.AlertStatusProcessing).Count(&stats.ProcessingCount)
	database.DB.Model(&model.Alert{}).Where("status = ?", model.AlertStatusResolved).Count(&stats.ResolvedCount)
	database.DB.Model(&model.Alert{}).Where("level = ?", model.AlertLevelUrgent).Count(&stats.UrgentCount)
	database.DB.Model(&model.Alert{}).Where("level = ?", model.AlertLevelImportant).Count(&stats.ImportantCount)
	database.DB.Model(&model.Alert{}).Where("DATE(created_at) = ?", today).Count(&stats.TodayCount)

	return &stats, nil
}

func CheckAndCreateBatteryAlerts() (int, error) {
	var batteries []model.Battery
	err := database.DB.Where("status != ? AND (health_status < ? OR current_soc < ? OR temperature > ?)",
		model.BatteryStatusOffline, 85, 20, 55).
		Find(&batteries).Error
	if err != nil {
		return 0, err
	}

	count := 0
	for _, battery := range batteries {
		var existing int64
		database.DB.Model(&model.Alert{}).
			Where("battery_id = ? AND status IN (?, ?)",
				battery.ID, model.AlertStatusPending, model.AlertStatusProcessing).
			Count(&existing)
		if existing > 0 {
			continue
		}

		alertReq := &model.AlertCreateReq{
			Type:      model.AlertTypeBatteryAbnormal,
			Level:     model.AlertLevelImportant,
			BatteryID: &battery.ID,
		}

		if battery.CabinetID != nil {
			alertReq.CabinetID = battery.CabinetID
		}

		switch {
		case battery.HealthStatus < 85:
			alertReq.Title = fmt.Sprintf("电池健康度低: %d%%", battery.HealthStatus)
			alertReq.Content = fmt.Sprintf("电池%s健康度%d%%，已低于阈值，请及时处理", battery.BatteryNo, battery.HealthStatus)
		case battery.CurrentSOC < 20:
			alertReq.Type = model.AlertTypeLowBattery
			alertReq.Title = fmt.Sprintf("电池电量低: %d%%", battery.CurrentSOC)
			alertReq.Content = fmt.Sprintf("电池%s电量%d%%，电量过低", battery.BatteryNo, battery.CurrentSOC)
		case battery.Temperature != nil && *battery.Temperature > 55:
			alertReq.Type = model.AlertTypeTemperature
			alertReq.Level = model.AlertLevelUrgent
			alertReq.Title = fmt.Sprintf("电池温度过高: %.1f℃", *battery.Temperature)
			alertReq.Content = fmt.Sprintf("电池%s温度%.1f℃，已超过安全阈值", battery.BatteryNo, *battery.Temperature)
		}

		_, err = CreateAlert(alertReq)
		if err != nil {
			return count, err
		}
		count++
	}

	return count, nil
}
