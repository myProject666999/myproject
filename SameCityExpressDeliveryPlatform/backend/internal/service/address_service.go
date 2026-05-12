package service

import (
	"errors"

	"samecity-express/config"
	"samecity-express/internal/model"
)

type AddressService struct{}

func NewAddressService() *AddressService {
	return &AddressService{}
}

func (s *AddressService) CreateAddress(userID uint, address *model.Address) (*model.Address, error) {
	address.UserID = userID

	if address.IsDefault {
		config.DB.Model(&model.Address{}).Where("user_id = ? AND is_default = ?", userID, true).Update("is_default", false)
	}

	if err := config.DB.Create(address).Error; err != nil {
		return nil, err
	}

	return address, nil
}

func (s *AddressService) UpdateAddress(userID uint, address *model.Address) (*model.Address, error) {
	var existing model.Address
	if err := config.DB.First(&existing, address.ID).Error; err != nil {
		return nil, errors.New("地址不存在")
	}

	if existing.UserID != userID {
		return nil, errors.New("无权修改此地址")
	}

	if address.IsDefault {
		config.DB.Model(&model.Address{}).Where("user_id = ? AND is_default = ? AND id != ?", userID, true, address.ID).Update("is_default", false)
	}

	if err := config.DB.Save(address).Error; err != nil {
		return nil, err
	}

	return address, nil
}

func (s *AddressService) DeleteAddress(userID uint, addressID uint) error {
	var address model.Address
	if err := config.DB.First(&address, addressID).Error; err != nil {
		return errors.New("地址不存在")
	}

	if address.UserID != userID {
		return errors.New("无权删除此地址")
	}

	return config.DB.Delete(&address).Error
}

func (s *AddressService) GetUserAddresses(userID uint) ([]*model.Address, error) {
	var addresses []*model.Address
	if err := config.DB.Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses).Error; err != nil {
		return nil, err
	}
	return addresses, nil
}

func (s *AddressService) GetDefaultAddress(userID uint) (*model.Address, error) {
	var address model.Address
	if err := config.DB.Where("user_id = ? AND is_default = ?", userID, true).First(&address).Error; err != nil {
		if err := config.DB.Where("user_id = ?", userID).Order("created_at DESC").First(&address).Error; err != nil {
			return nil, errors.New("没有保存的地址")
		}
	}
	return &address, nil
}

func (s *AddressService) SetDefaultAddress(userID uint, addressID uint) error {
	var address model.Address
	if err := config.DB.First(&address, addressID).Error; err != nil {
		return errors.New("地址不存在")
	}

	if address.UserID != userID {
		return errors.New("无权操作此地址")
	}

	tx := config.DB.Begin()

	if err := tx.Model(&model.Address{}).Where("user_id = ?", userID).Update("is_default", false).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&address).Update("is_default", true).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Commit()

	return nil
}
