package logic

import (
	"context"
	"errors"
	"time"

	"wms-server/internal/svc"
	"wms-server/internal/types"
	"wms-server/model"

	"github.com/golang-jwt/jwt/v4"
	"github.com/zeromicro/go-zero/core/logx"
	"golang.org/x/crypto/bcrypt"
)

type LoginLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewLoginLogic(ctx context.Context, svcCtx *svc.ServiceContext) *LoginLogic {
	return &LoginLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *LoginLogic) Login(req *types.LoginReq) (resp *types.LoginResp, err error) {
	userList, err := l.svcCtx.SysUserModel.FindList(1, 1, &model.SysUserQuery{
		Username: req.Username,
	})
	if err != nil {
		return nil, err
	}

	if len(userList) == 0 {
		return nil, errors.New("用户名或密码错误")
	}

	user := userList[0]

	if user.Status != 1 {
		return nil, errors.New("用户已被禁用")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := l.generateToken(user.Id, user.Username)
	if err != nil {
		return nil, err
	}

	return &types.LoginResp{
		Token:    token,
		UserId:   user.Id,
		Username: user.Username,
		RealName: user.RealName,
		Role:     user.Role,
	}, nil
}

func (l *LoginLogic) generateToken(userId int64, username string) (string, error) {
	secret := "wms-secret-key-2024"
	now := time.Now().Unix()
	expire := int64(86400)

	claims := make(jwt.MapClaims)
	claims["exp"] = now + expire
	claims["iat"] = now
	claims["userId"] = userId
	claims["username"] = username

	token := jwt.New(jwt.SigningMethodHS256)
	token.Claims = claims

	return token.SignedString([]byte(secret))
}
