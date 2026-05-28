package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type WarehouseListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewWarehouseListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *WarehouseListLogic {
	return &WarehouseListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *WarehouseListLogic) WarehouseList(req *types.WarehouseListReq) (resp *types.WarehouseListResp, err error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.WarehouseQuery{
		WarehouseCode: req.WarehouseCode,
		WarehouseName: req.WarehouseName,
	}
	if req.Status != 0 {
		query.Status = &req.Status
	}

	total, err := l.svcCtx.WarehouseModel.Count(query)
	if err != nil {
		return nil, err
	}

	list, err := l.svcCtx.WarehouseModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	warehouseList := make([]types.WarehouseInfo, 0, len(list))
	for _, warehouse := range list {
		warehouseList = append(warehouseList, types.WarehouseInfo{
			Id:            warehouse.Id,
			WarehouseCode: warehouse.WarehouseCode,
			WarehouseName: warehouse.WarehouseName,
			Address:       warehouse.Address,
			Manager:       warehouse.Manager,
			Phone:         warehouse.Phone,
			Status:        warehouse.Status,
			Remark:        warehouse.Remark,
			CreateTime:    warehouse.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.WarehouseListResp{
		Total: total,
		List:  warehouseList,
	}, nil
}
