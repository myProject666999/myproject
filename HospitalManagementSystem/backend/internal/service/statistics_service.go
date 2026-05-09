package service

import (
	"time"

	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"
)

type StatisticsService struct{}

func NewStatisticsService() *StatisticsService {
	return &StatisticsService{}
}

func (s *StatisticsService) GetWorkloadStatistics(startDate, endDate string, departmentID uint, doctorID uint) ([]model.WorkloadStatistic, error) {
	var statistics []model.WorkloadStatistic
	query := dao.DB.Preload("Doctor").Preload("Department")

	if startDate != "" {
		query = query.Where("date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date <= ?", endDate)
	}
	if departmentID > 0 {
		query = query.Where("department_id = ?", departmentID)
	}
	if doctorID > 0 {
		query = query.Where("doctor_id = ?", doctorID)
	}

	if err := query.Order("date DESC").Find(&statistics).Error; err != nil {
		return nil, err
	}

	return statistics, nil
}

func (s *StatisticsService) CreateDailySettlement(operatorID uint) (*model.DailySettlement, error) {
	tx := dao.DB.Begin()

	today := time.Now().Format("2006-01-02")

	var existing model.DailySettlement
	if err := tx.Where("settlement_date = ?", today).First(&existing).Error; err == nil {
		tx.Rollback()
		return nil, nil
	}

	var registrationCount int64
	var registrationIncome float64
	tx.Model(&model.FeeItem{}).
		Where("item_type = 1 AND DATE(created_at) = ? AND status = 2", today).
		Count(&registrationCount).
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&registrationIncome)

	var chargeCount int64
	var chargeIncome float64
	tx.Model(&model.FeeItem{}).
		Where("item_type != 1 AND DATE(created_at) = ? AND status = 2", today).
		Count(&chargeCount).
		Select("COALESCE(SUM(total_price), 0)").
		Scan(&chargeIncome)

	settlement := model.DailySettlement{
		SettlementNo:            util.GenerateNo("SETT"),
		SettlementDate:          today,
		OperatorID:              operatorID,
		TotalRegistrationCount:  int(registrationCount),
		TotalRegistrationIncome: registrationIncome,
		TotalChargeCount:        int(chargeCount),
		TotalChargeIncome:       chargeIncome,
		TotalIncome:             registrationIncome + chargeIncome,
		Status:                  1,
	}

	if err := tx.Create(&settlement).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	tx.Commit()
	return &settlement, nil
}

func (s *StatisticsService) GetDailySettlements(startDate, endDate string) ([]model.DailySettlement, error) {
	var settlements []model.DailySettlement
	query := dao.DB

	if startDate != "" {
		query = query.Where("settlement_date >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("settlement_date <= ?", endDate)
	}

	if err := query.Order("settlement_date DESC").Find(&settlements).Error; err != nil {
		return nil, err
	}

	return settlements, nil
}

func (s *StatisticsService) GetTodayOverview() (map[string]interface{}, error) {
	today := time.Now().Format("2006-01-02")

	var totalPatients int64
	dao.DB.Model(&model.Registration{}).Where("DATE(registered_at) = ?", today).Count(&totalPatients)

	var totalIncome float64
	dao.DB.Model(&model.FeeItem{}).
		Where("DATE(created_at) = ? AND status = 2", today).
		Select("COALESCE(SUM(total_price), 0)").Scan(&totalIncome)

	var pendingCount int64
	dao.DB.Model(&model.Registration{}).Where("status = 1").Count(&pendingCount)

	var diagnosisCount int64
	dao.DB.Model(&model.Registration{}).Where("DATE(registered_at) = ? AND status = 2", today).Count(&diagnosisCount)

	return map[string]interface{}{
		"total_patients":   totalPatients,
		"total_income":     totalIncome,
		"pending_count":    pendingCount,
		"diagnosis_count":  diagnosisCount,
	}, nil
}
