package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"time"
)

func GetCabinetList(req *model.CabinetListReq) ([]model.CabinetVO, int64, error) {
	var list []model.CabinetVO
	var total int64

	query := database.DB.Table("cabinet c").
		Select("c.*, " +
			"COUNT(DISTINCT CASE WHEN s.status = 1 THEN s.id END) as empty_slots, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc >= 80 AND b.status = 1 THEN b.id END) as full_batteries, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc < 30 AND b.status = 1 THEN b.id END) as low_batteries").
		Joins("LEFT JOIN cabinet_slot s ON c.id = s.cabinet_id").
		Joins("LEFT JOIN battery b ON c.id = b.cabinet_id").
		Group("c.id")

	if req.Keyword != "" {
		query = query.Where("c.name LIKE ? OR c.address LIKE ? OR c.cabinet_no LIKE ?",
			"%"+req.Keyword+"%", "%"+req.Keyword+"%", "%"+req.Keyword+"%")
	}
	if req.Status != nil {
		query = query.Where("c.status = ?", *req.Status)
	}

	query.Count(&total)

	offset := (req.Page - 1) * req.PageSize
	err := query.Offset(offset).Limit(req.PageSize).Order("c.id DESC").Scan(&list).Error

	return list, total, err
}

func GetCabinetByID(id uint64) (*model.CabinetVO, error) {
	var vo model.CabinetVO
	err := database.DB.Table("cabinet c").
		Select("c.*, " +
			"COUNT(DISTINCT CASE WHEN s.status = 1 THEN s.id END) as empty_slots, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc >= 80 AND b.status = 1 THEN b.id END) as full_batteries, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc < 30 AND b.status = 1 THEN b.id END) as low_batteries").
		Joins("LEFT JOIN cabinet_slot s ON c.id = s.cabinet_id").
		Joins("LEFT JOIN battery b ON c.id = b.cabinet_id").
		Where("c.id = ?", id).
		Group("c.id").
		Scan(&vo).Error
	if err != nil {
		return nil, err
	}
	if vo.ID == 0 {
		return nil, nil
	}
	return &vo, nil
}

func GetCabinetSlots(cabinetID uint64) ([]model.CabinetSlot, error) {
	var slots []model.CabinetSlot
	err := database.DB.Where("cabinet_id = ?", cabinetID).Order("slot_no").Find(&slots).Error
	return slots, err
}

func GetSlotByID(id uint64) (*model.CabinetSlot, error) {
	var slot model.CabinetSlot
	err := database.DB.Where("id = ?", id).First(&slot).Error
	if err != nil {
		return nil, err
	}
	return &slot, nil
}

func GetAvailableSlot(cabinetID uint64) (*model.CabinetSlot, error) {
	var slot model.CabinetSlot
	err := database.DB.Where("cabinet_id = ? AND status = ? AND lock_status = ?",
		cabinetID, model.SlotStatusEmpty, model.LockStatusLocked).
		Order("slot_no").First(&slot).Error
	if err != nil {
		return nil, err
	}
	return &slot, nil
}

func GetFullBatterySlot(cabinetID uint64) (*model.CabinetSlot, *model.Battery, error) {
	var slot model.CabinetSlot
	var battery model.Battery

	err := database.DB.Table("cabinet_slot s").
		Select("s.*, b.*").
		Joins("JOIN battery b ON s.battery_id = b.id").
		Where("s.cabinet_id = ? AND s.status = ? AND b.current_soc >= 80 AND b.status = ?",
			cabinetID, model.SlotStatusHasBatt, model.BatteryStatusAvailable).
		Order("b.current_soc DESC").
		First(&slot).Error
	if err != nil {
		return nil, nil, err
	}

	err = database.DB.Where("id = ?", slot.BatteryID).First(&battery).Error
	if err != nil {
		return nil, nil, err
	}

	return &slot, &battery, nil
}

func UpdateSlot(slot *model.CabinetSlot) error {
	return database.DB.Save(slot).Error
}

func UpdateCabinetHeartbeat(cabinetID uint64) error {
	now := time.Now()
	return database.DB.Model(&model.Cabinet{}).
		Where("id = ?", cabinetID).
		Update("last_heartbeat_at", now).Error
}

func CreateCabinet(cabinet *model.Cabinet) error {
	return database.DB.Create(cabinet).Error
}

func UpdateCabinet(id uint64, updates map[string]interface{}) error {
	return database.DB.Model(&model.Cabinet{}).Where("id = ?", id).Updates(updates).Error
}

func GetAllCabinets() ([]model.CabinetVO, error) {
	var list []model.CabinetVO
	err := database.DB.Table("cabinet c").
		Select("c.*, " +
			"COUNT(DISTINCT CASE WHEN s.status = 1 THEN s.id END) as empty_slots, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc >= 80 AND b.status = 1 THEN b.id END) as full_batteries, " +
			"COUNT(DISTINCT CASE WHEN b.current_soc < 30 AND b.status = 1 THEN b.id END) as low_batteries").
		Joins("LEFT JOIN cabinet_slot s ON c.id = s.cabinet_id").
		Joins("LEFT JOIN battery b ON c.id = b.cabinet_id").
		Where("c.status = ?", model.CabinetStatusNormal).
		Group("c.id").
		Scan(&list).Error
	return list, err
}

func GetCabinetStats() (map[string]interface{}, error) {
	var total, normal, maintain, offline int64
	database.DB.Model(&model.Cabinet{}).Count(&total)
	database.DB.Model(&model.Cabinet{}).Where("status = ?", model.CabinetStatusNormal).Count(&normal)
	database.DB.Model(&model.Cabinet{}).Where("status = ?", model.CabinetStatusMaintain).Count(&maintain)
	database.DB.Model(&model.Cabinet{}).Where("status = ?", model.CabinetStatusOffline).Count(&offline)

	return map[string]interface{}{
		"total":     total,
		"normal":    normal,
		"maintain":  maintain,
		"offline":   offline,
	}, nil
}
