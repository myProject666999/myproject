package services

import (
	"mooc-platform/models"

	"gorm.io/gorm"
)

type UserService struct {
	DB *gorm.DB
}

func NewUserService(db *gorm.DB) *UserService {
	return &UserService{DB: db}
}

func (s *UserService) Create(user *models.User) error {
	return s.DB.Create(user).Error
}

func (s *UserService) GetByID(id uint64) (*models.User, error) {
	var user models.User
	err := s.DB.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := s.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *UserService) Update(user *models.User) error {
	return s.DB.Save(user).Error
}

func (s *UserService) Login(account, password string) (*models.User, error) {
	var user models.User
	if err := s.DB.Where("username = ? OR email = ?", account, account).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
