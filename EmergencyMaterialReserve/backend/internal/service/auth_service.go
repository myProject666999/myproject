package service

import (
	"context"
	"errors"
	"fmt"

	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"emergency-material/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (s *AuthService) Login(ctx context.Context, req *LoginRequest) (*LoginResponse, error) {
	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户名或密码错误")
		}
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}

	if user.Status != 1 {
		return nil, errors.New("账号已被禁用")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("用户名或密码错误")
	}

	token, err := jwt.GenerateToken(user.ID, user.Username, user.Role)
	if err != nil {
		return nil, fmt.Errorf("生成token失败: %w", err)
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := s.logOperation(ctx, tx, user.ID, user.Username, "auth", "login", user.Username, user.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	user.Password = ""
	return &LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, userID uint64, username string) error {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := s.logOperation(ctx, tx, userID, username, "auth", "logout", username, userID, 1, ""); err != nil {
		tx.Rollback()
		return fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return err
	}

	return nil
}

func (s *AuthService) GetUserInfo(ctx context.Context, userID uint64) (*models.User, error) {
	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("用户不存在")
		}
		return nil, fmt.Errorf("查询用户失败: %w", err)
	}
	user.Password = ""
	return &user, nil
}

func (s *AuthService) logOperation(ctx context.Context, db *gorm.DB, userID uint64, username, module, operation, bizNo string, bizID uint64, status int8, errorMsg string) error {
	log := &models.OperationLog{
		UserID:    &userID,
		Username:  username,
		Module:    module,
		Operation: operation,
		BizID:     &bizID,
		BizNo:     bizNo,
		Status:    status,
		ErrorMsg:  &errorMsg,
	}
	return db.Create(log).Error
}
