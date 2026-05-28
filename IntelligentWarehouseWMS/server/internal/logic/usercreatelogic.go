package logic

import (
	"context"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/logx"
	"golang.org/x/crypto/bcrypt"
)

type UserCreateLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewUserCreateLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UserCreateLogic {
	return &UserCreateLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UserCreateLogic) UserCreate(req *types.UserCreateReq) (resp *types.CommonResp, err error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.SysUser{
		Username: req.Username,
		Password: string(hashedPassword),
		RealName: req.RealName,
		Phone:    req.Phone,
		Email:    req.Email,
		Role:     req.Role,
		Status:   req.Status,
		Remark:   req.Remark,
	}

	_, err = l.svcCtx.SysUserModel.Insert(user)
	if err != nil {
		return nil, err
	}

	return &types.CommonResp{
		Code:    0,
		Message: "创建成功",
	}, nil
}
