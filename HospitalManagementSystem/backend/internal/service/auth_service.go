package service

import (
	"errors"

	"hospital-management-system/internal/config"
	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Login(req *model.LoginRequest) (*model.LoginResponse, error) {
	var user model.User
	if err := dao.DB.Preload("Role").Where("username = ?", req.Username).First(&user).Error; err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	if user.Status != 1 {
		return nil, errors.New("用户已被禁用")
	}

	if !util.CheckPassword(req.Password, user.Password) {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := util.GenerateToken(user.ID, user.Username, user.RoleID, config.AppConfig.JWT.Expire)
	if err != nil {
		return nil, errors.New("生成Token失败")
	}

	return &model.LoginResponse{
		Token: token,
		User:  &user,
	}, nil
}

func (s *AuthService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := dao.DB.Preload("Role").Preload("Department").First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
