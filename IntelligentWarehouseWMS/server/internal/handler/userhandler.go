package handler

import (
	"net/http"
	"strconv"

	"wms-server/internal/logic"
	"wms-server/internal/svc"
	"wms-server/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func UserListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UserListReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewUserListLogic(r.Context(), svcCtx)
		resp, err := l.UserList(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func UserDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		user, err := svcCtx.SysUserModel.FindOne(id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		resp := types.UserInfo{
			Id:         user.Id,
			Username:   user.Username,
			RealName:   user.RealName,
			Phone:      user.Phone,
			Email:      user.Email,
			Role:       user.Role,
			Status:     user.Status,
			Remark:     user.Remark,
			CreateTime: user.CreateTime.Format("2006-01-02 15:04:05"),
		}
		httpx.OkJsonCtx(r.Context(), w, resp)
	}
}

func UserCreateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UserCreateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := logic.NewUserCreateLogic(r.Context(), svcCtx)
		resp, err := l.UserCreate(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}

func UserUpdateHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UserUpdateReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		user, err := svcCtx.SysUserModel.FindOne(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		user.Username = req.Username
		user.RealName = req.RealName
		user.Phone = req.Phone
		user.Email = req.Email
		user.Role = req.Role
		user.Status = req.Status
		user.Remark = req.Remark

		err = svcCtx.SysUserModel.Update(user)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "更新成功"})
	}
}

func UserDeleteHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UserDeleteReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		err := svcCtx.SysUserModel.Delete(req.Id)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		httpx.OkJsonCtx(r.Context(), w, types.CommonResp{Code: 0, Message: "删除成功"})
	}
}
