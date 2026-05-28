package service

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"battery-cabinet/internal/pkg/utils"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

const (
	SingleExchangePrice = 9.90
)

func BatteryExchange(req *model.BatteryExchangeReq) (*model.BatteryExchangeResp, error) {
	idempotentRecord, err := utils.CheckIdempotent(req.IdempotentKey, "battery_exchange", req)
	if err != nil {
		return nil, err
	}
	if idempotentRecord != nil && idempotentRecord.Status == utils.IdempotentStatusSuccess {
		var resp model.BatteryExchangeResp
		json.Unmarshal([]byte(idempotentRecord.ResponseData), &resp)
		return &resp, nil
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		utils.SetIdempotentFailed(req.IdempotentKey, tx.Error.Error())
		return nil, tx.Error
	}

	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, fmt.Sprintf("panic: %v", r))
		}
	}()

	var inBattery model.Battery
	err = tx.Set("gorm:query_option", "FOR UPDATE").
		Where("id = ? AND user_id = ? AND status = ?",
			req.InBatteryID, req.UserID, model.BatteryStatusInUse).
		First(&inBattery).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, "归还电池不存在或不属于该用户")
		return nil, errors.New("归还电池不存在或不属于该用户")
	}

	outSlot, outBattery, err := getFullBatterySlotTx(tx, req.CabinetID)
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, "暂无满电电池可用")
		return nil, errors.New("暂无满电电池可用")
	}

	inSlot, err := getAvailableSlotTx(tx, req.CabinetID)
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, "暂无空槽位可用")
		return nil, errors.New("暂无空槽位可用")
	}

	userPkg, err := getAvailableUserPackageTx(tx, req.UserID)
	var packageID *uint64
	payType := model.PayTypeWallet
	payAmount := SingleExchangePrice
	discountAmount := 0.00

	if err == nil && userPkg != nil {
		packageID = &userPkg.ID
		payType = model.PayTypePackage
		payAmount = 0
		discountAmount = SingleExchangePrice

		err = usePackageTimesTx(tx, userPkg.ID)
		if err != nil {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
			return nil, err
		}
	} else {
		wallet, err := getWalletTx(tx, req.UserID)
		if err != nil {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, "钱包不存在")
			return nil, errors.New("钱包不存在")
		}
		if wallet.Balance < SingleExchangePrice {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, "余额不足，请充值或购买套餐")
			return nil, errors.New("余额不足，请充值或购买套餐")
		}

		transNo := utils.GenerateOrderNo("TR")
		remark := "换电消费"
		trans := &model.WalletTransaction{
			TransNo:        transNo,
			UserID:         req.UserID,
			WalletID:       wallet.ID,
			Type:           model.TransTypeConsume,
			Amount:         SingleExchangePrice,
			BalanceBefore:  wallet.Balance,
			BalanceAfter:   wallet.Balance - SingleExchangePrice,
			IdempotentKey:  req.IdempotentKey + "_wallet",
			Remark:         &remark,
		}

		err = tx.Create(trans).Error
		if err != nil {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
			return nil, err
		}

		err = tx.Model(wallet).
			Where("version = ?", wallet.Version).
			Updates(map[string]interface{}{
				"balance":       wallet.Balance - SingleExchangePrice,
				"total_consume": wallet.TotalConsume + SingleExchangePrice,
				"version":       wallet.Version + 1,
			}).Error
		if err != nil {
			tx.Rollback()
			utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
			return nil, err
		}
	}

	now := time.Now()
	outBatterySOC := outBattery.CurrentSOC
	inBatterySOC := inBattery.CurrentSOC

	err = tx.Model(&outBattery).
		Updates(map[string]interface{}{
			"status":     model.BatteryStatusInUse,
			"cabinet_id": nil,
			"slot_id":    nil,
			"user_id":    req.UserID,
			"cycle_count": outBattery.CycleCount + 1,
		}).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	err = tx.Model(outSlot).
		Updates(map[string]interface{}{
			"battery_id": nil,
			"status":     model.SlotStatusEmpty,
		}).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	err = tx.Model(&inBattery).
		Updates(map[string]interface{}{
			"status":     model.BatteryStatusCharging,
			"cabinet_id": req.CabinetID,
			"slot_id":    inSlot.ID,
			"user_id":    nil,
		}).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	err = tx.Model(inSlot).
		Updates(map[string]interface{}{
			"battery_id": inBattery.ID,
			"status":     model.SlotStatusHasBatt,
		}).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	orderNo := utils.GenerateOrderNo("ORD")
	order := &model.Order{
		OrderNo:       orderNo,
		UserID:        req.UserID,
		CabinetID:     req.CabinetID,
		OutBatteryID:  outBattery.ID,
		InBatteryID:   inBattery.ID,
		OutSlotID:     outSlot.ID,
		InSlotID:      inSlot.ID,
		PackageID:     packageID,
		Amount:        SingleExchangePrice,
		DiscountAmount: discountAmount,
		PayAmount:     payAmount,
		PayType:       &payType,
		PayStatus:     model.PayStatusPaid,
		OrderStatus:   model.OrderStatusCompleted,
		OutBatterySOC: &outBatterySOC,
		InBatterySOC:  &inBatterySOC,
		StartTime:     &now,
		FinishTime:    &now,
		IdempotentKey: req.IdempotentKey,
	}

	err = tx.Create(order).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	batteryHistory := &model.BatteryStatusHistory{
		BatteryID:    inBattery.ID,
		CurrentSOC:   inBattery.CurrentSOC,
		HealthStatus: inBattery.HealthStatus,
		Temperature:  inBattery.Temperature,
		Status:       model.BatteryStatusCharging,
		CabinetID:    &req.CabinetID,
		ReportAt:     now,
	}
	err = tx.Create(batteryHistory).Error
	if err != nil {
		tx.Rollback()
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		utils.SetIdempotentFailed(req.IdempotentKey, err.Error())
		return nil, err
	}

	resp := &model.BatteryExchangeResp{
		OrderNo:      orderNo,
		OutBatteryID: outBattery.ID,
		OutSlotID:    outSlot.ID,
		InSlotID:     inSlot.ID,
		Amount:       SingleExchangePrice,
		PayAmount:    payAmount,
		PayType:      payType,
		Status:       model.OrderStatusCompleted,
	}

	utils.SetIdempotentSuccess(req.IdempotentKey, orderNo, resp)

	return resp, nil
}

func getFullBatterySlotTx(tx *gorm.DB, cabinetID uint64) (*model.CabinetSlot, *model.Battery, error) {
	var slot model.CabinetSlot
	var battery model.Battery

	err := tx.Table("cabinet_slot s").
		Select("s.*").
		Joins("JOIN battery b ON s.battery_id = b.id").
		Where("s.cabinet_id = ? AND s.status = ? AND b.current_soc >= 80 AND b.status = ?",
			cabinetID, model.SlotStatusHasBatt, model.BatteryStatusAvailable).
		Set("gorm:query_option", "FOR UPDATE").
		Order("b.current_soc DESC").
		First(&slot).Error
	if err != nil {
		return nil, nil, err
	}

	err = tx.Set("gorm:query_option", "FOR UPDATE").
		Where("id = ?", slot.BatteryID).
		First(&battery).Error
	if err != nil {
		return nil, nil, err
	}

	return &slot, &battery, nil
}

func getAvailableSlotTx(tx *gorm.DB, cabinetID uint64) (*model.CabinetSlot, error) {
	var slot model.CabinetSlot
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("cabinet_id = ? AND status = ? AND lock_status = ?",
			cabinetID, model.SlotStatusEmpty, model.LockStatusLocked).
		Order("slot_no").
		First(&slot).Error
	if err != nil {
		return nil, err
	}
	return &slot, nil
}

func getAvailableUserPackageTx(tx *gorm.DB, userID uint64) (*model.UserPackage, error) {
	now := time.Now()
	var pkg model.UserPackage
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ? AND status = ? AND start_time <= ? AND end_time >= ?",
			userID, model.UserPackageStatusValid, now, now).
		Where("(package_type = ? OR (package_type = ? AND remaining_times > 0))",
			model.PackageTypeDuration, model.PackageTypeTimes).
		Order("package_type DESC, remaining_times DESC").
		First(&pkg).Error
	if err != nil {
		return nil, err
	}
	return &pkg, nil
}

func usePackageTimesTx(tx *gorm.DB, userPkgID uint64) error {
	result := tx.Model(&model.UserPackage{}).
		Where("id = ? AND status = ? AND (package_type = ? OR remaining_times > 0)",
			userPkgID, model.UserPackageStatusValid, model.PackageTypeDuration).
		Updates(map[string]interface{}{
			"used_times":      tx.Raw("used_times + 1"),
			"remaining_times": tx.Raw("CASE WHEN package_type = 1 THEN remaining_times - 1 ELSE remaining_times END"),
			"status": tx.Raw(`CASE 
				WHEN package_type = 1 AND remaining_times <= 1 THEN ? 
				ELSE status 
			END`, model.UserPackageStatusUsedUp),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("套餐已失效或次数不足")
	}
	return nil
}

func getWalletTx(tx *gorm.DB, userID uint64) (*model.Wallet, error) {
	var wallet model.Wallet
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ?", userID).
		First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

func GetDashboardStats() (map[string]interface{}, error) {
	cabinetStats, _ := dao.GetCabinetStats()
	batteryStats, _ := dao.GetBatteryStats()
	orderStats, _ := dao.GetOrderStats()
	alertStats, _ := dao.GetAlertStats()

	return map[string]interface{}{
		"cabinet": cabinetStats,
		"battery": batteryStats,
		"order":   orderStats,
		"alert":   alertStats,
	}, nil
}
