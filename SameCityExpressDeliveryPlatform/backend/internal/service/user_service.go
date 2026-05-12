package service

import (
	"errors"

	"samecity-express/config"
	"samecity-express/internal/model"
	"samecity-express/pkg/utils"
)

type UserService struct{}

func NewUserService() *UserService {
	return &UserService{}
}

func (s *UserService) Register(username, password, phone, nickname string) (*model.User, error) {
	var count int64
	config.DB.Model(&model.User{}).Where("username = ? OR phone = ?", username, phone).Count(&count)
	if count > 0 {
		return nil, errors.New("用户名或手机号已存在")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username: username,
		Password: hashedPassword,
		Phone:    phone,
		Nickname: nickname,
		Status:   1,
	}

	if err := config.DB.Create(user).Error; err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) Login(login, password string) (*model.User, string, error) {
	var user model.User
	if err := config.DB.Where("username = ? OR phone = ?", login, login).First(&user).Error; err != nil {
		return nil, "", errors.New("用户不存在")
	}

	if user.Status != 1 {
		return nil, "", errors.New("账号已被禁用")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, "", errors.New("密码错误")
	}

	token, err := utils.GenerateToken(user.ID, 0, 0, user.Username, "user")
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

func (s *UserService) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := config.DB.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) UpdateProfile(id uint, data map[string]interface{}) (*model.User, error) {
	if _, err := s.GetUserByID(id); err != nil {
		return nil, err
	}

	if err := config.DB.Model(&model.User{}).Where("id = ?", id).Updates(data).Error; err != nil {
		return nil, err
	}

	return s.GetUserByID(id)
}

func (s *UserService) ChangePassword(id uint, oldPassword, newPassword string) error {
	user, err := s.GetUserByID(id)
	if err != nil {
		return err
	}

	if !utils.CheckPasswordHash(oldPassword, user.Password) {
		return errors.New("原密码错误")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	return config.DB.Model(user).Update("password", hashedPassword).Error
}
