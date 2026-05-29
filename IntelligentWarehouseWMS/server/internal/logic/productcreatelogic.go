package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type ProductCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewProductCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ProductCreateLogic {
	return &ProductCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ProductCreateLogic) ProductCreate(req *types.ProductCreateReq) (resp *types.CommonResp, err error) {
	category := req.Category
	spec := req.Spec
	weight := req.Weight
	volume := req.Volume
	remark := req.Remark
	product := &model.Product{
		Sku:         req.Sku,
		ProductName: req.ProductName,
		Category:    &category,
		Spec:        &spec,
		Unit:        req.Unit,
		Weight:      &weight,
		Volume:      &volume,
		MinStock:    req.MinStock,
		MaxStock:    req.MaxStock,
		Status:      req.Status,
		Remark:      &remark,
	}

	_, err = l.svcCtx.ProductModel.Insert(product)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "创建成功",
	}, nil
}
