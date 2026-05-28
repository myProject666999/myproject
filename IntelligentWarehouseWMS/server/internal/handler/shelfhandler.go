package handler

import (
	"net/http"
	"strconv"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func ShelfListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ShelfListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewShelfListLogic(r.Context(), svcCtx)
		resp, err := l.ShelfList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func ShelfDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		shelf, err := svcCtx.ShelfModel.FindOne(id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		resp := types.ShelfInfo{
			Id:          shelf.Id,
			WarehouseId: shelf.WarehouseId,
			ShelfCode:   shelf.ShelfCode,
			ShelfName:   shelf.ShelfName,
			Rows:        shelf.Rows,
			Columns:     shelf.Columns,
			Status:      shelf.Status,
			Remark:      shelf.Remark,
			CreateTime:  shelf.CreateTime.Format("2006-01-02 15:04:05"),
		}
		httpx.OkJsonCtx(r.Context(), w, resp)
	}
}

func ShelfCreateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ShelfCreateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewShelfCreateLogic(r.Context(), svcCtx)
		resp, err := l.ShelfCreate(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func ShelfUpdateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ShelfUpdateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		shelf, err := svcCtx.ShelfModel.FindOne(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		shelf.WarehouseId = req.WarehouseId
		shelf.ShelfCode = req.ShelfCode
		shelf.ShelfName = req.ShelfName
		shelf.Rows = req.Rows
		shelf.Columns = req.Columns
		shelf.Status = req.Status
		shelf.Remark = req.Remark

		err = svcCtx.ShelfModel.Update(shelf)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "更新成功"})
	}
}

func ShelfDeleteHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.ShelfDeleteReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		err := svcCtx.ShelfModel.Delete(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "删除成功"})
	}
}
