package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"
)

const (
	FullSOCThreshold = 80
	LowSOCThreshold  = 30
	WarningFullCount = 3
)

func GetDispatchTaskList(status *int, page, pageSize int) ([]model.DispatchTaskVO, int64, error) {
	var list []model.DispatchTaskVO
	var total int64

	query := database.DB.Table("dispatch_task t").
		Select("t.*, " +
			"fc.name as from_cabinet_name, fc.cabinet_no as from_cabinet_no, " +
			"tc.name as to_cabinet_name, tc.cabinet_no as to_cabinet_no, tc.address as to_cabinet_addr, " +
			"o.name as operator_name, o.phone as operator_phone").
		Joins("LEFT JOIN cabinet fc ON t.from_cabinet_id = fc.id").
		Joins("LEFT JOIN cabinet tc ON t.to_cabinet_id = tc.id").
		Joins("LEFT JOIN operator o ON t.operator_id = o.id")

	if status != nil {
		query = query.Where("t.status = ?", *status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).
		Order("t.priority ASC, t.created_at DESC").
		Scan(&list).Error

	return list, total, err
}

func GetDispatchTaskByID(id uint64) (*model.DispatchTaskVO, error) {
	var vo model.DispatchTaskVO
	err := database.DB.Table("dispatch_task t").
		Select("t.*, " +
			"fc.name as from_cabinet_name, fc.cabinet_no as from_cabinet_no, " +
			"tc.name as to_cabinet_name, tc.cabinet_no as to_cabinet_no, tc.address as to_cabinet_addr, " +
			"o.name as operator_name, o.phone as operator_phone").
		Joins("LEFT JOIN cabinet fc ON t.from_cabinet_id = fc.id").
		Joins("LEFT JOIN cabinet tc ON t.to_cabinet_id = tc.id").
		Joins("LEFT JOIN operator o ON t.operator_id = o.id").
		Where("t.id = ?", id).
		Scan(&vo).Error
	if err != nil {
		return nil, err
	}
	if vo.ID == 0 {
		return nil, nil
	}
	return &vo, nil
}

func CreateDispatchTask(req *model.DispatchTaskCreateReq) (*model.DispatchTask, error) {
	taskNo := fmt.Sprintf("TASK%s", time.Now().Format("20060102150405"))

	var batteryIDsStr *string
	if len(req.BatteryIDs) > 0 {
		jsonBytes, _ := json.Marshal(req.BatteryIDs)
		str := string(jsonBytes)
		batteryIDsStr = &str
	}

	task := &model.DispatchTask{
		TaskNo:        taskNo,
		Type:          req.Type,
		Priority:      req.Priority,
		FromCabinetID: req.FromCabinetID,
		ToCabinetID:   req.ToCabinetID,
		BatteryCount:  req.BatteryCount,
		BatteryIDs:    batteryIDsStr,
		Status:        model.TaskStatusPendingAssign,
	}
	if req.GapReason != "" {
		task.GapReason = &req.GapReason
	}
	if req.Remark != "" {
		task.Remark = &req.Remark
	}

	err := database.DB.Create(task).Error
	return task, err
}

func AssignDispatchTask(req *model.DispatchTaskAssignReq) error {
	updates := map[string]interface{}{
		"operator_id": req.OperatorID,
		"status":      model.TaskStatusPendingExec,
	}
	if req.EstimateArriveTime != nil {
		updates["estimate_arrive_time"] = req.EstimateArriveTime
	}

	result := database.DB.Model(&model.DispatchTask{}).
		Where("id = ? AND status IN (?, ?)", req.TaskID, model.TaskStatusPendingAssign, model.TaskStatusPendingExec).
		Updates(updates)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("task not found or cannot be assigned")
	}
	return nil
}

func StartDispatchTask(taskID uint64) error {
	now := time.Now()
	result := database.DB.Model(&model.DispatchTask{}).
		Where("id = ? AND status = ?", taskID, model.TaskStatusPendingExec).
		Updates(map[string]interface{}{
			"status":            model.TaskStatusExecuting,
			"actual_start_time": now,
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("task not found or cannot be started")
	}
	return nil
}

func CompleteDispatchTask(taskID uint64, batteryIDs []uint64) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}

	var task model.DispatchTask
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("id = ? AND status = ?", taskID, model.TaskStatusExecuting).
		First(&task).Error
	if err != nil {
		tx.Rollback()
		return errors.New("task not found or not executing")
	}

	if len(batteryIDs) != task.BatteryCount {
		tx.Rollback()
		return errors.New("battery count mismatch")
	}

	batteryIDsStr, _ := json.Marshal(batteryIDs)
	str := string(batteryIDsStr)

	now := time.Now()
	err = tx.Model(&task).
		Updates(map[string]interface{}{
			"status":             model.TaskStatusCompleted,
			"battery_ids":        str,
			"actual_finish_time": now,
		}).Error
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, batteryID := range batteryIDs {
		var battery model.Battery
		err = tx.Set("gorm:query_option", "FOR UPDATE").
			Where("id = ?", batteryID).
			First(&battery).Error
		if err != nil {
			tx.Rollback()
			return err
		}

		var slot model.CabinetSlot
		err = tx.Set("gorm:query_option", "FOR UPDATE").
			Where("cabinet_id = ? AND status = ?", task.ToCabinetID, model.SlotStatusEmpty).
			Order("slot_no").
			First(&slot).Error
		if err != nil {
			tx.Rollback()
			return errors.New("no empty slot available")
		}

		err = tx.Model(&battery).
			Updates(map[string]interface{}{
				"cabinet_id": task.ToCabinetID,
				"slot_id":    slot.ID,
				"status":     model.BatteryStatusAvailable,
				"user_id":    nil,
			}).Error
		if err != nil {
			tx.Rollback()
			return err
		}

		err = tx.Model(&slot).
			Updates(map[string]interface{}{
				"battery_id": batteryID,
				"status":     model.SlotStatusHasBatt,
			}).Error
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func CalculateGaps() ([]model.DispatchGapVO, error) {
	var gaps []model.DispatchGapVO

	err := database.DB.Table("cabinet c").
		Select(`c.id as cabinet_id, c.name as cabinet_name, c.cabinet_no, c.address, 
				c.longitude, c.latitude,
				COUNT(DISTINCT CASE WHEN b.current_soc >= ? AND b.status = ? THEN b.id END) as full_battery_count,
				COUNT(DISTINCT CASE WHEN s.status = ? THEN s.id END) as empty_slot_count`,
			FullSOCThreshold, model.BatteryStatusAvailable, model.SlotStatusEmpty).
		Joins("LEFT JOIN cabinet_slot s ON c.id = s.cabinet_id").
		Joins("LEFT JOIN battery b ON c.id = b.cabinet_id").
		Where("c.status = ?", model.CabinetStatusNormal).
		Group("c.id").
		Having("full_battery_count < ?", WarningFullCount).
		Scan(&gaps).Error
	if err != nil {
		return nil, err
	}

	for i := range gaps {
		needCount := WarningFullCount - gaps[i].FullBatteryCount
		if needCount > gaps[i].EmptySlotCount {
			needCount = gaps[i].EmptySlotCount
		}
		gaps[i].NeedCount = needCount

		if gaps[i].FullBatteryCount == 0 {
			gaps[i].GapLevel = 1
		} else if gaps[i].FullBatteryCount == 1 {
			gaps[i].GapLevel = 2
		} else {
			gaps[i].GapLevel = 3
		}
	}

	return gaps, nil
}

func CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadius = 6371.0

	lat1Rad := lat1 * math.Pi / 180
	lng1Rad := lng1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lng2Rad := lng2 * math.Pi / 180

	dLat := lat2Rad - lat1Rad
	dLng := lng2Rad - lng1Rad

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}

func GenerateDispatchPlan(req *model.DispatchPlanReq) ([]model.DispatchGapVO, error) {
	gaps, err := CalculateGaps()
	if err != nil {
		return nil, err
	}

	for i := range gaps {
		gaps[i].Distance = CalculateDistance(
			req.OperatorLatitude, req.OperatorLongitude,
			gaps[i].Latitude, gaps[i].Longitude,
		)
	}

	for i := 0; i < len(gaps); i++ {
		for j := i + 1; j < len(gaps); j++ {
			if gaps[i].GapLevel > gaps[j].GapLevel ||
				(gaps[i].GapLevel == gaps[j].GapLevel && gaps[i].Distance > gaps[j].Distance) {
				gaps[i], gaps[j] = gaps[j], gaps[i]
			}
		}
	}

	totalBatteries := 0
	var plan []model.DispatchGapVO
	for _, gap := range gaps {
		if totalBatteries+gap.NeedCount <= req.MaxBatteries {
			plan = append(plan, gap)
			totalBatteries += gap.NeedCount
		}
	}

	return plan, nil
}

func AutoCreateDispatchTasks() error {
	gaps, err := CalculateGaps()
	if err != nil {
		return err
	}

	for _, gap := range gaps {
		if gap.NeedCount <= 0 {
			continue
		}

		var existingTask int64
		database.DB.Model(&model.DispatchTask{}).
			Where("to_cabinet_id = ? AND status IN (?, ?, ?)",
				gap.CabinetID,
				model.TaskStatusPendingAssign,
				model.TaskStatusPendingExec,
				model.TaskStatusExecuting).
			Count(&existingTask)

		if existingTask > 0 {
			continue
		}

		priority := gap.GapLevel
		createReq := &model.DispatchTaskCreateReq{
			Type:         model.TaskTypeSupply,
			Priority:     priority,
			ToCabinetID:  gap.CabinetID,
			BatteryCount: gap.NeedCount,
			GapReason:    fmt.Sprintf("满电电池仅剩%d块，需补充", gap.FullBatteryCount),
		}

		_, err = CreateDispatchTask(createReq)
		if err != nil {
			return err
		}

		alertNo := fmt.Sprintf("ALT%s", time.Now().Format("20060102150405"))
		alert := &model.Alert{
			AlertNo:   alertNo,
			Type:      model.AlertTypeLowBattery,
			Level:     gap.GapLevel,
			CabinetID: &gap.CabinetID,
			Title:     "换电柜电量缺口",
			Content:   &createReq.GapReason,
			Status:    model.AlertStatusProcessing,
		}
		database.DB.Create(alert)
	}

	return nil
}

func GetOperatorList() ([]model.Operator, error) {
	var list []model.Operator
	err := database.DB.Where("status = ?", model.OperatorStatusOnDuty).Find(&list).Error
	return list, err
}
