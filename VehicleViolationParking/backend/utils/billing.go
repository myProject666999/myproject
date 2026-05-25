package utils

import (
	"errors"
	"math"
	"time"

	"vehicle-parking/backend/models"
)

func CalculateParkingFee(rule *models.BillingRule, entryTime, exitTime time.Time) (float64, int, error) {
	if rule == nil {
		return 0, 0, errors.New("计费规则不存在")
	}

	duration := exitTime.Sub(entryTime)
	totalMinutes := int(math.Ceil(duration.Minutes()))

	if totalMinutes <= rule.FreeDuration {
		return 0, totalMinutes, nil
	}

	billableMinutes := totalMinutes - rule.FreeDuration

	var fee float64

	if billableMinutes <= rule.BaseDuration {
		fee = rule.BaseFee
	} else {
		fee = rule.BaseFee
		remainingMinutes := billableMinutes - rule.BaseDuration
		units := int(math.Ceil(float64(remainingMinutes) / float64(rule.UnitDuration)))
		fee += float64(units) * rule.UnitFee
	}

	if rule.MaxFee > 0 && fee > rule.MaxFee {
		fee = rule.MaxFee
	}

	return math.Round(fee*100) / 100, totalMinutes, nil
}
