package service

import (
	"errors"
	"time"

	"samecity-express/config"
	"samecity-express/internal/model"
)

type ExceptionService struct{}

func NewExceptionService() *ExceptionService {
	return &ExceptionService{}
}

func (s *ExceptionService) CreateException(userID uint, orderID uint, exceptionType int, description, photos string) (*model.ExceptionOrder, error) {
	var order model.Order
	if err := config.DB.First(&order, orderID).Error; err != nil {
		return nil, errors.New("订单不存在")
	}

	if order.UserID != userID {
		return nil, errors.New("无权操作此订单")
	}

	if order.Status == 7 || order.Status == 8 {
		return nil, errors.New("订单状态不允许创建异常")
	}

	tx := config.DB.Begin()

	exception := &model.ExceptionOrder{
		OrderID:     orderID,
		UserID:      userID,
		RiderID:     order.RiderID,
		Type:        exceptionType,
		Description: description,
		Photos:      photos,
		Status:      0,
	}

	if err := tx.Create(exception).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&order).Update("status", 8).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()

	return exception, nil
}

func (s *ExceptionService) GetExceptions(userID *uint, riderID *uint, status *int, page, pageSize int) ([]*model.ExceptionOrder, int64, error) {
	var exceptions []*model.ExceptionOrder
	var total int64

	query := config.DB.Model(&model.ExceptionOrder{}).Preload("Order")

	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}
	if riderID != nil {
		query = query.Where("rider_id = ?", *riderID)
	}
	if status != nil {
		query = query.Where("status = ?", *status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&exceptions).Error; err != nil {
		return nil, 0, err
	}

	return exceptions, total, nil
}

func (s *ExceptionService) GetExceptionByID(exceptionID uint) (*model.ExceptionOrder, error) {
	var exception model.ExceptionOrder
	if err := config.DB.Preload("Order").First(&exception, exceptionID).Error; err != nil {
		return nil, err
	}
	return &exception, nil
}

func (s *ExceptionService) HandleException(adminID uint, exceptionID uint, handleResult string, compensation float64, status int) (*model.ExceptionOrder, error) {
	var exception model.ExceptionOrder
	if err := config.DB.First(&exception, exceptionID).Error; err != nil {
		return nil, errors.New("异常工单不存在")
	}

	if exception.Status != 0 && exception.Status != 1 {
		return nil, errors.New("工单已处理完成")
	}

	tx := config.DB.Begin()

	now := time.Now()
	exception.HandleAdminID = adminID
	exception.HandleResult = handleResult
	exception.HandleTime = &now
	exception.Status = status
	exception.Compensation = compensation

	if err := tx.Save(&exception).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if status == 2 && compensation > 0 {
		var user model.User
		if err := tx.First(&user, exception.UserID).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		newBalance := user.Balance + compensation
		if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		userWallet := &model.WalletRecord{
			UserID:      exception.UserID,
			Type:        5,
			Amount:      compensation,
			Balance:     newBalance,
			Description: "异常赔偿",
		}
		if err := tx.Create(userWallet).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	tx.Commit()

	return &exception, nil
}
