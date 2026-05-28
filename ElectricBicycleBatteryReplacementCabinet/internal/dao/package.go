package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

func GetPackageList() ([]model.Package, error) {
	var list []model.Package
	err := database.DB.Where("status = ?", model.PackageStatusOn).
		Order("sort ASC, id ASC").
		Find(&list).Error
	return list, err
}

func GetAllPackages() ([]model.Package, int64, error) {
	var list []model.Package
	var total int64
	database.DB.Model(&model.Package{}).Count(&total)
	err := database.DB.Order("sort ASC, id ASC").Find(&list).Error
	return list, total, err
}

func GetPackageByID(id uint64) (*model.Package, error) {
	var pkg model.Package
	err := database.DB.Where("id = ?", id).First(&pkg).Error
	if err != nil {
		return nil, err
	}
	return &pkg, nil
}

func GetUserPackageList(userID uint64) ([]model.UserPackage, error) {
	var list []model.UserPackage
	err := database.DB.Where("user_id = ? AND status = ?", userID, model.UserPackageStatusValid).
		Order("id DESC").
		Find(&list).Error
	return list, err
}

func GetAvailableUserPackage(userID uint64) (*model.UserPackage, error) {
	now := time.Now()
	var pkg model.UserPackage
	err := database.DB.Where("user_id = ? AND status = ? AND start_time <= ? AND end_time >= ?",
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

func PurchasePackage(req *model.PackagePurchaseReq) (*model.PackagePurchaseResp, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	pkg, err := GetPackageByID(req.PackageID)
	if err != nil || pkg.Status != model.PackageStatusOn {
		tx.Rollback()
		return nil, errors.New("package not available")
	}

	wallet, err := GetOrCreateWallet(req.UserID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if wallet.Balance < pkg.Price {
		tx.Rollback()
		return nil, errors.New("insufficient balance")
	}

	idempotentKey := fmt.Sprintf("purchase_%d_%d_%d", req.UserID, req.PackageID, time.Now().Unix())

	consumeReq := &model.WalletConsumeReq{
		UserID:         req.UserID,
		Amount:         pkg.Price,
		RelatedOrderNo: "PKG" + time.Now().Format("20060102150405"),
		Remark:         "购买套餐:" + pkg.Name,
		IdempotentKey:  idempotentKey,
	}
	_, err = ConsumeWalletTx(tx, consumeReq)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	now := time.Now()
	startTime := now
	var endTime time.Time
	var remainingTimes *int

	if pkg.DurationDays != nil {
		endTime = now.AddDate(0, 0, *pkg.DurationDays)
	}
	if pkg.TotalTimes != nil {
		rt := *pkg.TotalTimes
		remainingTimes = &rt
		endTime = now.AddDate(0, 0, 90)
		if pkg.DurationDays != nil {
			endTime = now.AddDate(0, 0, *pkg.DurationDays)
		}
	}

	userPkg := &model.UserPackage{
		UserID:         req.UserID,
		PackageID:      req.PackageID,
		PackageName:    pkg.Name,
		PackageType:    pkg.Type,
		TotalTimes:     pkg.TotalTimes,
		RemainingTimes: remainingTimes,
		StartTime:      startTime,
		EndTime:        endTime,
		OrderNo:        consumeReq.RelatedOrderNo,
		PayAmount:      pkg.Price,
		Status:         model.UserPackageStatusValid,
	}

	err = tx.Create(userPkg).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		return nil, err
	}

	return &model.PackagePurchaseResp{
		OrderNo:        userPkg.OrderNo,
		UserPackageID:  userPkg.ID,
		PackageName:    pkg.Name,
		PayAmount:      pkg.Price,
		StartTime:      startTime,
		EndTime:        endTime,
		RemainingTimes: remainingTimes,
	}, nil
}

func ConsumeWalletTx(tx *gorm.DB, req *model.WalletConsumeReq) (*model.WalletTransaction, error) {
	var existingTrans model.WalletTransaction
	err := tx.Where("idempotent_key = ?", req.IdempotentKey).First(&existingTrans).Error
	if err == nil {
		return &existingTrans, nil
	}

	var wallet model.Wallet
	err = tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ?", req.UserID).
		First(&wallet).Error
	if err != nil {
		return nil, errors.New("wallet not found")
	}

	if wallet.Balance < req.Amount {
		return nil, errors.New("insufficient balance")
	}

	balanceBefore := wallet.Balance
	balanceAfter := wallet.Balance - req.Amount

	result := tx.Model(&wallet).
		Where("version = ?", wallet.Version).
		Updates(map[string]interface{}{
			"balance":       balanceAfter,
			"total_consume": wallet.TotalConsume + req.Amount,
			"version":       wallet.Version + 1,
		})
	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		return nil, errors.New("concurrent update conflict")
	}

	transNo := fmt.Sprintf("TR%s", time.Now().Format("20060102150405"))
	remark := req.Remark
	trans := &model.WalletTransaction{
		TransNo:        transNo,
		UserID:         req.UserID,
		WalletID:       wallet.ID,
		Type:           model.TransTypeConsume,
		Amount:         req.Amount,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		RelatedOrderNo: &req.RelatedOrderNo,
		IdempotentKey:  req.IdempotentKey,
		Remark:         &remark,
	}

	err = tx.Create(trans).Error
	if err != nil {
		return nil, err
	}

	return trans, nil
}

func UsePackageTimes(userPkgID uint64) error {
	result := database.DB.Model(&model.UserPackage{}).
		Where("id = ? AND status = ? AND (package_type = ? OR remaining_times > 0)",
			userPkgID, model.UserPackageStatusValid, model.PackageTypeDuration).
		Updates(map[string]interface{}{
			"used_times":      database.DB.Raw("used_times + 1"),
			"remaining_times": database.DB.Raw("CASE WHEN package_type = 1 THEN remaining_times - 1 ELSE remaining_times END"),
			"status": database.DB.Raw(`CASE 
				WHEN package_type = 1 AND remaining_times <= 1 THEN ? 
				ELSE status 
			END`, model.UserPackageStatusUsedUp),
		})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("package not available")
	}
	return nil
}
