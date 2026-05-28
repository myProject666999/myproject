package logic

import (
	"context"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type OutboundCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewOutboundCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *OutboundCreateLogic {
	return &OutboundCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *OutboundCreateLogic) OutboundCreate(req *types.OutboundOrderCreateReq) (*types.CommonResp, error) {
	orderNo := req.OrderNo
	if orderNo == "" {
		orderNo = generateOutboundOrderNo()
	}

	outboundOrder := &model.OutboundOrder{
		OrderNo:     orderNo,
		WarehouseId: req.WarehouseId,
		OrderType:   req.OrderType,
		Customer:    req.Customer,
		TotalQty:    req.TotalQty,
		OutboundQty: 0,
		Status:      1,
		Operator:    req.Operator,
		Remark:      req.Remark,
		CreateTime:  time.Now(),
		UpdateTime:  time.Now(),
	}

	_, err := l.svcCtx.OutboundOrderModel.Insert(outboundOrder)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

func generateOutboundOrderNo() string {
	return "OUT" + time.Now().Format("20060102150405")
}

type OutboundListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewOutboundListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *OutboundListLogic {
	return &OutboundListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *OutboundListLogic) OutboundList(req *types.OutboundOrderListReq) (*types.OutboundOrderListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	list, err := l.svcCtx.OutboundOrderModel.FindList(page, pageSize, req.WarehouseId, req.OrderType, req.Status, req.OrderNo, req.Customer)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.OutboundOrderModel.Count(req.WarehouseId, req.OrderType, req.Status, req.OrderNo, req.Customer)
	if err != nil {
		return nil, err
	}

	var orderList []types.OutboundOrderInfo
	for _, item := range list {
		orderList = append(orderList, convertOutboundOrderInfo(item))
	}

	return &types.OutboundOrderListResp{
		Total: total,
		List:  orderList,
	}, nil
}

func convertOutboundOrderInfo(item *model.OutboundOrder) types.OutboundOrderInfo {
	var auditTime, completeTime string
	if item.AuditTime != nil {
		auditTime = item.AuditTime.Format("2006-01-02 15:04:05")
	}
	if item.CompleteTime != nil {
		completeTime = item.CompleteTime.Format("2006-01-02 15:04:05")
	}

	return types.OutboundOrderInfo{
		Id:           item.Id,
		OrderNo:      item.OrderNo,
		WarehouseId:  item.WarehouseId,
		OrderType:    item.OrderType,
		Customer:     item.Customer,
		TotalQty:     item.TotalQty,
		OutboundQty:  item.OutboundQty,
		Status:       item.Status,
		Operator:     item.Operator,
		AuditTime:    auditTime,
		CompleteTime: completeTime,
		Remark:       item.Remark,
		CreateTime:   item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type OutboundAuditLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewOutboundAuditLogic(ctx context.Context, svcCtx *svc.ServiceContext) *OutboundAuditLogic {
	return &OutboundAuditLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *OutboundAuditLogic) OutboundAudit(req *types.OutboundOrderAuditReq) (*types.CommonResp, error) {
	order, err := l.svcCtx.OutboundOrderModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	if order.Status != 1 {
		return &types.CommonResp{
			Code:    400,
			Message: "订单状态不正确",
		}, nil
	}

	now := time.Now()
	order.Status = 2
	order.AuditTime = &now
	order.Operator = req.Operator

	err = l.svcCtx.OutboundOrderModel.Update(order)
	if err != nil {
		return nil, err
	}

	pickingTask := &model.PickingTask{
		TaskNo:       generatePickingTaskNo(),
		OrderId:      order.Id,
		WarehouseId:  order.WarehouseId,
		PlanQty:      order.TotalQty,
		PickQty:      0,
		SortOrder:    1,
		Status:       1,
		Operator:     req.Operator,
		CreateTime:   now,
		UpdateTime:   now,
	}

	_, err = l.svcCtx.PickingTaskModel.Insert(pickingTask)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

func generatePickingTaskNo() string {
	return "PK" + time.Now().Format("20060102150405")
}

type PickingListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewPickingListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *PickingListLogic {
	return &PickingListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *PickingListLogic) PickingList(req *types.PickingTaskListReq) (*types.PickingTaskListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.PickingTaskQuery{
		TaskNo:      req.TaskNo,
		OrderId:     req.OrderId,
		WarehouseId: req.WarehouseId,
		ProductId:   req.ProductId,
		Sku:         req.Sku,
		LocationId:  req.LocationId,
		Operator:    req.Operator,
	}
	if req.Status > 0 {
		query.Status = &req.Status
	}

	list, err := l.svcCtx.PickingTaskModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.PickingTaskModel.Count(query)
	if err != nil {
		return nil, err
	}

	var taskList []types.PickingTaskInfo
	for _, item := range list {
		taskList = append(taskList, convertPickingTaskInfo(item))
	}

	return &types.PickingTaskListResp{
		Total: total,
		List:  taskList,
	}, nil
}

func convertPickingTaskInfo(item *model.PickingTask) types.PickingTaskInfo {
	var completeTime string
	if item.CompleteTime != nil {
		completeTime = item.CompleteTime.Format("2006-01-02 15:04:05")
	}

	return types.PickingTaskInfo{
		Id:           item.Id,
		TaskNo:       item.TaskNo,
		OrderId:      item.OrderId,
		OrderItemId:  item.OrderItemId,
		WarehouseId:  item.WarehouseId,
		ProductId:    item.ProductId,
		Sku:          item.Sku,
		LocationId:   item.LocationId,
		PlanQty:      item.PlanQty,
		PickQty:      item.PickQty,
		SortOrder:    item.SortOrder,
		Status:       item.Status,
		Operator:     item.Operator,
		CompleteTime: completeTime,
		Remark:       item.Remark,
		CreateTime:   item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type PickingCompleteLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewPickingCompleteLogic(ctx context.Context, svcCtx *svc.ServiceContext) *PickingCompleteLogic {
	return &PickingCompleteLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *PickingCompleteLogic) PickingComplete(req *types.PickingTaskCompleteReq) (*types.CommonResp, error) {
	pickingTask, err := l.svcCtx.PickingTaskModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	if pickingTask.Status != 1 {
		return &types.CommonResp{
			Code:    400,
			Message: "拣货任务状态不正确",
		}, nil
	}

	now := time.Now()
	pickingTask.PickQty = req.PickQty
	pickingTask.Status = 2
	pickingTask.Operator = req.Operator
	pickingTask.CompleteTime = &now

	err = l.svcCtx.PickingTaskModel.Update(pickingTask)
	if err != nil {
		return nil, err
	}

	order, err := l.svcCtx.OutboundOrderModel.FindOne(pickingTask.OrderId)
	if err != nil {
		return nil, err
	}

	order.OutboundQty += req.PickQty
	if order.OutboundQty >= order.TotalQty {
		order.Status = 3
		order.CompleteTime = &now
	}

	err = l.svcCtx.OutboundOrderModel.Update(order)
	if err != nil {
		return nil, err
	}

	if pickingTask.LocationId > 0 {
		inventoryList, err := l.svcCtx.InventoryModel.FindList(1, 1, pickingTask.WarehouseId, pickingTask.LocationId, pickingTask.ProductId, pickingTask.Sku)
		if err == nil && len(inventoryList) > 0 {
			inventory := inventoryList[0]
			newQuantity := inventory.Quantity - req.PickQty
			newAvailableQty := inventory.AvailableQty - req.PickQty
			if newQuantity < 0 {
				newQuantity = 0
			}
			if newAvailableQty < 0 {
				newAvailableQty = 0
			}

			err = l.svcCtx.InventoryModel.UpdateStock(inventory.Id, newQuantity, newAvailableQty, inventory.LockedQty, inventory.Version)
			if err != nil {
				return nil, err
			}

			inventoryLog := &model.InventoryLog{
				LogNo:        generateLogNo(),
				WarehouseId:  inventory.WarehouseId,
				LocationId:   inventory.LocationId,
				ProductId:    inventory.ProductId,
				Sku:          inventory.Sku,
				LogType:      2,
				BusinessType: 2,
				BusinessNo:   order.OrderNo,
				BeforeQty:    inventory.Quantity,
				ChangeQty:    -req.PickQty,
				AfterQty:     newQuantity,
				Operator:     req.Operator,
				Remark:       "出库拣货",
				CreateTime:   now,
			}
			_, err = l.svcCtx.InventoryLogModel.Insert(inventoryLog)
			if err != nil {
				return nil, err
			}
		}
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}
