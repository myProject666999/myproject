package service

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"emergency-material/pkg/idempotent"

	"gorm.io/gorm"
)

type TransferOrderService struct{}

func NewTransferOrderService() *TransferOrderService {
	return &TransferOrderService{}
}

const (
	TransferStatusDraft          = "draft"
	TransferStatusPendingApproval = "pending_approval"
	TransferStatusApproved       = "approved"
	TransferStatusRejected       = "rejected"
	TransferStatusInTransit      = "in_transit"
	TransferStatusReceived       = "received"
	TransferStatusCompleted      = "completed"
	TransferStatusCancelled      = "cancelled"
)

var validTransitions = map[string][]string{
	TransferStatusDraft:          {TransferStatusPendingApproval, TransferStatusCancelled},
	TransferStatusPendingApproval: {TransferStatusApproved, TransferStatusRejected, TransferStatusCancelled},
	TransferStatusApproved:       {TransferStatusInTransit, TransferStatusCancelled},
	TransferStatusInTransit:      {TransferStatusReceived},
	TransferStatusReceived:       {TransferStatusCompleted},
}

func (s *TransferOrderService) canTransition(currentStatus, targetStatus string) bool {
	validTargets, exists := validTransitions[currentStatus]
	if !exists {
		return false
	}
	for _, t := range validTargets {
		if t == targetStatus {
			return true
		}
	}
	return false
}

func (s *TransferOrderService) logOperation(ctx context.Context, db *gorm.DB, userID uint64, username, module, operation, bizNo string, bizID uint64, status int8, errorMsg string) error {
	log := &models.OperationLog{
		UserID:    &userID,
		Username:  username,
		Module:    module,
		Operation: operation,
		BizID:     &bizID,
		BizNo:     bizNo,
		Status:    status,
		ErrorMsg:  &errorMsg,
	}
	return db.Create(log).Error
}

func (s *TransferOrderService) generateOrderNo() string {
	now := time.Now()
	return fmt.Sprintf("TR%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func (s *TransferOrderService) generateIdempotentKey(orderNo, operation string) string {
	key := fmt.Sprintf("transfer:%s:%s", orderNo, operation)
	hash := md5.Sum([]byte(key))
	return hex.EncodeToString(hash[:])
}

type CreateTransferOrderRequest struct {
	Title               string                    `json:"title"`
	Type                string                    `json:"type"`
	Priority            string                    `json:"priority"`
	FromWarehouseID     uint64                    `json:"from_warehouse_id"`
	ToWarehouseID       uint64                    `json:"to_warehouse_id"`
	EstimatedArrivalDate *time.Time               `json:"estimated_arrival_date"`
	TransportInfo       *string                   `json:"transport_info"`
	Remark              *string                   `json:"remark"`
	Items               []TransferOrderItemRequest `json:"items"`
	ApplicantID         uint64                    `json:"applicant_id"`
	ApplicantName       string                    `json:"applicant_name"`
}

type TransferOrderItemRequest struct {
	MaterialID    uint64  `json:"material_id"`
	BatchNo       string  `json:"batch_no"`
	ApplyQuantity int     `json:"apply_quantity"`
	Remark        *string `json:"remark"`
}

func (s *TransferOrderService) CreateTransferOrder(ctx context.Context, req *CreateTransferOrderRequest) (*models.TransferOrder, error) {
	if req.FromWarehouseID == req.ToWarehouseID {
		return nil, errors.New("调出仓库和调入仓库不能相同")
	}
	if len(req.Items) == 0 {
		return nil, errors.New("调拨明细不能为空")
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var fromWarehouse, toWarehouse models.Warehouse
	if err := tx.First(&fromWarehouse, req.FromWarehouseID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调出仓库不存在: %w", err)
	}
	if err := tx.First(&toWarehouse, req.ToWarehouseID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调入仓库不存在: %w", err)
	}

	orderNo := s.generateOrderNo()
	totalQuantity := 0
	for _, item := range req.Items {
		if item.ApplyQuantity <= 0 {
			tx.Rollback()
			return nil, errors.New("申请数量必须大于0")
		}
		var material models.Material
		if err := tx.First(&material, item.MaterialID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("物资ID %d 不存在: %w", item.MaterialID, err)
		}
		totalQuantity += item.ApplyQuantity
	}

	order := &models.TransferOrder{
		OrderNo:             orderNo,
		Title:               req.Title,
		Type:                req.Type,
		Priority:            req.Priority,
		FromWarehouseID:     req.FromWarehouseID,
		ToWarehouseID:       req.ToWarehouseID,
		Status:              TransferStatusDraft,
		ApplicantID:         &req.ApplicantID,
		TotalQuantity:       totalQuantity,
		EstimatedArrivalDate: req.EstimatedArrivalDate,
		TransportInfo:       req.TransportInfo,
		Remark:              req.Remark,
	}

	if err := tx.Create(order).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建调拨单失败: %w", err)
	}

	items := make([]models.TransferOrderItem, len(req.Items))
	for i, item := range req.Items {
		items[i] = models.TransferOrderItem{
			OrderID:       order.ID,
			MaterialID:    item.MaterialID,
			BatchNo:       item.BatchNo,
			ApplyQuantity: item.ApplyQuantity,
			Remark:        item.Remark,
		}
	}
	if err := tx.Create(&items).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建调拨明细失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApplicantID, req.ApplicantName, "transfer", "create", orderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	order.Items = items
	return order, nil
}

type SubmitTransferOrderRequest struct {
	OrderID         uint64 `json:"order_id"`
	ApplicantID     uint64 `json:"applicant_id"`
	ApplicantName   string `json:"applicant_name"`
}

func (s *TransferOrderService) SubmitTransferOrder(ctx context.Context, req *SubmitTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "submit")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复提交")
	}

	if !s.canTransition(order.Status, TransferStatusPendingApproval) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusPendingApproval)
	}

	now := time.Now()
	order.Status = TransferStatusPendingApproval
	order.ApplyTime = &now
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApplicantID, req.ApplicantName, "transfer", "submit", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type ApproveTransferOrderRequest struct {
	OrderID       uint64   `json:"order_id"`
	ApproverID    uint64   `json:"approver_id"`
	ApproverName  string   `json:"approver_name"`
	ApproveRemark *string  `json:"approve_remark"`
	Items         []ApproveItemRequest `json:"items"`
}

type ApproveItemRequest struct {
	ItemID           uint64 `json:"item_id"`
	ApprovedQuantity int    `json:"approved_quantity"`
}

func (s *TransferOrderService) ApproveTransferOrder(ctx context.Context, req *ApproveTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.Preload("Items").First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "approve")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复审批")
	}

	if !s.canTransition(order.Status, TransferStatusApproved) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusApproved)
	}

	itemMap := make(map[uint64]*models.TransferOrderItem)
	for i := range order.Items {
		itemMap[order.Items[i].ID] = &order.Items[i]
	}

	totalApproved := 0
	for _, itemReq := range req.Items {
		item, exists := itemMap[itemReq.ItemID]
		if !exists {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("明细ID %d 不存在", itemReq.ItemID)
		}
		if itemReq.ApprovedQuantity < 0 || itemReq.ApprovedQuantity > item.ApplyQuantity {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("审批数量必须在0-%d之间", item.ApplyQuantity)
		}

		if itemReq.ApprovedQuantity > 0 {
			var inv models.Inventory
			if err := tx.Where("warehouse_id = ? AND material_id = ? AND batch_no = ?",
				order.FromWarehouseID, item.MaterialID, item.BatchNo).First(&inv).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("库存不存在: %w", err)
			}
			if inv.AvailableQuantity < itemReq.ApprovedQuantity {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("库存不足，可用数量: %d，申请数量: %d", inv.AvailableQuantity, itemReq.ApprovedQuantity)
			}

			inv.LockedQuantity += itemReq.ApprovedQuantity
			inv.AvailableQuantity = inv.Quantity - inv.LockedQuantity
			if err := tx.Save(&inv).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("锁定库存失败: %w", err)
			}

			if err := tx.Model(&models.InventorySummary{}).
				Where("warehouse_id = ? AND material_id = ?", inv.WarehouseID, inv.MaterialID).
				Updates(map[string]interface{}{
					"locked_quantity":    gorm.Expr("locked_quantity + ?", itemReq.ApprovedQuantity),
					"available_quantity": gorm.Expr("available_quantity - ?", itemReq.ApprovedQuantity),
				}).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("更新库存汇总失败: %w", err)
			}

			item.FromInventoryID = &inv.ID
			item.UnitPrice = inv.UnitPrice
		}

		item.ApprovedQuantity = &itemReq.ApprovedQuantity
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("更新明细失败: %w", err)
		}
		totalApproved += itemReq.ApprovedQuantity
	}

	now := time.Now()
	order.Status = TransferStatusApproved
	order.ApproverID = &req.ApproverID
	order.ApproveTime = &now
	order.ApproveRemark = req.ApproveRemark
	order.TotalQuantity = totalApproved
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApproverID, req.ApproverName, "transfer", "approve", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type RejectTransferOrderRequest struct {
	OrderID       uint64  `json:"order_id"`
	ApproverID    uint64  `json:"approver_id"`
	ApproverName  string  `json:"approver_name"`
	ApproveRemark *string `json:"approve_remark"`
}

func (s *TransferOrderService) RejectTransferOrder(ctx context.Context, req *RejectTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "reject")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复审批")
	}

	if !s.canTransition(order.Status, TransferStatusRejected) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusRejected)
	}

	now := time.Now()
	order.Status = TransferStatusRejected
	order.ApproverID = &req.ApproverID
	order.ApproveTime = &now
	order.ApproveRemark = req.ApproveRemark
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApproverID, req.ApproverName, "transfer", "reject", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type SendTransferOrderRequest struct {
	OrderID         uint64  `json:"order_id"`
	SenderID        uint64  `json:"sender_id"`
	SenderName      string  `json:"sender_name"`
	TransportInfo   *string `json:"transport_info"`
}

func (s *TransferOrderService) SendTransferOrder(ctx context.Context, req *SendTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.Preload("Items").First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "send")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复发货")
	}

	if !s.canTransition(order.Status, TransferStatusInTransit) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusInTransit)
	}

	for i := range order.Items {
		item := &order.Items[i]
		if item.ApprovedQuantity == nil || *item.ApprovedQuantity <= 0 {
			continue
		}

		var inv models.Inventory
		if err := tx.First(&inv, item.FromInventoryID).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("库存不存在: %w", err)
		}

		beforeQty := inv.Quantity
		actualQty := *item.ApprovedQuantity
		inv.Quantity -= actualQty
		inv.LockedQuantity -= actualQty
		inv.AvailableQuantity = inv.Quantity - inv.LockedQuantity
		if err := tx.Save(&inv).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("扣减库存失败: %w", err)
		}

		afterQty := inv.Quantity
		item.ActualQuantity = &actualQty

		recordNo := fmt.Sprintf("SR%s%06d", time.Now().Format("20060102150405"), time.Now().UnixNano()%1000000)
		stockRecord := &models.StockRecord{
			RecordNo:       recordNo,
			Type:           "out",
			BizType:        "transfer_out",
			WarehouseID:    order.FromWarehouseID,
			MaterialID:     item.MaterialID,
			InventoryID:    item.FromInventoryID,
			BatchNo:        item.BatchNo,
			Quantity:       actualQty,
			BeforeQuantity: &beforeQty,
			AfterQuantity:  &afterQty,
			UnitPrice:      item.UnitPrice,
			RelatedOrderID: &order.ID,
			RelatedOrderNo: order.OrderNo,
			OperatorID:     &req.SenderID,
			IdempotentKey:  idempotent.GenerateKey("stock_out", order.ID, item.ID, "send"),
			Remark:         item.Remark,
		}
		if err := tx.Create(stockRecord).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("创建出库记录失败: %w", err)
		}

		if err := tx.Model(&models.InventorySummary{}).
			Where("warehouse_id = ? AND material_id = ?", inv.WarehouseID, inv.MaterialID).
			Updates(map[string]interface{}{
				"total_quantity":     gorm.Expr("total_quantity - ?", actualQty),
				"locked_quantity":    gorm.Expr("locked_quantity - ?", actualQty),
				"available_quantity": gorm.Expr("available_quantity + ?", actualQty),
			}).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("更新库存汇总失败: %w", err)
		}

		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("更新明细失败: %w", err)
		}
	}

	now := time.Now()
	order.Status = TransferStatusInTransit
	order.SenderID = &req.SenderID
	order.SendTime = &now
	if req.TransportInfo != nil {
		order.TransportInfo = req.TransportInfo
	}
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.SenderID, req.SenderName, "transfer", "send", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type ReceiveTransferOrderRequest struct {
	OrderID       uint64                  `json:"order_id"`
	ReceiverID    uint64                  `json:"receiver_id"`
	ReceiverName  string                  `json:"receiver_name"`
	Items         []ReceiveItemRequest    `json:"items"`
}

type ReceiveItemRequest struct {
	ItemID           uint64 `json:"item_id"`
	ReceivedQuantity int    `json:"received_quantity"`
}

func (s *TransferOrderService) ReceiveTransferOrder(ctx context.Context, req *ReceiveTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.Preload("Items").First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "receive")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复收货")
	}

	if !s.canTransition(order.Status, TransferStatusReceived) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusReceived)
	}

	itemMap := make(map[uint64]*models.TransferOrderItem)
	for i := range order.Items {
		itemMap[order.Items[i].ID] = &order.Items[i]
	}

	for _, itemReq := range req.Items {
		item, exists := itemMap[itemReq.ItemID]
		if !exists {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("明细ID %d 不存在", itemReq.ItemID)
		}
		if item.ActualQuantity == nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("明细ID %d 未发货", itemReq.ItemID)
		}
		if itemReq.ReceivedQuantity < 0 || itemReq.ReceivedQuantity > *item.ActualQuantity {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("实收数量必须在0-%d之间", *item.ActualQuantity)
		}

		if itemReq.ReceivedQuantity > 0 {
			var inv models.Inventory
			result := tx.Where("warehouse_id = ? AND material_id = ? AND batch_no = ?",
				order.ToWarehouseID, item.MaterialID, item.BatchNo).First(&inv)
			if result.Error != nil {
				if errors.Is(result.Error, gorm.ErrRecordNotFound) {
					inv = models.Inventory{
						WarehouseID:       order.ToWarehouseID,
						MaterialID:        item.MaterialID,
						BatchNo:           item.BatchNo,
						Quantity:          itemReq.ReceivedQuantity,
						LockedQuantity:    0,
						AvailableQuantity: itemReq.ReceivedQuantity,
						UnitPrice:         item.UnitPrice,
					}
					if err := tx.Create(&inv).Error; err != nil {
						tx.Rollback()
						idempotent.Remove(ctx, idempotentKey)
						return nil, fmt.Errorf("创建库存失败: %w", err)
					}
				} else {
					tx.Rollback()
					idempotent.Remove(ctx, idempotentKey)
					return nil, fmt.Errorf("查询库存失败: %w", result.Error)
				}
			} else {
				beforeQty := inv.Quantity
				inv.Quantity += itemReq.ReceivedQuantity
				inv.AvailableQuantity = inv.Quantity - inv.LockedQuantity
				if err := tx.Save(&inv).Error; err != nil {
					tx.Rollback()
					idempotent.Remove(ctx, idempotentKey)
					return nil, fmt.Errorf("更新库存失败: %w", err)
				}

				afterQty := inv.Quantity
				recordNo := fmt.Sprintf("SR%s%06d", time.Now().Format("20060102150405"), time.Now().UnixNano()%1000000)
				stockRecord := &models.StockRecord{
					RecordNo:       recordNo,
					Type:           "in",
					BizType:        "transfer_in",
					WarehouseID:    order.ToWarehouseID,
					MaterialID:     item.MaterialID,
					InventoryID:    &inv.ID,
					BatchNo:        item.BatchNo,
					Quantity:       itemReq.ReceivedQuantity,
					BeforeQuantity: &beforeQty,
					AfterQuantity:  &afterQty,
					UnitPrice:      item.UnitPrice,
					RelatedOrderID: &order.ID,
					RelatedOrderNo: order.OrderNo,
					OperatorID:     &req.ReceiverID,
					IdempotentKey:  idempotent.GenerateKey("stock_in", order.ID, item.ID, "receive"),
					Remark:         item.Remark,
				}
				if err := tx.Create(stockRecord).Error; err != nil {
					tx.Rollback()
					idempotent.Remove(ctx, idempotentKey)
					return nil, fmt.Errorf("创建入库记录失败: %w", err)
				}
			}

			var summary models.InventorySummary
			sumResult := tx.Where("warehouse_id = ? AND material_id = ?", order.ToWarehouseID, item.MaterialID).First(&summary)
			if sumResult.Error != nil {
				if errors.Is(sumResult.Error, gorm.ErrRecordNotFound) {
					summary = models.InventorySummary{
						WarehouseID:       order.ToWarehouseID,
						MaterialID:        item.MaterialID,
						TotalQuantity:     itemReq.ReceivedQuantity,
						LockedQuantity:    0,
						AvailableQuantity: itemReq.ReceivedQuantity,
					}
					if err := tx.Create(&summary).Error; err != nil {
						tx.Rollback()
						idempotent.Remove(ctx, idempotentKey)
						return nil, fmt.Errorf("创建库存汇总失败: %w", err)
					}
				} else {
					tx.Rollback()
					idempotent.Remove(ctx, idempotentKey)
					return nil, fmt.Errorf("查询库存汇总失败: %w", sumResult.Error)
				}
			} else {
				summary.TotalQuantity += itemReq.ReceivedQuantity
				summary.AvailableQuantity = summary.TotalQuantity - summary.LockedQuantity
				if err := tx.Save(&summary).Error; err != nil {
					tx.Rollback()
					idempotent.Remove(ctx, idempotentKey)
					return nil, fmt.Errorf("更新库存汇总失败: %w", err)
				}
			}
		}

		item.ReceivedQuantity = &itemReq.ReceivedQuantity
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("更新明细失败: %w", err)
		}
	}

	now := time.Now()
	order.Status = TransferStatusReceived
	order.ReceiverID = &req.ReceiverID
	order.ReceiveTime = &now
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ReceiverID, req.ReceiverName, "transfer", "receive", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type CompleteTransferOrderRequest struct {
	OrderID       uint64 `json:"order_id"`
	OperatorID    uint64 `json:"operator_id"`
	OperatorName  string `json:"operator_name"`
}

func (s *TransferOrderService) CompleteTransferOrder(ctx context.Context, req *CompleteTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "complete")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复完成")
	}

	if !s.canTransition(order.Status, TransferStatusCompleted) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusCompleted)
	}

	order.Status = TransferStatusCompleted
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "transfer", "complete", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type CancelTransferOrderRequest struct {
	OrderID       uint64 `json:"order_id"`
	OperatorID    uint64 `json:"operator_id"`
	OperatorName  string `json:"operator_name"`
}

func (s *TransferOrderService) CancelTransferOrder(ctx context.Context, req *CancelTransferOrderRequest) (*models.TransferOrder, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var order models.TransferOrder
	if err := tx.Preload("Items").First(&order, req.OrderID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(order.OrderNo, "cancel")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复取消")
	}

	if !s.canTransition(order.Status, TransferStatusCancelled) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", order.Status, TransferStatusCancelled)
	}

	if order.Status == TransferStatusApproved {
		for i := range order.Items {
			item := &order.Items[i]
			if item.ApprovedQuantity == nil || *item.ApprovedQuantity <= 0 || item.FromInventoryID == nil {
				continue
			}

			var inv models.Inventory
			if err := tx.First(&inv, item.FromInventoryID).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("库存不存在: %w", err)
			}

			inv.LockedQuantity -= *item.ApprovedQuantity
			inv.AvailableQuantity = inv.Quantity - inv.LockedQuantity
			if err := tx.Save(&inv).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("释放库存失败: %w", err)
			}

			if err := tx.Model(&models.InventorySummary{}).
				Where("warehouse_id = ? AND material_id = ?", inv.WarehouseID, inv.MaterialID).
				Updates(map[string]interface{}{
					"locked_quantity":    gorm.Expr("locked_quantity - ?", *item.ApprovedQuantity),
					"available_quantity": gorm.Expr("available_quantity + ?", *item.ApprovedQuantity),
				}).Error; err != nil {
				tx.Rollback()
				idempotent.Remove(ctx, idempotentKey)
				return nil, fmt.Errorf("更新库存汇总失败: %w", err)
			}
		}
	}

	order.Status = TransferStatusCancelled
	if err := tx.Save(&order).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新调拨单失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "transfer", "cancel", order.OrderNo, order.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &order, nil
}

type TransferOrderQuery struct {
	Page            int      `json:"page"`
	PageSize        int      `json:"page_size"`
	OrderNo         string   `json:"order_no"`
	Status          string   `json:"status"`
	FromWarehouseID *uint64  `json:"from_warehouse_id"`
	ToWarehouseID   *uint64  `json:"to_warehouse_id"`
	Type            string   `json:"type"`
	Priority        string   `json:"priority"`
	StartDate       *string  `json:"start_date"`
	EndDate         *string  `json:"end_date"`
}

type TransferOrderListResponse struct {
	Total int64                  `json:"total"`
	List  []models.TransferOrder `json:"list"`
}

func (s *TransferOrderService) GetTransferOrderList(ctx context.Context, query *TransferOrderQuery) (*TransferOrderListResponse, error) {
	db := database.DB.Model(&models.TransferOrder{}).
		Preload("FromWarehouse").
		Preload("ToWarehouse").
		Preload("Applicant")

	if query.OrderNo != "" {
		db = db.Where("order_no LIKE ?", "%"+query.OrderNo+"%")
	}
	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}
	if query.FromWarehouseID != nil {
		db = db.Where("from_warehouse_id = ?", *query.FromWarehouseID)
	}
	if query.ToWarehouseID != nil {
		db = db.Where("to_warehouse_id = ?", *query.ToWarehouseID)
	}
	if query.Type != "" {
		db = db.Where("type = ?", query.Type)
	}
	if query.Priority != "" {
		db = db.Where("priority = ?", query.Priority)
	}
	if query.StartDate != nil {
		db = db.Where("created_at >= ?", *query.StartDate)
	}
	if query.EndDate != nil {
		db = db.Where("created_at <= ?", *query.EndDate)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.TransferOrder
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, err
	}

	return &TransferOrderListResponse{
		Total: total,
		List:  list,
	}, nil
}

func (s *TransferOrderService) GetTransferOrderDetail(ctx context.Context, orderID uint64) (*models.TransferOrder, error) {
	var order models.TransferOrder
	if err := database.DB.
		Preload("FromWarehouse").
		Preload("ToWarehouse").
		Preload("Applicant").
		Preload("Approver").
		Preload("Sender").
		Preload("Receiver").
		Preload("Items.Material").
		Preload("Items.FromInventory").
		First(&order, orderID).Error; err != nil {
		return nil, fmt.Errorf("调拨单不存在: %w", err)
	}
	return &order, nil
}
