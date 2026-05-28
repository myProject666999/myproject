package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type LocationCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLocationCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LocationCreateLogic {
	return &LocationCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LocationCreateLogic) LocationCreate(req *types.LocationCreateReq) (resp *types.CommonResp, err error) {
	location := &model.Location{
		WarehouseId:  req.WarehouseId,
		ShelfId:      req.ShelfId,
		LocationCode: req.LocationCode,
		RowNo:        req.RowNo,
		ColNo:        req.ColNo,
		Capacity:     req.Capacity,
		UsedCapacity: req.UsedCapacity,
		Status:       req.Status,
		Remark:       req.Remark,
	}

	_, err = l.svcCtx.LocationModel.Insert(location)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "创建成功",
	}, nil
}
