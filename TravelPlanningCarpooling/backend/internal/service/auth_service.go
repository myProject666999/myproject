package service

import (
	"carpooling/internal/middleware"
	"carpooling/internal/model"
	"carpooling/pkg/database"
	"errors"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Register(phone, password, nickname string) (*model.UserResponse, error) {
	var existingUser model.User
	if err := database.DB.Where("phone = ?", phone).First(&existingUser).Error; err == nil {
		return nil, errors.New("该手机号已注册")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	user := model.User{
		Phone:    phone,
		Password: string(hashedPassword),
		Nickname: nickname,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return nil, errors.New("注册失败")
	}

	return s.toUserResponse(&user, ""), nil
}

func (s *AuthService) Login(phone, password string) (*model.UserResponse, error) {
	var user model.User
	if err := database.DB.Where("phone = ?", phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, errors.New("查询失败")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("密码错误")
	}

	token, err := middleware.GenerateToken(user.ID, user.Phone)
	if err != nil {
		return nil, errors.New("生成令牌失败")
	}

	return s.toUserResponse(&user, token), nil
}

func (s *AuthService) GetProfile(userID uint64) (*model.UserResponse, error) {
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, errors.New("查询失败")
	}

	return s.toUserResponse(&user, ""), nil
}

func (s *AuthService) toUserResponse(user *model.User, token string) *model.UserResponse {
	return &model.UserResponse{
		ID:             user.ID,
		Phone:          user.Phone,
		Nickname:       user.Nickname,
		Avatar:         user.Avatar,
		Gender:         user.Gender,
		CreditScore:    user.CreditScore,
		TotalRides:     user.TotalRides,
		CompletedRides: user.CompletedRides,
		Role:           user.Role,
		IsVerified:     user.IsVerified,
		Token:          token,
	}
}
