package service

import (
	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"errors"
	"strconv"
	"time"

	"gorm.io/gorm"
)

type ExpiryAlertQueryParams struct {
	WarehouseID *uint64 `json:"warehouse_id"`
	MaterialID  *uint64 `json:"material_id"`
	AlertLevel  *string `json:"alert_level"`
	Status      *int8   `json:"status"`
	Page        int     `json:"page"`
	PageSize    int     `json:"page_size"`
}

type ExpiryAlertListResponse struct {
	Total int64              `json:"total"`
	List  []models.ExpiryAlert `json:"list"`
	Page  int                `json:"page"`
	Size  int                `json:"size"`
}

type HandleExpiryAlertParams struct {
	ID           uint64  `json:"id"`
	HandledBy    uint64  `json:"handled_by"`
	HandleRemark *string `json:"handle_remark"`
}

type ExpiryConfig struct {
	YellowDays int
	OrangeDays int
	RedDays    int
}

func getExpiryConfig(tx *gorm.DB) (*ExpiryConfig, error) {
	var configs []models.SystemConfig
	err := tx.Where("config_group = ?", "expiry").Find(&configs).Error
	if err != nil {
		return nil, err
	}

	config := &ExpiryConfig{
		YellowDays: 30,
		OrangeDays: 15,
		RedDays:    7,
	}

	for _, c := range configs {
		if c.ConfigValue == nil {
			continue
		}
		switch c.ConfigKey {
		case "expiry_warning_yellow":
			if days, err := strconv.Atoi(*c.ConfigValue); err == nil {
				config.YellowDays = days
			}
		case "expiry_warning_orange":
			if days, err := strconv.Atoi(*c.ConfigValue); err == nil {
				config.OrangeDays = days
			}
		case "expiry_warning_red":
			if days, err := strconv.Atoi(*c.ConfigValue); err == nil {
				config.RedDays = days
			}
		}
	}

	return config, nil
}

func calculateAlertLevel(remainingDays int, config *ExpiryConfig) (string, bool) {
	if remainingDays <= config.RedDays {
		return "red", true
	}
	if remainingDays <= config.OrangeDays {
		return "orange", true
	}
	if remainingDays <= config.YellowDays {
		return "yellow", true
	}
	return "none", false
}

func UpdateInventoryWarningLevel(tx *gorm.DB, inventory *models.Inventory) error {
	if inventory.ExpiryDate == nil {
		inventory.ExpiryWarningLevel = "none"
		return tx.Model(inventory).Update("expiry_warning_level", "none").Error
	}

	config, err := getExpiryConfig(tx)
	if err != nil {
		return err
	}

	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	expiryDate := time.Date(inventory.ExpiryDate.Year(), inventory.ExpiryDate.Month(), inventory.ExpiryDate.Day(), 0, 0, 0, 0, inventory.ExpiryDate.Location())
	remainingDays := int(expiryDate.Sub(today).Hours() / 24)

	alertLevel, _ := calculateAlertLevel(remainingDays, config)
	inventory.ExpiryWarningLevel = alertLevel

	return tx.Model(inventory).Update("expiry_warning_level", alertLevel).Error
}

func CheckExpiry() (int, error) {
	config, err := getExpiryConfig(database.DB)
	if err != nil {
		return 0, err
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	maxDays := config.YellowDays
	cutoffDate := time.Now().AddDate(0, 0, maxDays)

	var inventories []models.Inventory
	err = tx.Where("expiry_date IS NOT NULL AND expiry_date <= ? AND status = 1", cutoffDate).
		Preload("Warehouse").
		Preload("Material").
		Find(&inventories).Error
	if err != nil {
		tx.Rollback()
		return 0, err
	}

	alertCount := 0
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	for _, inventory := range inventories {
		if inventory.Quantity <= 0 {
			continue
		}

		expiryDate := time.Date(inventory.ExpiryDate.Year(), inventory.ExpiryDate.Month(), inventory.ExpiryDate.Day(), 0, 0, 0, 0, inventory.ExpiryDate.Location())
		remainingDays := int(expiryDate.Sub(today).Hours() / 24)

		alertLevel, shouldAlert := calculateAlertLevel(remainingDays, config)
		if !shouldAlert {
			continue
		}

		inventory.ExpiryWarningLevel = alertLevel
		if err = tx.Model(&inventory).Update("expiry_warning_level", alertLevel).Error; err != nil {
			tx.Rollback()
			return 0, err
		}

		var existingAlert models.ExpiryAlert
		err = tx.Where("inventory_id = ? AND status = 0", inventory.ID).First(&existingAlert).Error
		if err == nil {
			existingAlert.AlertLevel = alertLevel
			remainingDaysInt := remainingDays
			existingAlert.RemainingDays = &remainingDaysInt
			existingAlert.Quantity = inventory.Quantity
			if err = tx.Save(&existingAlert).Error; err != nil {
				tx.Rollback()
				return 0, err
			}
			alertCount++
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			tx.Rollback()
			return 0, err
		}

		remainingDaysInt := remainingDays
		alert := models.ExpiryAlert{
			InventoryID:   inventory.ID,
			WarehouseID:   inventory.WarehouseID,
			MaterialID:    inventory.MaterialID,
			BatchNo:       inventory.BatchNo,
			ExpiryDate:    inventory.ExpiryDate,
			RemainingDays: &remainingDaysInt,
			AlertLevel:    alertLevel,
			Quantity:      inventory.Quantity,
			Status:        0,
		}
		if err = tx.Create(&alert).Error; err != nil {
			tx.Rollback()
			return 0, err
		}
		alertCount++
	}

	if err = tx.Commit().Error; err != nil {
		return 0, err
	}

	return alertCount, nil
}

func GetExpiryAlertList(params *ExpiryAlertQueryParams) (*ExpiryAlertListResponse, error) {
	db := database.DB.Model(&models.ExpiryAlert{})

	if params.WarehouseID != nil {
		db = db.Where("warehouse_id = ?", *params.WarehouseID)
	}
	if params.MaterialID != nil {
		db = db.Where("material_id = ?", *params.MaterialID)
	}
	if params.AlertLevel != nil && *params.AlertLevel != "" {
		db = db.Where("alert_level = ?", *params.AlertLevel)
	}
	if params.Status != nil {
		db = db.Where("status = ?", *params.Status)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := params.Page
	if page <= 0 {
		page = 1
	}
	pageSize := params.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.ExpiryAlert
	err := db.Preload("Inventory").
		Preload("Warehouse").
		Preload("Material").
		Preload("Handler").
		Offset(offset).
		Limit(pageSize).
		Order("alert_level = 'red' DESC, alert_level = 'orange' DESC, alert_level = 'yellow' DESC, created_at DESC").
		Find(&list).Error
	if err != nil {
		return nil, err
	}

	return &ExpiryAlertListResponse{
		Total: total,
		List:  list,
		Page:  page,
		Size:  pageSize,
	}, nil
}

func HandleExpiryAlert(params *HandleExpiryAlertParams) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var alert models.ExpiryAlert
	err := tx.Where("id = ?", params.ID).First(&alert).Error
	if err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("expiry alert not found")
		}
		return err
	}

	if alert.Status == 1 {
		tx.Rollback()
		return errors.New("alert already handled")
	}

	now := time.Now()
	alert.Status = 1
	alert.HandledBy = &params.HandledBy
	alert.HandledAt = &now
	alert.HandleRemark = params.HandleRemark

	if err = tx.Save(&alert).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err = tx.Commit().Error; err != nil {
		return err
	}

	return nil
}
