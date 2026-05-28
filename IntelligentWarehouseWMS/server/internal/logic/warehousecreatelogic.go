package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type WarehouseCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewWarehouseCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *WarehouseCreateLogic {
	return &WarehouseCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *WarehouseCreateLogic) WarehouseCreate(req *types.WarehouseCreateReq) (resp *types.CommonResp, err error) {
	warehouse := &model.Warehouse{
		WarehouseCode: req.WarehouseCode,
		WarehouseName: req.WarehouseName,
		Address:       req.Address,
		Manager:       req.Manager,
		Phone:         req.Phone,
		Status:        req.Status,
		Remark:        req.Remark,
	}

	_, err = l.svcCtx.WarehouseModel.Insert(warehouse)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "创建成功",
	}, nil
}
