package logic

import (
	"context"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type InventoryListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInventoryListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InventoryListLogic {
	return &InventoryListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InventoryListLogic) InventoryList(req *types.InventoryListReq) (*types.InventoryListResp, error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	list, err := l.svcCtx.InventoryModel.FindList(page, pageSize, req.WarehouseId, req.LocationId, req.ProductId, req.Sku)
	if err != nil {
		return nil, err
	}

	total, err := l.svcCtx.InventoryModel.Count(req.WarehouseId, req.LocationId, req.ProductId, req.Sku)
	if err != nil {
		return nil, err
	}

	var inventoryList []types.InventoryInfo
	for _, item := range list {
		inventoryList = append(inventoryList, convertInventoryInfo(item))
	}

	return &types.InventoryListResp{
		Total: total,
		List:  inventoryList,
	}, nil
}

func convertInventoryInfo(item *model.Inventory) types.InventoryInfo {
	var productionDate, expiryDate string
	if item.ProductionDate != nil {
		productionDate = item.ProductionDate.Format("2006-01-02 15:04:05")
	}
	if item.ExpiryDate != nil {
		expiryDate = item.ExpiryDate.Format("2006-01-02 15:04:05")
	}
	batchNo := ""
	if item.BatchNo != nil {
		batchNo = *item.BatchNo
	}

	return types.InventoryInfo{
		Id:             item.Id,
		WarehouseId:    item.WarehouseId,
		LocationId:     item.LocationId,
		ProductId:      item.ProductId,
		Sku:            item.Sku,
		Quantity:       item.Quantity,
		AvailableQty:   item.AvailableQty,
		LockedQty:      item.LockedQty,
		Version:        item.Version,
		BatchNo:        batchNo,
		ProductionDate: productionDate,
		ExpiryDate:     expiryDate,
		CreateTime:     item.CreateTime.Format("2006-01-02 15:04:05"),
	}
}

type InventoryAdjustLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewInventoryAdjustLogic(ctx context.Context, svcCtx *svc.ServiceContext) *InventoryAdjustLogic {
	return &InventoryAdjustLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *InventoryAdjustLogic) InventoryAdjust(req *types.InventoryAdjustReq) (*types.CommonResp, error) {
	inventory, err := l.svcCtx.InventoryModel.FindOne(req.Id)
	if err != nil {
		return nil, err
	}

	beforeQty := inventory.Quantity
	afterQty := beforeQty + req.ChangeQty
	if afterQty < 0 {
		afterQty = 0
	}

	err = l.svcCtx.InventoryModel.UpdateStock(inventory.Id, afterQty, afterQty-inventory.LockedQty, inventory.LockedQty, inventory.Version)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	logType := int64(1)
	if req.ChangeQty > 0 {
		logType = 1
	} else {
		logType = 2
	}
	remarkLog := req.Reason
	inventoryLog := &model.InventoryLog{
		LogNo:        generateLogNo(),
		WarehouseId:  inventory.WarehouseId,
		LocationId:   inventory.LocationId,
		ProductId:    inventory.ProductId,
		Sku:          inventory.Sku,
		LogType:      logType,
		BusinessType: 5,
		BusinessNo:   "",
		BeforeQty:    beforeQty,
		ChangeQty:    req.ChangeQty,
		AfterQty:     afterQty,
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

func generateLogNo() string {
	return "LOG" + time.Now().Format("20060102150405")
}
