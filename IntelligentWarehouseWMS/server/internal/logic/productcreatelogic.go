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
	product := &model.Product{
		Sku:         req.Sku,
		ProductName: req.ProductName,
		Category:    req.Category,
		Spec:        req.Spec,
		Unit:        req.Unit,
		Weight:      req.Weight,
		Volume:      req.Volume,
		MinStock:    req.MinStock,
		MaxStock:    req.MaxStock,
		Status:      req.Status,
		Remark:      req.Remark,
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
