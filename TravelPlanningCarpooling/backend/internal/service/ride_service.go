package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
	redisPkg "carpooling/pkg/redis"
	"fmt"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

type RideService struct{}

func NewRideService() *RideService {
	return &RideService{}
}

func (s *RideService) CreateRide(ownerID uint64, req *model.CreateRideRequest) (*model.Ride, error) {
	departureTime, err := time.ParseInLocation("2006-01-02 15:04:05", req.DepartureTime, time.Local)
	if err != nil {
		departureTime, err = time.Parse(time.RFC3339, req.DepartureTime)
		if err != nil {
			return nil, fmt.Errorf("无效的时间格式: %v", err)
		}
	}

	ride := &model.Ride{
		OwnerID:        ownerID,
		VehicleID:      req.VehicleID,
		Departure:      req.Departure,
		DepartureLng:   req.DepartureLng,
		DepartureLat:   req.DepartureLat,
		Destination:    req.Destination,
		DestinationLng: req.DestinationLng,
		DestinationLat: req.DestinationLat,
		DepartureTime:  departureTime,
		AvailableSeats: req.AvailableSeats,
		PricePerPerson: req.PricePerPerson,
		Description:    req.Description,
		Status:         1,
	}

	if err := database.DB.Create(ride).Error; err != nil {
		return nil, err
	}

	rdb := redisPkg.Client
	ctx := redisPkg.Ctx
	idStr := strconv.FormatUint(ride.ID, 10)

	rdb.GeoAdd(ctx, "ride:departure", &redis.GeoLocation{
		Longitude: ride.DepartureLng,
		Latitude:  ride.DepartureLat,
		Name:      idStr,
	})
	rdb.GeoAdd(ctx, "ride:destination", &redis.GeoLocation{
		Longitude: ride.DestinationLng,
		Latitude:  ride.DestinationLat,
		Name:      idStr,
	})
	rdb.Set(ctx, fmt.Sprintf("ride:seats:%d", ride.ID), ride.AvailableSeats, 0)

	return ride, nil
}

func (s *RideService) GetRideByID(id uint64) (*model.Ride, error) {
	var ride model.Ride
	if err := database.DB.Preload("Owner").Preload("Vehicle").First(&ride, id).Error; err != nil {
		return nil, err
	}
	return &ride, nil
}

func (s *RideService) ListRides(query *model.RideListQuery) ([]model.Ride, int64, error) {
	page := query.Page
	if page < 1 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize < 1 {
		pageSize = 10
	}

	db := database.DB.Model(&model.Ride{})

	if query.DepartureLng != nil && query.DepartureLat != nil && query.Radius > 0 {
		results, err := redisPkg.Client.GeoRadius(redisPkg.Ctx, "ride:departure", *query.DepartureLng, *query.DepartureLat, &redis.GeoRadiusQuery{
			Radius: query.Radius,
			Unit:   "km",
		}).Result()
		if err != nil {
			return nil, 0, err
		}
		if len(results) == 0 {
			return []model.Ride{}, 0, nil
		}
		var ids []uint64
		for _, r := range results {
			if id, err := strconv.ParseUint(r.Name, 10, 64); err == nil {
				ids = append(ids, id)
			}
		}
		db = db.Where("id IN ?", ids)
	}

	if query.MinPrice != nil {
		db = db.Where("price_per_person >= ?", *query.MinPrice)
	}
	if query.MaxPrice != nil {
		db = db.Where("price_per_person <= ?", *query.MaxPrice)
	}
	if query.MinSeats != nil {
		db = db.Where("available_seats >= ?", *query.MinSeats)
	}
	if query.DepartureAfter != nil {
		db = db.Where("departure_time >= ?", *query.DepartureAfter)
	}
	if query.DepartureBefore != nil {
		db = db.Where("departure_time <= ?", *query.DepartureBefore)
	}
	if query.Status != nil {
		db = db.Where("status = ?", *query.Status)
	}

	var total int64
	db.Count(&total)

	var rides []model.Ride
	offset := (page - 1) * pageSize
	if err := db.Preload("Owner").Preload("Vehicle").Offset(offset).Limit(pageSize).Order("id DESC").Find(&rides).Error; err != nil {
		return nil, 0, err
	}

	return rides, total, nil
}

func (s *RideService) UpdateRideStatus(id, ownerID uint64, status int) error {
	var ride model.Ride
	if err := database.DB.First(&ride, id).Error; err != nil {
		return err
	}
	if ride.OwnerID != ownerID {
		return fmt.Errorf("无权修改此行程")
	}
	return database.DB.Model(&ride).Update("status", status).Error
}

func (s *RideService) GetNearbyRides(lng, lat, radius float64) ([]model.Ride, error) {
	results, err := redisPkg.Client.GeoRadius(redisPkg.Ctx, "ride:departure", lng, lat, &redis.GeoRadiusQuery{
		Radius: radius,
		Unit:   "km",
	}).Result()
	if err != nil {
		return nil, err
	}
	if len(results) == 0 {
		return []model.Ride{}, nil
	}

	var ids []uint64
	for _, r := range results {
		if id, err := strconv.ParseUint(r.Name, 10, 64); err == nil {
			ids = append(ids, id)
		}
	}

	var rides []model.Ride
	if err := database.DB.Preload("Owner").Preload("Vehicle").Where("id IN ?", ids).Find(&rides).Error; err != nil {
		return nil, err
	}
	return rides, nil
}
