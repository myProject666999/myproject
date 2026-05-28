package service

import (
	"encoding/json"
	"fmt"
	"math"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"time"
)

type ShareCalculationService struct{}

func NewShareCalculationService() *ShareCalculationService {
	return &ShareCalculationService{}
}

type ProfitShareRuleDSL struct {
	BaseRatio        float64            `json:"base_ratio"`
	PlatformRatio    float64            `json:"platform_ratio,omitempty"`
	TieredRules      []TieredRule       `json:"tiered_rules,omitempty"`
	StakeholderRatio map[string]float64 `json:"stakeholder_ratio,omitempty"`
	MinPayout        float64            `json:"min_payout,omitempty"`
	MaxPayout        float64            `json:"max_payout,omitempty"`
}

type TieredRule struct {
	Threshold     float64 `json:"threshold"`
	Ratio         float64 `json:"ratio"`
	ThresholdType string  `json:"threshold_type"`
}

func (s *ShareCalculationService) CalculateShare(dramaID uint64, settlementPeriod string, taskType int8) (string, error) {
	idempotentKey := utils.GenerateIdempotentKey(
		fmt.Sprintf("%d", dramaID),
		settlementPeriod,
		fmt.Sprintf("%d", taskType),
	)

	var existingTask model.ShareCalculationTask
	result := dao.DB.Where("idempotent_key = ?", idempotentKey).First(&existingTask)

	if result.Error == nil {
		if existingTask.Status == 2 {
			return existingTask.TaskNo, nil
		}
		if existingTask.Status == 1 {
			return "", fmt.Errorf("任务正在处理中")
		}
	}

	task := &model.ShareCalculationTask{
		TaskNo:           utils.GenerateNo("TASK"),
		DramaID:          dramaID,
		SettlementPeriod: settlementPeriod,
		TaskType:         taskType,
		Status:           1,
		IdempotentKey:    idempotentKey,
	}

	if result.Error != nil {
		if err := dao.DB.Create(task).Error; err != nil {
			return "", fmt.Errorf("创建任务失败: %w", err)
		}
	} else {
		dao.DB.Model(&existingTask).Updates(map[string]interface{}{
			"status":      1,
			"retry_count": existingTask.RetryCount + 1,
		})
		task = &existingTask
	}

	defer func() {
		if r := recover(); r != nil {
			dao.DB.Model(task).Updates(map[string]interface{}{
				"status":        3,
				"error_message": fmt.Sprintf("panic: %v", r),
			})
		}
	}()

	details, err := s.performCalculation(task)
	if err != nil {
		dao.DB.Model(task).Updates(map[string]interface{}{
			"status":        3,
			"error_message": err.Error(),
		})
		return "", err
	}

	for _, detail := range details {
		dao.DB.Create(detail)
	}

	dao.DB.Model(task).Updates(map[string]interface{}{
		"status":      2,
		"finished_at": time.Now(),
	})

	return task.TaskNo, nil
}

func (s *ShareCalculationService) performCalculation(task *model.ShareCalculationTask) ([]*model.ShareDetail, error) {
	var details []*model.ShareDetail

	startDate, endDate := s.getPeriodDateRange(task.SettlementPeriod)

	var dramaRights []model.DramaRight
	dao.DB.Where("drama_id = ? AND is_active = 1", task.DramaID).Find(&dramaRights)

	if len(dramaRights) == 0 {
		return nil, fmt.Errorf("剧集没有配置权益方")
	}

	var rule model.ProfitShareRule
	dao.DB.Joins("JOIN drama_rule_relations ON drama_rule_relations.rule_id = profit_share_rules.id").
		Where("drama_rule_relations.drama_id = ? AND profit_share_rules.status = 1", task.DramaID).
		Order("profit_share_rules.priority DESC").
		First(&rule)

	if rule.ID == 0 {
		return nil, fmt.Errorf("剧集没有配置分账规则")
	}

	var dsl ProfitShareRuleDSL
	if err := json.Unmarshal([]byte(rule.DSLContent), &dsl); err != nil {
		return nil, fmt.Errorf("解析规则DSL失败: %w", err)
	}

	var totalPlayRevenue float64
	var totalPaymentRevenue float64

	if task.TaskType == 1 || task.TaskType == 3 {
		var playData []model.PlayData
		dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ? AND status = 1",
			task.DramaID, startDate, endDate).Find(&playData)

		for _, pd := range playData {
			totalPlayRevenue += float64(pd.PlayCount) * 0.01
		}
	}

	if task.TaskType == 2 || task.TaskType == 3 {
		var paymentData []model.PaymentData
		dao.DB.Where("drama_id = ? AND data_date >= ? AND data_date <= ? AND status = 1",
			task.DramaID, startDate, endDate).Find(&paymentData)

		for _, pd := range paymentData {
			totalPaymentRevenue += pd.PaymentAmount
		}
	}

	shareRatio := s.calculateRatio(totalPlayRevenue+totalPaymentRevenue, dsl)

	var shareDetails []*model.ShareDetail
	var totalShareAmount float64

	for _, right := range dramaRights {
		var revenueType int8
		var totalRevenue float64

		if task.TaskType == 1 || task.TaskType == 3 {
			revenueType = 1
			totalRevenue = totalPlayRevenue
			detailAmount := s.roundToTwoDecimals(totalRevenue * shareRatio * right.BaseRatio / 10000)

			detail := &model.ShareDetail{
				DetailNo:         utils.GenerateNo("SD"),
				TaskID:           task.ID,
				DramaID:          task.DramaID,
				StakeholderID:    right.StakeholderID,
				SettlementPeriod: task.SettlementPeriod,
				RevenueType:      revenueType,
				TotalRevenue:     totalRevenue,
				ShareRatio:       shareRatio * right.BaseRatio / 100,
				ShareAmount:      detailAmount,
				RuleID:           rule.ID,
				CalculationLog:   fmt.Sprintf("播放收入:%.2f * 规则比例:%.4f%% * 权益比例:%.4f%% = %.2f", totalRevenue, shareRatio, right.BaseRatio, detailAmount),
			}
			shareDetails = append(shareDetails, detail)
			totalShareAmount += detailAmount
		}

		if task.TaskType == 2 || task.TaskType == 3 {
			revenueType = 2
			totalRevenue = totalPaymentRevenue
			detailAmount := s.roundToTwoDecimals(totalRevenue * shareRatio * right.BaseRatio / 10000)

			detail := &model.ShareDetail{
				DetailNo:         utils.GenerateNo("SD"),
				TaskID:           task.ID,
				DramaID:          task.DramaID,
				StakeholderID:    right.StakeholderID,
				SettlementPeriod: task.SettlementPeriod,
				RevenueType:      revenueType,
				TotalRevenue:     totalRevenue,
				ShareRatio:       shareRatio * right.BaseRatio / 100,
				ShareAmount:      detailAmount,
				RuleID:           rule.ID,
				CalculationLog:   fmt.Sprintf("付费收入:%.2f * 规则比例:%.4f%% * 权益比例:%.4f%% = %.2f", totalRevenue, shareRatio, right.BaseRatio, detailAmount),
			}
			shareDetails = append(shareDetails, detail)
			totalShareAmount += detailAmount
		}
	}

	details = s.handleTailDiff(shareDetails, totalPlayRevenue+totalPaymentRevenue, shareRatio)

	return details, nil
}

func (s *ShareCalculationService) calculateRatio(totalRevenue float64, dsl ProfitShareRuleDSL) float64 {
	if len(dsl.TieredRules) == 0 {
		return dsl.BaseRatio
	}

	for i := len(dsl.TieredRules) - 1; i >= 0; i-- {
		rule := dsl.TieredRules[i]
		if totalRevenue >= rule.Threshold {
			return rule.Ratio
		}
	}

	return dsl.BaseRatio
}

func (s *ShareCalculationService) handleTailDiff(details []*model.ShareDetail, totalRevenue float64, ruleRatio float64) []*model.ShareDetail {
	var calculatedTotal float64
	for _, d := range details {
		calculatedTotal += d.ShareAmount
	}

	expectedTotal := totalRevenue * ruleRatio / 100
	tailDiff := s.roundToTwoDecimals(expectedTotal - calculatedTotal)

	if math.Abs(tailDiff) > 0.001 && len(details) > 0 {
		details[0].ShareAmount = s.roundToTwoDecimals(details[0].ShareAmount + tailDiff)
		details[0].CalculationLog += fmt.Sprintf(" (尾差调整:%.2f)", tailDiff)
	}

	return details
}

func (s *ShareCalculationService) roundToTwoDecimals(value float64) float64 {
	return math.Round(value*100) / 100
}

func (s *ShareCalculationService) getPeriodDateRange(period string) (time.Time, time.Time) {
	t, _ := time.Parse("200601", period)
	startDate := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, -1)
	return startDate, endDate
}
