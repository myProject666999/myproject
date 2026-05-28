package handler

import (
	"net/http"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func InventoryListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.InventoryListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewInventoryListLogic(r.Context(), svcCtx)
		resp, err := l.InventoryList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
