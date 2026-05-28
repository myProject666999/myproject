package handler

import (
	"net/http"
	"strconv"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func LocationListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LocationListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewLocationListLogic(r.Context(), svcCtx)
		resp, err := l.LocationList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func LocationDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		location, err := svcCtx.LocationModel.FindOne(id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		resp := types.LocationInfo{
			Id:           location.Id,
			WarehouseId:  location.WarehouseId,
			ShelfId:      location.ShelfId,
			LocationCode: location.LocationCode,
			RowNo:        location.RowNo,
			ColNo:        location.ColNo,
			Capacity:     location.Capacity,
			UsedCapacity: location.UsedCapacity,
			Status:       location.Status,
			Remark:       location.Remark,
			CreateTime:   location.CreateTime.Format("2006-01-02 15:04:05"),
		}
		httpx.OkJsonCtx(r.Context(), w, resp)
	}
}

func LocationCreateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LocationCreateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewLocationCreateLogic(r.Context(), svcCtx)
		resp, err := l.LocationCreate(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func LocationUpdateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LocationUpdateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		location, err := svcCtx.LocationModel.FindOne(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		location.WarehouseId = req.WarehouseId
		location.ShelfId = req.ShelfId
		location.LocationCode = req.LocationCode
		location.RowNo = req.RowNo
		location.ColNo = req.ColNo
		location.Capacity = req.Capacity
		location.UsedCapacity = req.UsedCapacity
		location.Status = req.Status
		location.Remark = req.Remark

		err = svcCtx.LocationModel.Update(location)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "更新成功"})
	}
}

func LocationDeleteHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.LocationDeleteReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		err := svcCtx.LocationModel.Delete(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "删除成功"})
	}
}
