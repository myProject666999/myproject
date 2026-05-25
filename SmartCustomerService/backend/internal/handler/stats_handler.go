package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"smart-customer-service/internal/svc"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetStatsOverviewHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, _, role := ParseUserFromContext(r)

		var stats struct {
			TotalTickets     int64   `json:"totalTickets"`
			PendingTickets   int64   `json:"pendingTickets"`
			ProcessingTickets int64 `json:"processingTickets"`
			ResolvedTickets  int64   `json:"resolvedTickets"`
			ClosedTickets    int64   `json:"closedTickets"`
			TodayNewTickets  int64   `json:"todayNewTickets"`
			TodayResolved    int64   `json:"todayResolved"`
			AvgResponseTime  float64 `json:"avgResponseTime"`
			AvgResolveTime   float64 `json:"avgResolveTime"`
			ResolutionRate   float64 `json:"resolutionRate"`
		}

		where := " WHERE deleted_at IS NULL"
		if role == 1 {
			where += " AND customer_id = 0"
		}

		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where).Scan(&stats.TotalTickets)
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND status_code = 'pending'").Scan(&stats.PendingTickets)
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND status_code IN ('processing', 'waiting_customer')").Scan(&stats.ProcessingTickets)
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND status_code = 'resolved'").Scan(&stats.ResolvedTickets)
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND status_code = 'closed'").Scan(&stats.ClosedTickets)

		today := time.Now().Format("2006-01-02")
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND DATE(created_at) = ?", today).Scan(&stats.TodayNewTickets)
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket"+where+" AND status_code IN ('resolved', 'closed') AND DATE(resolved_at) = ?", today).Scan(&stats.TodayResolved)

		svcCtx.DB.QueryRow("SELECT IFNULL(AVG(TIMESTAMPDIFF(SECOND, created_at, first_response_at)), 0) FROM ticket"+where+" AND first_response_at IS NOT NULL").Scan(&stats.AvgResponseTime)
		svcCtx.DB.QueryRow("SELECT IFNULL(AVG(TIMESTAMPDIFF(SECOND, created_at, resolved_at)), 0) FROM ticket"+where+" AND resolved_at IS NOT NULL").Scan(&stats.AvgResolveTime)

		if stats.TotalTickets > 0 {
			stats.ResolutionRate = float64(stats.ResolvedTickets+stats.ClosedTickets) / float64(stats.TotalTickets) * 100
		}

		httpx.OkJsonCtx(r.Context(), w, OK(stats))
	}
}

func GetAgentWorkloadHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		date := r.URL.Query().Get("date")
		if date == "" {
			date = time.Now().Format("2006-01-02")
		}

		rows, err := svcCtx.DB.Query(`
			SELECT u.id, u.real_name,
				IFNULL(w.online_duration, 0),
				IFNULL(w.ticket_count, 0),
				IFNULL(w.resolved_count, 0),
				IFNULL(w.avg_response_time, 0),
				IFNULL(w.avg_resolve_time, 0),
				IFNULL(w.satisfaction_avg, 0)
			FROM user u
			LEFT JOIN agent_workload w ON u.id = w.agent_id AND w.date = ?
			WHERE u.role = 2 AND u.status = 1 AND u.deleted_at IS NULL
			ORDER BY w.ticket_count DESC, u.id ASC
		`, date)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []map[string]interface{}
		for rows.Next() {
			var agentId int64
			var agentName string
			var onlineDuration, ticketCount, resolvedCount int
			var avgResponseTime, avgResolveTime, satisfactionAvg float64

			rows.Scan(&agentId, &agentName, &onlineDuration, &ticketCount, &resolvedCount, &avgResponseTime, &avgResolveTime, &satisfactionAvg)

			list = append(list, map[string]interface{}{
				"agentId":         agentId,
				"agentName":       agentName,
				"onlineDuration":  onlineDuration,
				"ticketCount":     ticketCount,
				"resolvedCount":   resolvedCount,
				"avgResponseTime": avgResponseTime,
				"avgResolveTime":  avgResolveTime,
				"satisfactionAvg": satisfactionAvg,
			})
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func GetTicketTrendHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		days := 7
		if d := r.URL.Query().Get("days"); d != "" {
			if v, err := parseDays(d); err == nil {
				days = v
			}
		}

		startDate := time.Now().AddDate(0, 0, -days+1).Format("2006-01-02")

		rows, err := svcCtx.DB.Query(`
			SELECT DATE(created_at) as date, COUNT(*) as count
			FROM ticket
			WHERE created_at >= ? AND deleted_at IS NULL
			GROUP BY DATE(created_at)
			ORDER BY date ASC
		`, startDate)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		trendMap := make(map[string]int64)
		for rows.Next() {
			var date string
			var count int64
			rows.Scan(&date, &count)
			trendMap[date] = count
		}

		var result []map[string]interface{}
		for i := 0; i < days; i++ {
			date := time.Now().AddDate(0, 0, -days+1+i).Format("2006-01-02")
			count := int64(0)
			if c, ok := trendMap[date]; ok {
				count = c
			}
			result = append(result, map[string]interface{}{
				"date":  date,
				"count": count,
			})
		}

		httpx.OkJsonCtx(r.Context(), w, OK(result))
	}
}

func GetCategoryStatsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT c.id, c.name, COUNT(t.id) as count
			FROM ticket_category c
			LEFT JOIN ticket t ON c.id = t.category_id AND t.deleted_at IS NULL
			WHERE c.status = 1
			GROUP BY c.id, c.name
			ORDER BY count DESC, c.id ASC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []map[string]interface{}
		for rows.Next() {
			var id sql.NullInt64
			var name string
			var count int64
			rows.Scan(&id, &name, &count)
			if id.Valid {
				list = append(list, map[string]interface{}{
					"categoryId":   id.Int64,
					"categoryName": name,
					"count":        count,
				})
			}
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func parseDays(s string) (int, error) {
	var days int
	_, err := fmt.Sscanf(s, "%d", &days)
	if err != nil {
		return 0, err
	}
	if days < 1 || days > 30 {
		return 7, nil
	}
	return days, nil
}
