package service

import (
	"carpooling/internal/model"
	"carpooling/pkg/database"
	redisPkg "carpooling/pkg/redis"
	"sort"
	"strconv"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type RequestService struct{}

func NewRequestService() *RequestService {
	return &RequestService{}
}

func (s *RequestService) CreateRequest(passengerID uint64, req *model.CreateRideRequestReq) (*model.RideRequest, error) {
	rideRequest := &model.RideRequest{
		PassengerID:     passengerID,
		Departure:       req.Departure,
		DepartureLng:    req.DepartureLng,
		DepartureLat:    req.DepartureLat,
		Destination:     req.Destination,
		DestinationLng:  req.DestinationLng,
		DestinationLat:  req.DestinationLat,
		EarliestTime:    req.EarliestTime,
		LatestTime:      req.LatestTime,
		PassengersCount: req.PassengersCount,
		MaxPrice:        req.MaxPrice,
		Description:     req.Description,
		Status:          1,
	}

	if err := database.GetDB().Create(rideRequest).Error; err != nil {
		return nil, err
	}

	return rideRequest, nil
}

func (s *RequestService) GetRequest(id uint64) (*model.RideRequest, error) {
	var rideRequest model.RideRequest
	if err := database.GetDB().Preload("Passenger").First(&rideRequest, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	return &rideRequest, nil
}

func (s *RequestService) ListRequests(userID uint64, page, pageSize int) ([]model.RideRequest, int64, error) {
	var list []model.RideRequest
	var total int64

	db := database.GetDB().Model(&model.RideRequest{}).Where("passenger_id = ?", userID)

	if err := db.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, 0, err
	}

	return list, total, nil
}

type MatchedRide struct {
	model.Ride
	MatchScore int `json:"match_score"`
}

func (s *RequestService) GetMatchedRides(reqID uint64) ([]MatchedRide, error) {
	rideRequest, err := s.GetRequest(reqID)
	if err != nil {
		return nil, err
	}

	ctx := redisPkg.Ctx
	rdb := redisPkg.GetClient()

	depResults, err := rdb.GeoRadius(ctx, "ride:departure", rideRequest.DepartureLng, rideRequest.DepartureLat, &redis.GeoRadiusQuery{
		Radius:   50,
		Unit:     "km",
		WithDist: true,
		Sort:     "ASC",
	}).Result()
	if err != nil {
		return nil, err
	}

	destResults, err := rdb.GeoRadius(ctx, "ride:destination", rideRequest.DestinationLng, rideRequest.DestinationLat, &redis.GeoRadiusQuery{
		Radius:   50,
		Unit:     "km",
		WithDist: true,
		Sort:     "ASC",
	}).Result()
	if err != nil {
		return nil, err
	}

	depMap := make(map[string]float64)
	for _, loc := range depResults {
		depMap[loc.Name] = loc.Dist
	}

	type matchCandidate struct {
		RideID   uint64
		DepDist  float64
		DestDist float64
	}

	var candidates []matchCandidate
	for _, loc := range destResults {
		if depDist, ok := depMap[loc.Name]; ok {
			id, _ := strconv.ParseUint(loc.Name, 10, 64)
			candidates = append(candidates, matchCandidate{
				RideID:   id,
				DepDist:  depDist,
				DestDist: loc.Dist,
			})
		}
	}

	if len(candidates) == 0 {
		return []MatchedRide{}, nil
	}

	var rideIDs []uint64
	for _, c := range candidates {
		rideIDs = append(rideIDs, c.RideID)
	}

	var rides []model.Ride
	if err := database.GetDB().Preload("Owner").Preload("Vehicle").Where("id IN ? AND status = 1", rideIDs).Find(&rides).Error; err != nil {
		return nil, err
	}

	candidateMap := make(map[uint64]matchCandidate)
	for _, c := range candidates {
		candidateMap[c.RideID] = c
	}

	var filteredRides []MatchedRide
	for i := range rides {
		if rides[i].DepartureTime.Before(rideRequest.EarliestTime) || rides[i].DepartureTime.After(rideRequest.LatestTime) {
			continue
		}

		if rideRequest.MaxPrice > 0 && rides[i].PricePerPerson > rideRequest.MaxPrice {
			continue
		}

		if rides[i].AvailableSeats-rides[i].LockedSeats < rideRequest.PassengersCount {
			continue
		}

		c := candidateMap[rides[i].ID]
		score := calcMatchScore(c.DepDist, c.DestDist)

		filteredRides = append(filteredRides, MatchedRide{
			Ride:       rides[i],
			MatchScore: score,
		})
	}

	sort.Slice(filteredRides, func(i, j int) bool {
		return filteredRides[i].MatchScore > filteredRides[j].MatchScore
	})

	return filteredRides, nil
}

func calcMatchScore(depDist, destDist float64) int {
	score := 100 - (depDist+destDist)*2
	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}
	return int(score)
}
