package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type ProductListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewProductListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ProductListLogic {
	return &ProductListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ProductListLogic) ProductList(req *types.ProductListReq) (resp *types.ProductListResp, err error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.ProductQuery{
		Sku:         req.Sku,
		ProductName: req.ProductName,
		Category:    req.Category,
	}
	if req.Status != 0 {
		query.Status = &req.Status
	}

	total, err := l.svcCtx.ProductModel.Count(query)
	if err != nil {
		return nil, err
	}

	list, err := l.svcCtx.ProductModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	productList := make([]types.ProductInfo, 0, len(list))
	for _, product := range list {
		productList = append(productList, types.ProductInfo{
			Id:          product.Id,
			Sku:         product.Sku,
			ProductName: product.ProductName,
			Category:    product.Category,
			Spec:        product.Spec,
			Unit:        product.Unit,
			Weight:      product.Weight,
			Volume:      product.Volume,
			MinStock:    product.MinStock,
			MaxStock:    product.MaxStock,
			Status:      product.Status,
			Remark:      product.Remark,
			CreateTime:  product.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.ProductListResp{
		Total: total,
		List:  productList,
	}, nil
}
