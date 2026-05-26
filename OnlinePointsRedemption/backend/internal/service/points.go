package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"

	"github.com/onlinemall/backend/internal/model"
	"github.com/onlinemall/backend/internal/repository"
)

var ErrDBNotConnected = errors.New("数据库未连接")

type PointsService struct {
	userRepo    *repository.UserRepository
	accountRepo *repository.PointsAccountRepository
	ruleRepo    *repository.PointsRuleRepository
	detailRepo  *repository.PointsDetailRepository
	db          *gorm.DB
	rdb         *redis.Client
}

func NewPointsService(
	userRepo *repository.UserRepository,
	accountRepo *repository.PointsAccountRepository,
	ruleRepo *repository.PointsRuleRepository,
	detailRepo *repository.PointsDetailRepository,
	db *gorm.DB,
	rdb *redis.Client,
) *PointsService {
	return &PointsService{
		userRepo:    userRepo,
		accountRepo: accountRepo,
		ruleRepo:    ruleRepo,
		detailRepo:  detailRepo,
		db:          db,
		rdb:         rdb,
	}
}

func (s *PointsService) checkDB() error {
	if s.db == nil {
		return ErrDBNotConnected
	}
	return nil
}

func (s *PointsService) GetAccount(userID uint64) (*model.PointsAccount, error) {
	return s.accountRepo.GetByUserID(userID)
}

func (s *PointsService) ListRules() ([]model.PointsRule, error) {
	return s.ruleRepo.List()
}

func (s *PointsService) ListDetails(userID uint64, page, pageSize int) ([]model.PointsDetail, int64, error) {
	return s.detailRepo.ListByUserID(userID, page, pageSize)
}

func (s *PointsService) EarnPoints(ctx context.Context, userID uint64, ruleCode string, remark string) error {
	if err := s.checkDB(); err != nil {
		return err
	}

	rule, err := s.ruleRepo.GetByCode(ruleCode)
	if err != nil {
		return fmt.Errorf("规则不存在")
	}
	if rule.Status != 1 {
		return errors.New("规则已禁用")
	}

	if rule.DailyLimit > 0 {
		count, _ := s.detailRepo.CountTodayByRuleCode(userID, ruleCode)
		if count >= int64(rule.DailyLimit) {
			return errors.New("今日已达获取上限")
		}
	}

	err = s.changePoints(ctx, userID, rule.Points, ruleCode, "", remark)
	return err
}

func (s *PointsService) DeductPoints(ctx context.Context, userID uint64, points int32, orderNo, remark string) error {
	if err := s.checkDB(); err != nil {
		return err
	}
	if points <= 0 {
		return errors.New("扣减积分必须大于0")
	}

	err := s.changePoints(ctx, userID, -points, "EXCHANGE_PRODUCT", orderNo, remark)
	return err
}

func (s *PointsService) RefundPoints(ctx context.Context, userID uint64, points int32, orderNo, remark string) error {
	if err := s.checkDB(); err != nil {
		return err
	}
	if points <= 0 {
		return errors.New("退还积分必须大于0")
	}

	err := s.changePoints(ctx, userID, points, "REFUND", orderNo, remark)
	return err
}

func (s *PointsService) changePoints(ctx context.Context, userID uint64, changePoints int32, ruleCode, orderNo, remark string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		account, err := s.accountRepo.GetByUserID(userID)
		if err != nil {
			return errors.New("积分账户不存在")
		}

		balanceBefore := account.AvailablePoints
		balanceAfter := balanceBefore + changePoints

		if balanceAfter < 0 {
			return errors.New("积分余额不足")
		}

		account.AvailablePoints = balanceAfter
		if changePoints > 0 {
			account.TotalPoints += changePoints
		}

		if err := tx.Save(account).Error; err != nil {
			return err
		}

		detail := &model.PointsDetail{
			UserID:        userID,
			RuleCode:      ruleCode,
			ChangePoints:  changePoints,
			BalanceBefore: balanceBefore,
			BalanceAfter:  balanceAfter,
			OrderNo:       orderNo,
			Remark:        remark,
			CreatedAt:     time.Now(),
		}

		if err := tx.Create(detail).Error; err != nil {
			return err
		}

		return nil
	})
}

func (s *PointsService) GetRanking(limit int) ([]map[string]interface{}, error) {
	if err := s.checkDB(); err != nil {
		return nil, err
	}

	type RankingEntry struct {
		UserID      uint64 `gorm:"column:user_id"`
		Nickname    string `gorm:"column:nickname"`
		TotalPoints int32  `gorm:"column:total_points"`
	}

	var results []RankingEntry

	err := s.db.Table("points_account pa").
		Select("pa.user_id, u.nickname, pa.total_points").
		Joins("LEFT JOIN users u ON pa.user_id = u.id").
		Order("pa.total_points DESC").
		Limit(limit).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	ranking := make([]map[string]interface{}, 0)
	for i, r := range results {
		ranking = append(ranking, map[string]interface{}{
			"rank":         i + 1,
			"user_id":      r.UserID,
			"nickname":     r.Nickname,
			"total_points": r.TotalPoints,
		})
	}

	return ranking, nil
}

func (s *PointsService) getUserDailyEarnedPoints(userID uint64) (int32, error) {
	if err := s.checkDB(); err != nil {
		return 0, err
	}
	var total int32
	err := s.db.Model(&model.PointsDetail{}).
		Select("COALESCE(SUM(change_points), 0)").
		Where("user_id = ? AND change_points > 0 AND DATE(created_at) = CURDATE()", userID).
		Scan(&total).Error
	return total, err
}

func (s *PointsService) getDailyRemainingLimit(userID uint64, ruleCode string) (int32, error) {
	rule, err := s.ruleRepo.GetByCode(ruleCode)
	if err != nil {
		return 0, err
	}
	if rule.DailyLimit == 0 {
		return 0, nil
	}

	count, _ := s.detailRepo.CountTodayByRuleCode(userID, ruleCode)
	remaining := int32(rule.DailyLimit) - int32(count)
	if remaining < 0 {
		remaining = 0
	}
	return remaining, nil
}
