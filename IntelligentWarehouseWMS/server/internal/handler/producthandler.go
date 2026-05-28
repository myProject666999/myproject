package handler

import (
	"net/http"
	"strconv"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func ProductListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ProductListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewProductListLogic(r.Context(), svcCtx)
		resp, err := l.ProductList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func ProductDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		product, err := svcCtx.ProductModel.FindOne(id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		resp := types.ProductInfo{
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
		}
		httpx.OkJsonCtx(r.Context(), w, resp)
	}
}

func ProductCreateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ProductCreateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewProductCreateLogic(r.Context(), svcCtx)
		resp, err := l.ProductCreate(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func ProductUpdateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ProductUpdateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		product, err := svcCtx.ProductModel.FindOne(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		product.Sku = req.Sku
		product.ProductName = req.ProductName
		product.Category = req.Category
		product.Spec = req.Spec
		product.Unit = req.Unit
		product.Weight = req.Weight
		product.Volume = req.Volume
		product.MinStock = req.MinStock
		product.MaxStock = req.MaxStock
		product.Status = req.Status
		product.Remark = req.Remark

		err = svcCtx.ProductModel.Update(product)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "更新成功"})
	}
}

func ProductDeleteHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ProductDeleteReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		err := svcCtx.ProductModel.Delete(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "删除成功"})
	}
}
