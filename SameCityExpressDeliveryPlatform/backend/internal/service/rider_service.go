package service

import (
	"errors"

	"samecity-express/config"
	"samecity-express/internal/model"
	"samecity-express/pkg/utils"
)

type RiderService struct{}

func NewRiderService() *RiderService {
	return &RiderService{}
}

func (s *RiderService) Register(username, password, phone, realName, idCard string) (*model.Rider, error) {
	var count int64
	config.DB.Model(&model.Rider{}).Where("username = ? OR phone = ?", username, phone).Count(&count)
	if count > 0 {
		return nil, errors.New("用户名或手机号已存在")
	}

	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	rider := &model.Rider{
		Username:     username,
		Password:     hashedPassword,
		Phone:        phone,
		RealName:     realName,
		IDCard:       idCard,
		Status:       2,
		OnlineStatus: 0,
	}

	if err := config.DB.Create(rider).Error; err != nil {
		return nil, err
	}

	return rider, nil
}

func (s *RiderService) Login(login, password string) (*model.Rider, string, error) {
	var rider model.Rider
	if err := config.DB.Where("username = ? OR phone = ?", login, login).First(&rider).Error; err != nil {
		return nil, "", errors.New("骑手不存在")
	}

	if rider.Status == 3 {
		return nil, "", errors.New("账号已被禁用")
	}

	if rider.Status == 2 {
		return nil, "", errors.New("账号审核中")
	}

	if !utils.CheckPasswordHash(password, rider.Password) {
		return nil, "", errors.New("密码错误")
	}

	token, err := utils.GenerateToken(0, rider.ID, 0, rider.Username, "rider")
	if err != nil {
		return nil, "", err
	}

	return &rider, token, nil
}

func (s *RiderService) GetRiderByID(id uint) (*model.Rider, error) {
	var rider model.Rider
	if err := config.DB.First(&rider, id).Error; err != nil {
		return nil, err
	}
	return &rider, nil
}

func (s *RiderService) UpdateOnlineStatus(id uint, status int) error {
	return config.DB.Model(&model.Rider{}).Where("id = ?", id).Update("online_status", status).Error
}

func (s *RiderService) UpdateLocation(id uint, longitude, latitude float64) error {
	err := config.DB.Model(&model.Rider{}).Where("id = ?", id).Updates(map[string]interface{}{
		"longitude": longitude,
		"latitude":  latitude,
	}).Error
	if err != nil {
		return err
	}

	location := &model.RiderLocation{
		RiderID:   id,
		Longitude: longitude,
		Latitude:  latitude,
	}
	return config.DB.Create(location).Error
}

func (s *RiderService) GetNearbyRiders(longitude, latitude float64, radius float64) ([]*model.Rider, error) {
	var riders []*model.Rider
	err := config.DB.Where("online_status = 1 AND status = 1").Find(&riders).Error
	if err != nil {
		return nil, err
	}

	var nearbyRiders []*model.Rider
	for _, rider := range riders {
		distance := utils.CalculateDistance(latitude, longitude, rider.Latitude, rider.Longitude)
		if distance <= radius {
			nearbyRiders = append(nearbyRiders, rider)
		}
	}

	return nearbyRiders, nil
}

func (s *RiderService) UpdateRating(id uint, rating int) error {
	var rider model.Rider
	if err := config.DB.First(&rider, id).Error; err != nil {
		return err
	}

	totalRating := rider.Rating * float64(rider.RatingCount)
	newRatingCount := rider.RatingCount + 1
	newRating := (totalRating + float64(rating)) / float64(newRatingCount)

	return config.DB.Model(&rider).Updates(map[string]interface{}{
		"rating":       newRating,
		"rating_count": newRatingCount,
	}).Error
}
