package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type ShelfCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewShelfCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ShelfCreateLogic {
	return &ShelfCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ShelfCreateLogic) ShelfCreate(req *types.ShelfCreateReq) (resp *types.CommonResp, err error) {
	shelf := &model.Shelf{
		WarehouseId: req.WarehouseId,
		ShelfCode:   req.ShelfCode,
		ShelfName:   req.ShelfName,
		Rows:        req.Rows,
		Columns:     req.Columns,
		Status:      req.Status,
		Remark:      req.Remark,
	}

	_, err = l.svcCtx.ShelfModel.Insert(shelf)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "创建成功",
	}, nil
}
