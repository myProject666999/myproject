package dao

import (
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/database"
	"errors"

	"golang.org/x/crypto/bcrypt"
)

func Login(req *model.LoginReq) (*model.LoginResp, error) {
	var admin model.Admin
	err := database.DB.Where("username = ? AND status = ?", req.Username, model.UserStatusNormal).
		First(&admin).Error
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	err = bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("invalid username or password")
	}

	realName := ""
	if admin.RealName != nil {
		realName = *admin.RealName
	}

	token := "mock_token_" + req.Username

	return &model.LoginResp{
		Token:    token,
		UserID:   admin.ID,
		Username: admin.Username,
		RealName: realName,
		Role:     admin.Role,
	}, nil
}

func GetAdminByID(id uint64) (*model.Admin, error) {
	var admin model.Admin
	err := database.DB.Where("id = ?", id).First(&admin).Error
	if err != nil {
		return nil, err
	}
	return &admin, nil
}

func GetUserList(page, pageSize int, keyword string) ([]model.User, int64, error) {
	var list []model.User
	var total int64

	query := database.DB.Model(&model.User{})
	if keyword != "" {
		query = query.Where("phone LIKE ? OR nickname LIKE ? OR real_name LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&list).Error

	return list, total, err
}

func GetUserByID(id uint64) (*model.User, error) {
	var user model.User
	err := database.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}
