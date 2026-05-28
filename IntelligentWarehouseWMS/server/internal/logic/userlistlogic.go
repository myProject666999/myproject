package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
)

type UserListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserListLogic {
	return &UserListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserListLogic) UserList(req *types.UserListReq) (resp *types.UserListResp, err error) {
	page := int(req.Page)
	pageSize := int(req.PageSize)
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 10
	}

	query := &model.SysUserQuery{
		Username: req.Username,
		RealName: req.RealName,
		Phone:    req.Phone,
		Role:     req.Role,
	}
	if req.Status != 0 {
		query.Status = &req.Status
	}

	total, err := l.svcCtx.SysUserModel.Count(query)
	if err != nil {
		return nil, err
	}

	list, err := l.svcCtx.SysUserModel.FindList(page, pageSize, query)
	if err != nil {
		return nil, err
	}

	userList := make([]types.UserInfo, 0, len(list))
	for _, user := range list {
		email := ""
		if user.Email != nil {
			email = *user.Email
		}
		remark := ""
		if user.Remark != nil {
			remark = *user.Remark
		}
		userList = append(userList, types.UserInfo{
			Id:         user.Id,
			Username:   user.Username,
			RealName:   user.RealName,
			Phone:      user.Phone,
			Email:      email,
			Role:       user.Role,
			Status:     user.Status,
			Remark:     remark,
			CreateTime: user.CreateTime.Format("2006-01-02 15:04:05"),
		})
	}

	return &types.UserListResp{
		Total: total,
		List:  userList,
	}, nil
}
