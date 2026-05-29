package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type LocationListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLocationListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LocationListLogic {
	return &LocationListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LocationListLogic) LocationList(req *types.LocationListReq) (resp *types.LocationListResp, err error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.LocationQuery{
		LocationCode: req.LocationCode,
	}
	if req.WarehouseId != 0 {
		query.WarehouseId = &req.WarehouseId
	}
	if req.ShelfId != 0 {
		query.ShelfId = &req.ShelfId
	}
	if req.Status != 0 {
		query.Status = &req.Status
	}

	total, err := l.svcCtx.LocationModel.Count(query)
	if err != nil {
		return nil, err
	}

	list, err := l.svcCtx.LocationModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	locationList := make([]types.LocationInfo, 0, len(list))
	for _, location := range list {
		remark := ""
		if location.Remark != nil {
			remark = *location.Remark
		}
		locationList = append(locationList, types.LocationInfo{
			Id:           location.Id,
			WarehouseId:  location.WarehouseId,
			ShelfId:      location.ShelfId,
			LocationCode: location.LocationCode,
			RowNo:        location.RowNo,
			ColNo:        location.ColNo,
			Capacity:     location.Capacity,
			UsedCapacity: location.UsedCapacity,
			Status:       location.Status,
			Remark:       remark,
			CreateTime:   location.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.LocationListResp{
		Total: total,
		List:  locationList,
	}, nil
}
