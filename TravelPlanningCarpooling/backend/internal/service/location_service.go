package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
)

type LocationService struct{}

func NewLocationService() *LocationService {
	return &LocationService{}
}

func (s *LocationService) ReportLocation(userID uint64, req *model.ReportLocationRequest) error {
	locationShare := &model.LocationShare{
		RideID:  req.RideID,
		UserID:  userID,
		Lng:     req.Lng,
		Lat:     req.Lat,
		Speed:   req.Speed,
		Heading: req.Heading,
	}

	if err := database.GetDB().Create(locationShare).Error; err != nil {
		return err
	}

	return nil
}

func (s *LocationService) GetRideLocations(rideID uint64) ([]model.LocationShare, error) {
	var locations []model.LocationShare
	if err := database.GetDB().Where("ride_id = ?", rideID).
		Order("created_at DESC").
		Limit(100).
		Find(&locations).Error; err != nil {
		return nil, err
	}

	return locations, nil
}
