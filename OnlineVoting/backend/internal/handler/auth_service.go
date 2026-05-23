package handler

import (
	"errors"
	"online-voting/internal/database"
	"online-voting/internal/middleware"
	"online-voting/internal/model"

	"golang.org/x/crypto/bcrypt"
)

func doLogin(username, password string) (string, *model.User, error) {
	var user model.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", nil, errors.New("用户名或密码错误")
	}
	token, err := middleware.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return "", nil, err
	}
	return token, &user, nil
}
