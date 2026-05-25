package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func nullString(s sql.NullString) string {
	if s.Valid {
		return s.String
	}
	return ""
}

func nullTime(t sql.NullTime) *time.Time {
	if t.Valid {
		return &t.Time
	}
	return nil
}

func nullInt64(i sql.NullInt64) *int64 {
	if i.Valid {
		return &i.Int64
	}
	return nil
}

func GetTicketCategoriesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT id, name, parent_id, description, sort, icon
			FROM ticket_category WHERE status = 1 ORDER BY sort ASC, id ASC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var all []types.TicketCategoryInfo
		categoryMap := make(map[int64]*types.TicketCategoryInfo)

		for rows.Next() {
			var cat types.TicketCategoryInfo
			var description, icon sql.NullString
			rows.Scan(&cat.Id, &cat.Name, &cat.ParentId, &description, &cat.Sort, &icon)
			cat.Description = nullString(description)
			cat.Icon = nullString(icon)
			all = append(all, cat)
			categoryMap[cat.Id] = &all[len(all)-1]
		}

		var result []types.TicketCategoryInfo
		for i := range all {
			if all[i].ParentId == 0 {
				result = append(result, all[i])
			} else if parent, ok := categoryMap[all[i].ParentId]; ok {
				parent.Children = append(parent.Children, all[i])
			}
		}

		httpx.OkJsonCtx(r.Context(), w, OK(result))
	}
}

func GetTicketPrioritiesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT id, name, level, color, response_timeout, resolve_timeout
			FROM ticket_priority WHERE status = 1 ORDER BY level DESC, sort ASC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.TicketPriorityInfo
		for rows.Next() {
			var p types.TicketPriorityInfo
			var color sql.NullString
			rows.Scan(&p.Id, &p.Name, &p.Level, &color, &p.ResponseTimeout, &p.ResolveTimeout)
			p.Color = nullString(color)
			list = append(list, p)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func GetTicketStatusesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT id, code, name, color, is_initial, is_final
			FROM ticket_status WHERE status = 1 ORDER BY sort ASC, id ASC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.TicketStatusInfo
		for rows.Next() {
			var s types.TicketStatusInfo
			var color sql.NullString
			rows.Scan(&s.Id, &s.Code, &s.Name, &color, &s.IsInitial, &s.IsFinal)
			s.Color = nullString(color)
			list = append(list, s)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func GetTicketDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		var t types.TicketInfo
		var assigneeId sql.NullInt64
		var lastMessageAt, firstResponseAt, assignedAt, resolvedAt, closedAt sql.NullTime

		err := svcCtx.DB.QueryRow(`
			SELECT t.id, t.ticket_no, t.title, t.content, t.category_id, c.name,
				t.priority_id, p.name, p.color, t.status_code, s.name, s.color,
				t.customer_id, cu.real_name, t.assignee_id, au.real_name,
				t.source, t.channel, t.tags, t.message_count,
				t.last_message_at, t.first_response_at, t.assigned_at, t.resolved_at, t.closed_at,
				t.is_timeout_warned, t.created_at, t.updated_at
			FROM ticket t
			LEFT JOIN ticket_category c ON t.category_id = c.id
			LEFT JOIN ticket_priority p ON t.priority_id = p.id
			LEFT JOIN ticket_status s ON t.status_code = s.code
			LEFT JOIN user cu ON t.customer_id = cu.id
			LEFT JOIN user au ON t.assignee_id = au.id
			WHERE t.id = ? AND t.deleted_at IS NULL
		`, id).Scan(
			&t.Id, &t.TicketNo, &t.Title, &t.Content, &t.CategoryId, &t.CategoryName,
			&t.PriorityId, &t.PriorityName, &t.PriorityColor, &t.StatusCode, &t.StatusName, &t.StatusColor,
			&t.CustomerId, &t.CustomerName, &assigneeId, &t.AssigneeName,
			&t.Source, &t.Channel, &t.Tags, &t.MessageCount,
			&lastMessageAt, &firstResponseAt, &assignedAt, &resolvedAt, &closedAt,
			&t.IsTimeoutWarned, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("工单不存在"))
			return
		}

		t.AssigneeId = nullInt64(assigneeId)
		t.LastMessageAt = nullTime(lastMessageAt)
		t.FirstResponseAt = nullTime(firstResponseAt)
		t.AssignedAt = nullTime(assignedAt)
		t.ResolvedAt = nullTime(resolvedAt)
		t.ClosedAt = nullTime(closedAt)

		_, err = svcCtx.DB.Exec(`UPDATE ticket SET view_count = view_count + 1 WHERE id = ?`, id)

		httpx.OkJsonCtx(r.Context(), w, OK(t))
	}
}

func GetTicketListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, _, role := ParseUserFromContext(r)

		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
		statusCode := r.URL.Query().Get("statusCode")
		categoryId, _ := strconv.ParseInt(r.URL.Query().Get("categoryId"), 10, 64)
		priorityId, _ := strconv.ParseInt(r.URL.Query().Get("priorityId"), 10, 64)
		assigneeId, _ := strconv.ParseInt(r.URL.Query().Get("assigneeId"), 10, 64)
		keyword := r.URL.Query().Get("keyword")
		startTime := r.URL.Query().Get("startTime")
		endTime := r.URL.Query().Get("endTime")

		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}

		var where = " WHERE t.deleted_at IS NULL"
		var args []interface{}

		if role == 1 {
			where += " AND t.customer_id = ?"
			args = append(args, userId)
		} else if role == 2 {
			where += " AND (t.customer_id = ? OR t.assignee_id = ?)"
			args = append(args, userId, userId)
		}

		if statusCode != "" {
			where += " AND t.status_code = ?"
			args = append(args, statusCode)
		}
		if categoryId > 0 {
			where += " AND t.category_id = ?"
			args = append(args, categoryId)
		}
		if priorityId > 0 {
			where += " AND t.priority_id = ?"
			args = append(args, priorityId)
		}
		if assigneeId > 0 {
			where += " AND t.assignee_id = ?"
			args = append(args, assigneeId)
		}
		if keyword != "" {
			where += " AND (t.title LIKE ? OR t.ticket_no LIKE ? OR t.content LIKE ?)"
			args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
		}
		if startTime != "" {
			where += " AND t.created_at >= ?"
			args = append(args, startTime)
		}
		if endTime != "" {
			where += " AND t.created_at <= ?"
			args = append(args, endTime+" 23:59:59")
		}

		var total int64
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM ticket t"+where, args...).Scan(&total)

		offset := (page - 1) * pageSize
		rows, err := svcCtx.DB.Query(`
			SELECT t.id, t.ticket_no, t.title, t.category_id, c.name,
				t.priority_id, p.name, p.color, t.status_code, s.name, s.color,
				t.customer_id, cu.real_name, t.assignee_id, au.real_name,
				t.source, t.channel, t.tags, t.message_count,
				t.last_message_at, t.first_response_at, t.assigned_at, t.resolved_at, t.closed_at,
				t.is_timeout_warned, t.created_at, t.updated_at
			FROM ticket t
			LEFT JOIN ticket_category c ON t.category_id = c.id
			LEFT JOIN ticket_priority p ON t.priority_id = p.id
			LEFT JOIN ticket_status s ON t.status_code = s.code
			LEFT JOIN user cu ON t.customer_id = cu.id
			LEFT JOIN user au ON t.assignee_id = au.id
			`+where+` ORDER BY t.id DESC LIMIT ? OFFSET ?
		`, append(args, pageSize, offset)...)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.TicketInfo
		for rows.Next() {
			var t types.TicketInfo
			var aId sql.NullInt64
			var lma, fra, aa, ra, ca sql.NullTime
			rows.Scan(
				&t.Id, &t.TicketNo, &t.Title, &t.CategoryId, &t.CategoryName,
				&t.PriorityId, &t.PriorityName, &t.PriorityColor, &t.StatusCode, &t.StatusName, &t.StatusColor,
				&t.CustomerId, &t.CustomerName, &aId, &t.AssigneeName,
				&t.Source, &t.Channel, &t.Tags, &t.MessageCount,
				&lma, &fra, &aa, &ra, &ca,
				&t.IsTimeoutWarned, &t.CreatedAt, &t.UpdatedAt,
			)
			t.AssigneeId = nullInt64(aId)
			t.LastMessageAt = nullTime(lma)
			t.FirstResponseAt = nullTime(fra)
			t.AssignedAt = nullTime(aa)
			t.ResolvedAt = nullTime(ra)
			t.ClosedAt = nullTime(ca)
			list = append(list, t)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(types.TicketListResp{Total: total, List: list}))
	}
}

func CreateTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		var req types.CreateTicketReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		now := time.Now()
		ticketNo := fmt.Sprintf("TK%s%06d", now.Format("20060102150405"), time.Now().UnixNano()%1000000)

		var responseTimeout, resolveTimeout int
		svcCtx.DB.QueryRow(`SELECT response_timeout, resolve_timeout FROM ticket_priority WHERE id = ?`, req.PriorityId).Scan(&responseTimeout, &resolveTimeout)

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		result, err := tx.Exec(`
			INSERT INTO ticket (ticket_no, title, content, category_id, priority_id, status_code, customer_id, source, channel, tags, response_timeout_at, resolve_timeout_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)
		`, ticketNo, req.Title, req.Content, req.CategoryId, req.PriorityId, userId,
			req.Source, req.Channel, req.Tags,
			now.Add(time.Duration(responseTimeout)*time.Second),
			now.Add(time.Duration(resolveTimeout)*time.Second),
			now, now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("创建工单失败"))
			return
		}

		ticketId, _ := result.LastInsertId()

		_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, operator_id, operator_role, operator_name, content, created_at) VALUES (?, 'create', ?, ?, ?, ?, ?)`,
			ticketId, userId, role, username, "创建工单", now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("创建工单失败"))
			return
		}

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", ticketId), "new_ticket", fmt.Sprintf("新工单: %s", req.Title))
		}

		httpx.OkJsonCtx(r.Context(), w, OK(map[string]interface{}{
			"id":       ticketId,
			"ticketNo": ticketNo,
		}))
	}
}

func UpdateTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		_, username, role := ParseUserFromContext(r)

		var req types.UpdateTicketReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		now := time.Now()

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		_, err = tx.Exec(`UPDATE ticket SET title=?, content=?, category_id=?, priority_id=?, tags=?, updated_at=? WHERE id=?`,
			req.Title, req.Content, req.CategoryId, req.PriorityId, req.Tags, now, req.Id)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("更新工单失败"))
			return
		}

		_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, operator_id, operator_role, operator_name, content, created_at) VALUES (?, 'update', ?, ?, ?, ?, ?)`,
			req.Id, 0, role, username, "修改工单信息", now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("更新工单失败"))
			return
		}

		tx.Commit()
		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func AssignTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		var req types.AssignTicketReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		var currentStatus string
		svcCtx.DB.QueryRow(`SELECT status_code FROM ticket WHERE id = ?`, req.TicketId).Scan(&currentStatus)

		if !svcCtx.StateMachine.CanTransition(currentStatus, "assign", role) && currentStatus != "pending" {
			httpx.OkJsonCtx(r.Context(), w, Fail("当前状态不允许分配"))
			return
		}

		now := time.Now()

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		_, err = tx.Exec(`UPDATE ticket SET assignee_id=?, assigned_at=?, status_code='assigned', updated_at=? WHERE id=?`,
			req.AssigneeId, now, now, req.TicketId)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("分配失败"))
			return
		}

		_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, from_status, to_status, operator_id, operator_role, operator_name, content, created_at) VALUES (?, 'assign', ?, 'assigned', ?, ?, ?, ?, ?)`,
			req.TicketId, currentStatus, userId, role, username,
			fmt.Sprintf("分配工单给客服ID:%d", req.AssigneeId), now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("分配失败"))
			return
		}

		var assigneeName string
		svcCtx.DB.QueryRow(`SELECT real_name FROM user WHERE id = ?`, req.AssigneeId).Scan(&assigneeName)
		_, err = tx.Exec(`INSERT INTO notification (user_id, type, title, content, related_id, created_at) VALUES (?, 'ticket_assign', ?, ?, ?, ?)`,
			req.AssigneeId, "您有新的工单待处理", fmt.Sprintf("工单已分配给您处理"), req.TicketId, now)

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", req.TicketId), "ticket_assign",
				fmt.Sprintf("工单已分配给%s", assigneeName))
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func ClaimTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		idStr := r.PathValue("id")
		ticketId, _ := strconv.ParseInt(idStr, 10, 64)

		var currentStatus string
		svcCtx.DB.QueryRow(`SELECT status_code FROM ticket WHERE id = ?`, ticketId).Scan(&currentStatus)

		if !svcCtx.StateMachine.CanTransition(currentStatus, "claim", role) {
			httpx.OkJsonCtx(r.Context(), w, Fail("当前状态不允许领取"))
			return
		}

		now := time.Now()

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		_, err = tx.Exec(`UPDATE ticket SET assignee_id=?, assigned_at=?, status_code='processing', first_response_at=?, updated_at=? WHERE id=?`,
			userId, now, now, now, ticketId)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("领取失败"))
			return
		}

		_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, from_status, to_status, operator_id, operator_role, operator_name, content, created_at) VALUES (?, 'claim', ?, 'processing', ?, ?, ?, ?, ?)`,
			ticketId, currentStatus, userId, role, username, "客服领取工单", now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("领取失败"))
			return
		}

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", ticketId), "ticket_claim", "工单已被领取")
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func ResolveTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		idStr := r.PathValue("id")
		ticketId, _ := strconv.ParseInt(idStr, 10, 64)

		var currentStatus string
		svcCtx.DB.QueryRow(`SELECT status_code FROM ticket WHERE id = ?`, ticketId).Scan(&currentStatus)

		if !svcCtx.StateMachine.CanTransition(currentStatus, "resolve", role) {
			httpx.OkJsonCtx(r.Context(), w, Fail("当前状态不允许解决"))
			return
		}

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		err = svcCtx.StateMachine.ExecuteTransition(tx, ticketId, currentStatus, "resolve", userId, role, username, "工单已解决")
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("解决失败"))
			return
		}

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", ticketId), "ticket_resolve", "工单已解决")
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func CloseTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		idStr := r.PathValue("id")
		ticketId, _ := strconv.ParseInt(idStr, 10, 64)

		var currentStatus string
		svcCtx.DB.QueryRow(`SELECT status_code FROM ticket WHERE id = ?`, ticketId).Scan(&currentStatus)

		if !svcCtx.StateMachine.CanTransition(currentStatus, "close", role) {
			httpx.OkJsonCtx(r.Context(), w, Fail("当前状态不允许关闭"))
			return
		}

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		err = svcCtx.StateMachine.ExecuteTransition(tx, ticketId, currentStatus, "close", userId, role, username, "工单已关闭")
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("关闭失败"))
			return
		}

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", ticketId), "ticket_close", "工单已关闭")
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func ReopenTicketHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		idStr := r.PathValue("id")
		ticketId, _ := strconv.ParseInt(idStr, 10, 64)

		var currentStatus string
		svcCtx.DB.QueryRow(`SELECT status_code FROM ticket WHERE id = ?`, ticketId).Scan(&currentStatus)

		if !svcCtx.StateMachine.CanTransition(currentStatus, "reopen", role) {
			httpx.OkJsonCtx(r.Context(), w, Fail("当前状态不允许重新打开"))
			return
		}

		tx, err := svcCtx.DB.Begin()
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("系统错误"))
			return
		}

		err = svcCtx.StateMachine.ExecuteTransition(tx, ticketId, currentStatus, "reopen", userId, role, username, "客户重新打开工单")
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("重新打开失败"))
			return
		}

		tx.Commit()

		if svcCtx.Hub != nil {
			svcCtx.Hub.PushNotification(fmt.Sprintf("%d", ticketId), "ticket_reopen", "工单已重新打开")
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}
