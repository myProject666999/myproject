package logic

import (
	"context"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type InboundCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInboundCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InboundCreateLogic {
	return &InboundCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InboundCreateLogic) InboundCreate(req *types.InboundOrderCreateReq) (*types.CommonResp, error) {
	orderNo := req.OrderNo
	if orderNo == "" {
		orderNo = generateInboundOrderNo()
	}

	remark := req.Remark
	inboundOrder := &model.InboundOrder{
		OrderNo:     orderNo,
		WarehouseId: req.WarehouseId,
		OrderType:   req.OrderType,
		Supplier:    req.Supplier,
		TotalQty:    req.TotalQty,
		InboundQty:  0,
		Status:      1,
		Operator:    req.Operator,
		Remark:      &remark,
		CreateTime:  time.Now(),
		UpdateTime:  time.Now(),
	}

	_, err := l.svcCtx.InboundOrderModel.Insert(inboundOrder)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

func generateInboundOrderNo() string {
	return "IN" + time.Now().Format("20060102150405")
}

type InboundListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInboundListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InboundListLogic {
	return &InboundListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InboundListLogic) InboundList(req *types.InboundOrderListReq) (*types.InboundOrderListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	list, err := l.svcCtx.InboundOrderModel.FindList(page, pageSize, req.WarehouseId, req.OrderType, req.Status, req.OrderNo, req.Supplier)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.InboundOrderModel.Count(req.WarehouseId, req.OrderType, req.Status, req.OrderNo, req.Supplier)
	if err != nil {
		return nil, err
	}

	var orderList []types.InboundOrderInfo
	for _, item := range list {
		orderList = append(orderList, convertInboundOrderInfo(item))
	}

	return &types.InboundOrderListResp{
		Total: total,
		List:  orderList,
	}, nil
}

func convertInboundOrderInfo(item *model.InboundOrder) types.InboundOrderInfo {
	var auditTime, completeTime string
	if item.AuditTime != nil {
		auditTime = item.AuditTime.Format("2006-01-02 15:04:05")
	}
	if item.CompleteTime != nil {
		completeTime = item.CompleteTime.Format("2006-01-02 15:04:05")
	}
	remark := ""
	if item.Remark != nil {
		remark = *item.Remark
	}

	return types.InboundOrderInfo{
		Id:           item.Id,
		OrderNo:      item.OrderNo,
		WarehouseId:  item.WarehouseId,
		OrderType:    item.OrderType,
		Supplier:     item.Supplier,
		TotalQty:     item.TotalQty,
		InboundQty:   item.InboundQty,
		Status:       item.Status,
		Operator:     item.Operator,
		AuditTime:    auditTime,
		CompleteTime: completeTime,
		Remark:       remark,
		CreateTime:   item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type InboundAuditLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInboundAuditLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InboundAuditLogic {
	return &InboundAuditLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InboundAuditLogic) InboundAudit(req *types.InboundOrderAuditReq) (*types.CommonResp, error) {
	order, err := l.svcCtx.InboundOrderModel.FindOne(req.Id)
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

	err = l.svcCtx.InboundOrderModel.Update(order)
	if err != nil {
		return nil, err
	}

	putawayTask := &model.PutawayTask{
		TaskNo:              generatePutawayTaskNo(),
		OrderId:             order.Id,
		WarehouseId:         order.WarehouseId,
		Status:              1,
		Operator:            req.Operator,
		CreateTime:          now,
		UpdateTime:          now,
	}

	_, err = l.svcCtx.PutawayTaskModel.Insert(putawayTask)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}

func generatePutawayTaskNo() string {
	return "PT" + time.Now().Format("20060102150405")
}

type InboundPutawayLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInboundPutawayLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InboundPutawayLogic {
	return &InboundPutawayLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InboundPutawayLogic) InboundPutaway(req *types.InboundOrderPutawayReq) (*types.CommonResp, error) {
	putawayTask, err := l.svcCtx.PutawayTaskModel.FindOne(req.PutawayTaskId)
	if err != nil {
		return nil, err
	}

	if putawayTask.Status != 1 {
		return &types.CommonResp{
			Code:    400,
			Message: "上架任务状态不正确",
		}, nil
	}

	now := time.Now()
	putawayTask.ActualLocationId = req.ActualLocationId
	putawayTask.PutawayQty = req.PutawayQty
	putawayTask.Status = 2
	putawayTask.Operator = req.Operator
	putawayTask.CompleteTime = &now

	err = l.svcCtx.PutawayTaskModel.Update(putawayTask)
	if err != nil {
		return nil, err
	}

	order, err := l.svcCtx.InboundOrderModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	order.InboundQty += req.PutawayQty
	if order.InboundQty >= order.TotalQty {
		order.Status = 3
		order.CompleteTime = &now
	}

	err = l.svcCtx.InboundOrderModel.Update(order)
	if err != nil {
		return nil, err
	}

	inventoryList, err := l.svcCtx.InventoryModel.FindList(1, 1, order.WarehouseId, req.ActualLocationId, putawayTask.ProductId, putawayTask.Sku)
	if err != nil || len(inventoryList) == 0 {
		newInventory := &model.Inventory{
			WarehouseId:  order.WarehouseId,
			LocationId:   req.ActualLocationId,
			ProductId:    putawayTask.ProductId,
			Sku:          putawayTask.Sku,
			Quantity:     req.PutawayQty,
			AvailableQty: req.PutawayQty,
			LockedQty:    0,
			Version:      1,
			CreateTime:   now,
			UpdateTime:   now,
		}
		_, err = l.svcCtx.InventoryModel.Insert(newInventory)
		if err != nil {
			return nil, err
		}
	} else {
		inventory := inventoryList[0]
		err = l.svcCtx.InventoryModel.UpdateStock(inventory.Id, inventory.Quantity+req.PutawayQty, inventory.AvailableQty+req.PutawayQty, inventory.LockedQty, inventory.Version)
		if err != nil {
			return nil, err
		}
	}

	remarkLog := "入库上架"
	inventoryLog := &model.InventoryLog{
		LogNo:        generateLogNo(),
		WarehouseId:  order.WarehouseId,
		LocationId:   req.ActualLocationId,
		ProductId:    putawayTask.ProductId,
		Sku:          putawayTask.Sku,
		LogType:      1,
		BusinessType: 1,
		BusinessNo:   order.OrderNo,
		BeforeQty:    0,
		ChangeQty:    req.PutawayQty,
		AfterQty:     0,
		Operator:     req.Operator,
		Remark:       &remarkLog,
		CreateTime:   now,
	}
	_, err = l.svcCtx.InventoryLogModel.Insert(inventoryLog)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "success",
	}, nil
}
