package handler

import (
	"net/http"
	"strconv"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func WarehouseListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.WarehouseListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewWarehouseListLogic(r.Context(), svcCtx)
		resp, err := l.WarehouseList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func WarehouseDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		warehouse, err := svcCtx.WarehouseModel.FindOne(id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		resp := types.WarehouseInfo{
			Id:            warehouse.Id,
			WarehouseCode: warehouse.WarehouseCode,
			WarehouseName: warehouse.WarehouseName,
			Address:       warehouse.Address,
			Manager:       warehouse.Manager,
			Phone:         warehouse.Phone,
			Status:        warehouse.Status,
			Remark:        warehouse.Remark,
			CreateTime:    warehouse.CreateTime.Format("2006-01-02 15:04:05"),
		}
		httpx.OkJsonCtx(r.Context(), w, resp)
	}
}

func WarehouseCreateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.WarehouseCreateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewWarehouseCreateLogic(r.Context(), svcCtx)
		resp, err := l.WarehouseCreate(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func WarehouseUpdateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.WarehouseUpdateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		warehouse, err := svcCtx.WarehouseModel.FindOne(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		warehouse.WarehouseCode = req.WarehouseCode
		warehouse.WarehouseName = req.WarehouseName
		warehouse.Address = req.Address
		warehouse.Manager = req.Manager
		warehouse.Phone = req.Phone
		warehouse.Status = req.Status
		warehouse.Remark = req.Remark

		err = svcCtx.WarehouseModel.Update(warehouse)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "更新成功"})
	}
}

func WarehouseDeleteHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.WarehouseDeleteReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		err := svcCtx.WarehouseModel.Delete(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "删除成功"})
	}
}
