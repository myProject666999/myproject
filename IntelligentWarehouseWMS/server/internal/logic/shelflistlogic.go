package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type ShelfListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewShelfListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ShelfListLogic {
	return &ShelfListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ShelfListLogic) ShelfList(req *types.ShelfListReq) (resp *types.ShelfListResp, err error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.ShelfQuery{
		ShelfCode: req.ShelfCode,
		ShelfName: req.ShelfName,
	}
	if req.WarehouseId != 0 {
		query.WarehouseId = &req.WarehouseId
	}
	if req.Status != 0 {
		query.Status = &req.Status
	}

	total, err := l.svcCtx.ShelfModel.Count(query)
	if err != nil {
		return nil, err
	}

	list, err := l.svcCtx.ShelfModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	shelfList := make([]types.ShelfInfo, 0, len(list))
	for _, shelf := range list {
		shelfList = append(shelfList, types.ShelfInfo{
			Id:          shelf.Id,
			WarehouseId: shelf.WarehouseId,
			ShelfCode:   shelf.ShelfCode,
			ShelfName:   shelf.ShelfName,
			Rows:        shelf.Rows,
			Columns:     shelf.Columns,
			Status:      shelf.Status,
			Remark:      shelf.Remark,
			CreateTime:  shelf.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.ShelfListResp{
		Total: total,
		List:  shelfList,
	}, nil
}
