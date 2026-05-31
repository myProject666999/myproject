package service

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"online-knowledge-paid/model"
)

type AuthService struct{}

func (s *AuthService) Register(db *gorm.DB, username, email, password string, role int8) (*model.User, error) {
	var count int64
	db.Model(&model.User{}).Where("username = ?", username).Or("email = ?", email).Count(&count)
	if count > 0 {
		return nil, errors.New("username or email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Role:         role,
	}

	if err := db.Create(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) Login(db *gorm.DB, username, password string) (*model.User, error) {
	var user model.User
	if err := db.Where("username = ?", username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid username or password")
		}
		return nil, err
	}

	if user.Status != 1 {
		return nil, errors.New("account is disabled")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid username or password")
	}

	return &user, nil
}

func (s *AuthService) GetUserByID(db *gorm.DB, id uint64) (*model.User, error) {
	var user model.User
	if err := db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}