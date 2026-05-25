package scheduler

import (
	"database/sql"
	"fmt"
	"time"

	"smart-customer-service/internal/svc"

	"github.com/robfig/cron/v3"
	"github.com/zeromicro/go-zero/core/logx"
)

type SLAScheduler struct {
	svcCtx *svc.ServiceContext
	cron   *cron.Cron
}

func NewSLAScheduler(svcCtx *svc.ServiceContext) *SLAScheduler {
	return &SLAScheduler{
		svcCtx: svcCtx,
		cron:   cron.New(cron.WithSeconds()),
	}
}

func (s *SLAScheduler) Start() {
	s.cron.AddFunc("*/30 * * * * *", s.checkResponseTimeout)
	s.cron.AddFunc("*/60 * * * * *", s.checkResolveTimeout)
	s.cron.AddFunc("0 0 2 * * *", s.updateAgentWorkloadDaily)
	s.cron.Start()

	logx.Info("SLA Scheduler started")
}

func (s *SLAScheduler) checkResponseTimeout() {
	logx.Info("Checking response timeout...")

	now := time.Now()
	rows, err := s.svcCtx.DB.Query(`
		SELECT id, ticket_no, response_timeout_at, customer_id
		FROM ticket
		WHERE status_code IN ('pending', 'assigned')
			AND response_timeout_at IS NOT NULL
			AND response_timeout_at <= ?
			AND is_timeout_warned = 0
			AND deleted_at IS NULL
	`, now)
	if err != nil {
		logx.Errorf("Query response timeout error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		var ticketNo string
		var timeoutAt time.Time
		var customerId int64

		rows.Scan(&id, &ticketNo, &timeoutAt, &customerId)

		tx, err := s.svcCtx.DB.Begin()
		if err != nil {
			continue
		}

		_, err = tx.Exec(`UPDATE ticket SET is_timeout_warned = 1 WHERE id = ?`, id)
		if err != nil {
			tx.Rollback()
			continue
		}

		_, err = tx.Exec(`INSERT INTO sla_warning (ticket_id, warning_type, warned_at) VALUES (?, 1, ?)`, id, now)
		if err != nil {
			tx.Rollback()
			continue
		}

		_, err = tx.Exec(`INSERT INTO notification (user_id, type, title, content, related_id, created_at) VALUES (?, 'ticket_timeout', ?, ?, ?, ?)`,
			customerId, fmt.Sprintf("工单%s响应超时", ticketNo), fmt.Sprintf("工单%s已超过响应时间，请及时处理", ticketNo), id, now)
		if err != nil {
			tx.Rollback()
			continue
		}

		tx.Commit()

		logx.Infof("Ticket %d response timeout warning sent", id)
	}
}

func (s *SLAScheduler) checkResolveTimeout() {
	logx.Info("Checking resolve timeout...")

	now := time.Now()
	rows, err := s.svcCtx.DB.Query(`
		SELECT id, ticket_no, resolve_timeout_at, assignee_id
		FROM ticket
		WHERE status_code = 'processing'
			AND resolve_timeout_at IS NOT NULL
			AND resolve_timeout_at <= ?
			AND is_timeout_warned = 0
			AND deleted_at IS NULL
	`, now)
	if err != nil {
		logx.Errorf("Query resolve timeout error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		var ticketNo string
		var timeoutAt time.Time
		var assigneeId sql.NullInt64

		rows.Scan(&id, &ticketNo, &timeoutAt, &assigneeId)

		tx, err := s.svcCtx.DB.Begin()
		if err != nil {
			continue
		}

		_, err = tx.Exec(`UPDATE ticket SET is_timeout_warned = 1 WHERE id = ?`, id)
		if err != nil {
			tx.Rollback()
			continue
		}

		_, err = tx.Exec(`INSERT INTO sla_warning (ticket_id, warning_type, warned_at) VALUES (?, 2, ?)`, id, now)
		if err != nil {
			tx.Rollback()
			continue
		}

		if assigneeId.Valid {
			_, err = tx.Exec(`INSERT INTO notification (user_id, type, title, content, related_id, created_at) VALUES (?, 'ticket_timeout', ?, ?, ?, ?)`,
				assigneeId.Int64, fmt.Sprintf("工单%s解决超时", ticketNo), fmt.Sprintf("工单%s已超过解决时间，请及时处理", ticketNo), id, now)
			if err != nil {
				tx.Rollback()
				continue
			}
		}

		tx.Commit()

		logx.Infof("Ticket %d resolve timeout warning sent", id)
	}
}

func (s *SLAScheduler) updateAgentWorkloadDaily() {
	logx.Info("Updating agent workload...")

	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	rows, err := s.svcCtx.DB.Query(`
		SELECT id, real_name FROM user WHERE role = 2 AND status = 1 AND deleted_at IS NULL
	`)
	if err != nil {
		logx.Errorf("Query agents error: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var agentId int64
		var agentName string
		rows.Scan(&agentId, &agentName)

		var ticketCount int
		var resolvedCount int
		var avgResponseTime float64
		var avgResolveTime float64

		s.svcCtx.DB.QueryRow(`
			SELECT COUNT(*) FROM ticket WHERE assignee_id = ? AND DATE(created_at) = ?
		`, agentId, yesterday).Scan(&ticketCount)

		s.svcCtx.DB.QueryRow(`
			SELECT COUNT(*) FROM ticket WHERE assignee_id = ? AND status_code = 'resolved' AND DATE(resolved_at) = ?
		`, agentId, yesterday).Scan(&resolvedCount)

		s.svcCtx.DB.QueryRow(`
			SELECT IFNULL(AVG(TIMESTAMPDIFF(SECOND, created_at, first_response_at)), 0)
			FROM ticket WHERE assignee_id = ? AND first_response_at IS NOT NULL AND DATE(created_at) = ?
		`, agentId, yesterday).Scan(&avgResponseTime)

		s.svcCtx.DB.QueryRow(`
			SELECT IFNULL(AVG(TIMESTAMPDIFF(SECOND, created_at, resolved_at)), 0)
			FROM ticket WHERE assignee_id = ? AND resolved_at IS NOT NULL AND DATE(resolved_at) = ?
		`, agentId, yesterday).Scan(&avgResolveTime)

		s.svcCtx.DB.Exec(`
			INSERT INTO agent_workload (agent_id, date, ticket_count, resolved_count, avg_response_time, avg_resolve_time, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
			ON DUPLICATE KEY UPDATE
				resolved_count = VALUES(resolved_count),
				avg_response_time = VALUES(avg_response_time),
				avg_resolve_time = VALUES(avg_resolve_time),
				updated_at = NOW()
		`, agentId, today, ticketCount, resolvedCount, avgResponseTime, avgResolveTime)

		logx.Infof("Agent %d workload updated: %d tickets, %d resolved", agentId, ticketCount, resolvedCount)
	}
}
