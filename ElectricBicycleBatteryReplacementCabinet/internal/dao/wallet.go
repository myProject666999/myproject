package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"errors"
	"fmt"
)

func GetWalletByUserID(userID uint64) (*model.Wallet, error) {
	var wallet model.Wallet
	err := database.DB.Where("user_id = ?", userID).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

func CreateWallet(userID uint64) (*model.Wallet, error) {
	wallet := &model.Wallet{
		UserID:  userID,
		Balance: 0,
		Version: 0,
	}
	err := database.DB.Create(wallet).Error
	return wallet, err
}

func GetOrCreateWallet(userID uint64) (*model.Wallet, error) {
	wallet, err := GetWalletByUserID(userID)
	if err != nil {
		return CreateWallet(userID)
	}
	return wallet, nil
}

func RechargeWallet(req *model.WalletRechargeReq, idempotentKey string) (*model.WalletRechargeResp, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	var wallet model.Wallet
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ?", req.UserID).
		FirstOrCreate(&wallet, model.Wallet{UserID: req.UserID, Balance: 0}).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	var existingTrans model.WalletTransaction
	err = tx.Where("idempotent_key = ?", idempotentKey).First(&existingTrans).Error
	if err == nil {
		tx.Rollback()
		return &model.WalletRechargeResp{
			TransNo:       existingTrans.TransNo,
			Amount:        existingTrans.Amount,
			BalanceBefore: existingTrans.BalanceBefore,
			BalanceAfter:  existingTrans.BalanceAfter,
		}, nil
	}

	balanceBefore := wallet.Balance
	balanceAfter := wallet.Balance + req.Amount

	err = tx.Model(&wallet).
		Where("version = ?", wallet.Version).
		Updates(map[string]interface{}{
			"balance":        balanceAfter,
			"total_recharge": wallet.TotalRecharge + req.Amount,
			"version":        wallet.Version + 1,
		}).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	transNo := fmt.Sprintf("TR%s", database.DB.NowFunc().Format("20060102150405"))
	trans := &model.WalletTransaction{
		TransNo:        transNo,
		UserID:         req.UserID,
		WalletID:       wallet.ID,
		Type:           model.TransTypeRecharge,
		Amount:         req.Amount,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		IdempotentKey:  idempotentKey,
	}

	err = tx.Create(trans).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		return nil, err
	}

	return &model.WalletRechargeResp{
		TransNo:       transNo,
		Amount:        req.Amount,
		BalanceBefore: balanceBefore,
		BalanceAfter:  balanceAfter,
	}, nil
}

func ConsumeWallet(req *model.WalletConsumeReq) (*model.WalletTransaction, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	var existingTrans model.WalletTransaction
	err := tx.Where("idempotent_key = ?", req.IdempotentKey).First(&existingTrans).Error
	if err == nil {
		tx.Rollback()
		return &existingTrans, nil
	}

	var wallet model.Wallet
	err = tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ?", req.UserID).
		First(&wallet).Error
	if err != nil {
		tx.Rollback()
		return nil, errors.New("wallet not found")
	}

	if wallet.Balance < req.Amount {
		tx.Rollback()
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
		tx.Rollback()
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		return nil, errors.New("concurrent update conflict, please retry")
	}

	transNo := fmt.Sprintf("TR%s", database.DB.NowFunc().Format("20060102150405"))
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
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		return nil, err
	}

	return trans, nil
}

func RefundWallet(userID uint64, amount float64, relatedOrderNo, idempotentKey, remark string) (*model.WalletTransaction, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	var existingTrans model.WalletTransaction
	err := tx.Where("idempotent_key = ?", idempotentKey).First(&existingTrans).Error
	if err == nil {
		tx.Rollback()
		return &existingTrans, nil
	}

	var wallet model.Wallet
	err = tx.Set("gorm:query_option", "FOR UPDATE").
		Where("user_id = ?", userID).
		First(&wallet).Error
	if err != nil {
		tx.Rollback()
		return nil, errors.New("wallet not found")
	}

	balanceBefore := wallet.Balance
	balanceAfter := wallet.Balance + amount

	result := tx.Model(&wallet).
		Where("version = ?", wallet.Version).
		Updates(map[string]interface{}{
			"balance": balanceAfter,
			"version": wallet.Version + 1,
		})
	if result.Error != nil {
		tx.Rollback()
		return nil, result.Error
	}
	if result.RowsAffected == 0 {
		tx.Rollback()
		return nil, errors.New("concurrent update conflict, please retry")
	}

	transNo := fmt.Sprintf("TR%s", database.DB.NowFunc().Format("20060102150405"))
	trans := &model.WalletTransaction{
		TransNo:        transNo,
		UserID:         userID,
		WalletID:       wallet.ID,
		Type:           model.TransTypeRefund,
		Amount:         amount,
		BalanceBefore:  balanceBefore,
		BalanceAfter:   balanceAfter,
		RelatedOrderNo: &relatedOrderNo,
		IdempotentKey:  idempotentKey,
		Remark:         &remark,
	}

	err = tx.Create(trans).Error
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit().Error
	if err != nil {
		return nil, err
	}

	return trans, nil
}

func GetTransactionList(req *model.TransactionListReq) ([]model.WalletTransaction, int64, error) {
	var list []model.WalletTransaction
	var total int64

	query := database.DB.Model(&model.WalletTransaction{})

	if req.UserID != nil {
		query = query.Where("user_id = ?", *req.UserID)
	}
	if req.Type != nil {
		query = query.Where("type = ?", *req.Type)
	}
	if req.StartTime != nil {
		query = query.Where("created_at >= ?", *req.StartTime)
	}
	if req.EndTime != nil {
		query = query.Where("created_at <= ?", *req.EndTime)
	}

	query.Count(&total)

	offset := (req.Page - 1) * req.PageSize
	err := query.Offset(offset).Limit(req.PageSize).Order("id DESC").Find(&list).Error

	return list, total, err
}
