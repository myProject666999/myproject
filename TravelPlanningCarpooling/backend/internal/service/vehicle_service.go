package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
	"errors"

	"gorm.io/gorm"
)

type VehicleService struct{}

func NewVehicleService() *VehicleService {
	return &VehicleService{}
}

func (s *VehicleService) CreateVehicle(ownerID uint64, req *model.CreateVehicleRequest) (*model.Vehicle, error) {
	vehicle := &model.Vehicle{
		OwnerID:      ownerID,
		PlateNumber:  req.PlateNumber,
		Brand:        req.Brand,
		Model:        req.Model,
		Color:        req.Color,
		Seats:        req.Seats,
		VehiclePhoto: req.VehiclePhoto,
	}
	if err := database.GetDB().Create(vehicle).Error; err != nil {
		return nil, err
	}
	return vehicle, nil
}

func (s *VehicleService) GetVehicle(id uint64) (*model.Vehicle, error) {
	var vehicle model.Vehicle
	if err := database.GetDB().First(&vehicle, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("车辆不存在")
		}
		return nil, err
	}
	return &vehicle, nil
}

func (s *VehicleService) ListVehicles(ownerID uint64) ([]model.Vehicle, error) {
	var vehicles []model.Vehicle
	if err := database.GetDB().Where("owner_id = ?", ownerID).Find(&vehicles).Error; err != nil {
		return nil, err
	}
	return vehicles, nil
}

func (s *VehicleService) UpdateVehicle(id, ownerID uint64, req *model.CreateVehicleRequest) (*model.Vehicle, error) {
	var vehicle model.Vehicle
	if err := database.GetDB().First(&vehicle, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("车辆不存在")
		}
		return nil, err
	}
	if vehicle.OwnerID != ownerID {
		return nil, errors.New("无权操作此车辆")
	}
	updates := map[string]interface{}{
		"plate_number":  req.PlateNumber,
		"brand":         req.Brand,
		"model":         req.Model,
		"color":         req.Color,
		"seats":         req.Seats,
		"vehicle_photo": req.VehiclePhoto,
	}
	if err := database.GetDB().Model(&vehicle).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &vehicle, nil
}

func (s *VehicleService) DeleteVehicle(id, ownerID uint64) error {
	var vehicle model.Vehicle
	if err := database.GetDB().First(&vehicle, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("车辆不存在")
		}
		return err
	}
	if vehicle.OwnerID != ownerID {
		return errors.New("无权操作此车辆")
	}
	return database.GetDB().Delete(&vehicle).Error
}
