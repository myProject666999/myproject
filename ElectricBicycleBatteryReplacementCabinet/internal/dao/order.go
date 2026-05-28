package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"time"
)

func GetOrderList(req *model.OrderListReq) ([]model.OrderDetailVO, int64, error) {
	var list []model.OrderDetailVO
	var total int64

	query := database.DB.Table("`order` o").
		Select("o.*, " +
			"u.nickname as user_name, u.phone as user_phone, " +
			"c.name as cabinet_name, c.cabinet_no as cabinet_no, " +
			"ob.battery_no as out_battery_no, ib.battery_no as in_battery_no, " +
			"p.name as package_name").
		Joins("LEFT JOIN user u ON o.user_id = u.id").
		Joins("LEFT JOIN cabinet c ON o.cabinet_id = c.id").
		Joins("LEFT JOIN battery ob ON o.out_battery_id = ob.id").
		Joins("LEFT JOIN battery ib ON o.in_battery_id = ib.id").
		Joins("LEFT JOIN package p ON o.package_id = p.id")

	if req.OrderNo != "" {
		query = query.Where("o.order_no LIKE ?", "%"+req.OrderNo+"%")
	}
	if req.UserID != nil {
		query = query.Where("o.user_id = ?", *req.UserID)
	}
	if req.CabinetID != nil {
		query = query.Where("o.cabinet_id = ?", *req.CabinetID)
	}
	if req.OrderStatus != nil {
		query = query.Where("o.order_status = ?", *req.OrderStatus)
	}
	if req.PayStatus != nil {
		query = query.Where("o.pay_status = ?", *req.PayStatus)
	}
	if req.StartTime != nil {
		query = query.Where("o.created_at >= ?", *req.StartTime)
	}
	if req.EndTime != nil {
		query = query.Where("o.created_at <= ?", *req.EndTime)
	}

	query.Count(&total)

	offset := (req.Page - 1) * req.PageSize
	err := query.Offset(offset).Limit(req.PageSize).Order("o.id DESC").Scan(&list).Error

	return list, total, err
}

func GetOrderByID(id uint64) (*model.OrderDetailVO, error) {
	var vo model.OrderDetailVO
	err := database.DB.Table("`order` o").
		Select("o.*, " +
			"u.nickname as user_name, u.phone as user_phone, " +
			"c.name as cabinet_name, c.cabinet_no as cabinet_no, " +
			"ob.battery_no as out_battery_no, ib.battery_no as in_battery_no, " +
			"p.name as package_name").
		Joins("LEFT JOIN user u ON o.user_id = u.id").
		Joins("LEFT JOIN cabinet c ON o.cabinet_id = c.id").
		Joins("LEFT JOIN battery ob ON o.out_battery_id = ob.id").
		Joins("LEFT JOIN battery ib ON o.in_battery_id = ib.id").
		Joins("LEFT JOIN package p ON o.package_id = p.id").
		Where("o.id = ?", id).
		Scan(&vo).Error
	if err != nil {
		return nil, err
	}
	if vo.ID == 0 {
		return nil, nil
	}
	return &vo, nil
}

func GetOrderByNo(orderNo string) (*model.Order, error) {
	var order model.Order
	err := database.DB.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

func CreateOrder(order *model.Order) error {
	return database.DB.Create(order).Error
}

func UpdateOrder(id uint64, updates map[string]interface{}) error {
	return database.DB.Model(&model.Order{}).Where("id = ?", id).Updates(updates).Error
}

func GetOrderStats() (*model.OrderStatsVO, error) {
	var stats model.OrderStatsVO
	today := time.Now().Format("2006-01-02")

	database.DB.Model(&model.Order{}).Count(&stats.TotalOrders)
	database.DB.Model(&model.Order{}).Where("DATE(created_at) = ?", today).Count(&stats.TodayOrders)
	database.DB.Model(&model.Order{}).Where("order_status = ?", model.OrderStatusCompleted).Count(&stats.CompletedOrders)

	rows, _ := database.DB.Model(&model.Order{}).
		Select("COALESCE(SUM(pay_amount), 0) as total, COALESCE(SUM(CASE WHEN DATE(created_at) = ? THEN pay_amount ELSE 0 END), 0) as today", today).
		Where("pay_status = ?", model.PayStatusPaid).
		Rows()
	if rows != nil && rows.Next() {
		rows.Scan(&stats.TotalAmount, &stats.TodayAmount)
		rows.Close()
	}

	return &stats, nil
}

func GetOrderByIdempotentKey(key string) (*model.Order, error) {
	var order model.Order
	err := database.DB.Where("idempotent_key = ?", key).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}
