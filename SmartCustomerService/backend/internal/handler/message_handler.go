package handler

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"smart-customer-service/internal/socket"
	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetTicketMessagesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ticketIdStr := r.PathValue("ticketId")
		ticketId, _ := strconv.ParseInt(ticketIdStr, 10, 64)

		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))

		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 20
		}

		offset := (page - 1) * pageSize

		rows, err := svcCtx.DB.Query(`
			SELECT id, ticket_id, sender_id, sender_role, sender_name, message_type, content, is_read, is_robot, created_at
			FROM ticket_message WHERE ticket_id = ? ORDER BY id DESC LIMIT ? OFFSET ?
		`, ticketId, pageSize, offset)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.TicketMessageInfo
		for rows.Next() {
			var m types.TicketMessageInfo
			rows.Scan(&m.Id, &m.TicketId, &m.SenderId, &m.SenderRole, &m.SenderName, &m.MessageType, &m.Content, &m.IsRead, &m.IsRobot, &m.CreatedAt)
			list = append(list, m)
		}

		for i, j := 0, len(list)-1; i < j; i, j = i+1, j-1 {
			list[i], list[j] = list[j], list[i]
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func SendTicketMessageHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, username, role := ParseUserFromContext(r)

		var req types.SendMessageReq
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

		var ticketNo string
		var customerId int64
		var assigneeId sql.NullInt64
		var currentStatus string

		err = tx.QueryRow(`SELECT ticket_no, customer_id, assignee_id, status_code FROM ticket WHERE id = ? AND deleted_at IS NULL`,
			req.TicketId).Scan(&ticketNo, &customerId, &assigneeId, &currentStatus)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("工单不存在"))
			return
		}

		var realName string
		tx.QueryRow(`SELECT real_name FROM user WHERE id = ?`, userId).Scan(&realName)
		if realName == "" {
			realName = username
		}

		result, err := tx.Exec(`
			INSERT INTO ticket_message (ticket_id, sender_id, sender_role, sender_name, message_type, content, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?)
		`, req.TicketId, userId, role, realName, req.MessageType, req.Content, now)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("发送消息失败"))
			return
		}

		msgId, _ := result.LastInsertId()

		_, err = tx.Exec(`UPDATE ticket SET message_count = message_count + 1, last_message_at = ?, updated_at = ? WHERE id = ?`,
			now, now, req.TicketId)
		if err != nil {
			tx.Rollback()
			httpx.OkJsonCtx(r.Context(), w, Fail("发送消息失败"))
			return
		}

		if currentStatus == "waiting_customer" && role == 1 {
			_, err = tx.Exec(`UPDATE ticket SET status_code = 'processing' WHERE id = ?`, req.TicketId)
		}

		_, err = tx.Exec(`INSERT INTO ticket_operation_log (ticket_id, operation_type, operator_id, operator_role, operator_name, content, created_at) VALUES (?, 'reply', ?, ?, ?, ?, ?)`,
			req.TicketId, userId, role, username, "回复消息", now)

		var notifyUserId int64
		if role == 1 && assigneeId.Valid {
			notifyUserId = assigneeId.Int64
		} else if role == 2 {
			notifyUserId = customerId
		}

		if notifyUserId > 0 {
			tx.Exec(`INSERT INTO notification (user_id, type, title, content, related_id, created_at) VALUES (?, 'ticket_reply', ?, ?, ?, ?)`,
				notifyUserId, fmt.Sprintf("工单%s有新回复", ticketNo), req.Content, req.TicketId, now)
		}

		tx.Commit()

		svcCtx.Hub.BroadcastMessage(fmt.Sprintf("%d", req.TicketId), socket.Message{
			Type:      "message",
			UserId:    userId,
			Username:  realName,
			Role:      role,
			Content:   req.Content,
			Timestamp: now.Unix(),
		})

		tryRobotReply(svcCtx, tx, req.TicketId, req.Content)

		httpx.OkJsonCtx(r.Context(), w, OK(map[string]int64{"id": msgId}))
	}
}

func tryRobotReply(svcCtx *svc.ServiceContext, tx *sql.Tx, ticketId int64, content string) {
	keywords := extractKeywords(content)
	if len(keywords) == 0 {
		return
	}

	var articleId int64
	var title, articleContent string
	var found bool

	for _, kw := range keywords {
		rows, err := svcCtx.DB.Query(`
			SELECT id, title, content FROM kb_article
			WHERE status = 1 AND (title LIKE ? OR keywords LIKE ? OR content LIKE ?)
			ORDER BY helpful_count DESC, view_count DESC LIMIT 1
		`, "%"+kw+"%", "%"+kw+"%", "%"+kw+"%")
		if err != nil {
			continue
		}
		for rows.Next() {
			rows.Scan(&articleId, &title, &articleContent)
			found = true
		}
		rows.Close()
		if found {
			break
		}
	}

	if found && articleId > 0 {
		now := time.Now()
		replyContent := fmt.Sprintf("根据您的问题，为您找到以下知识库文章：\n\n【%s】\n\n%s", title, truncateContent(articleContent, 500))

		_, err := tx.Exec(`
			INSERT INTO ticket_message (ticket_id, sender_id, sender_role, sender_name, message_type, content, is_robot, kb_article_id, created_at)
			VALUES (?, 0, 3, '智能客服助手', 1, ?, 1, ?, ?)
		`, ticketId, replyContent, articleId, now)
		if err != nil {
			logx.Errorf("Robot reply error: %v", err)
			return
		}

		_, err = tx.Exec(`UPDATE ticket SET message_count = message_count + 1, updated_at = ? WHERE id = ?`, now, ticketId)

		svcCtx.Hub.BroadcastMessage(fmt.Sprintf("%d", ticketId), socket.Message{
			Type:      "message",
			UserId:    0,
			Username:  "智能客服助手",
			Role:      3,
			Content:   replyContent,
			Timestamp: now.Unix(),
		})
	}
}

func extractKeywords(content string) []string {
	stopWords := map[string]bool{
		"的": true, "了": true, "在": true, "是": true, "我": true,
		"有": true, "和": true, "就": true, "不": true, "人": true,
		"都": true, "一": true, "一个": true, "上": true, "也": true,
		"很": true, "到": true, "说": true, "要": true, "去": true,
		"你": true, "会": true, "着": true, "没有": true, "看": true,
		"好": true, "自己": true, "这": true, "吗": true, "呢": true,
		"请问": true, "怎么": true, "如何": true, "什么": true, "为什么": true,
	}

	content = strings.TrimSpace(content)
	if len(content) > 100 {
		content = content[:100]
	}

	var keywords []string
	seen := make(map[string]bool)

	for _, word := range strings.FieldsFunc(content, func(r rune) bool {
		return r == ' ' || r == ',' || r == '，' || r == '.' || r == '。' || r == '?' || r == '？' || r == '!' || r == '！'
	}) {
		word = strings.TrimSpace(word)
		if len(word) < 2 || len(word) > 20 {
			continue
		}
		if stopWords[word] {
			continue
		}
		if !seen[word] {
			seen[word] = true
			keywords = append(keywords, word)
		}
	}

	return keywords
}

func truncateContent(content string, maxLen int) string {
	runes := []rune(content)
	if len(runes) <= maxLen {
		return content
	}
	return string(runes[:maxLen]) + "..."
}

func GetOperationLogsHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ticketIdStr := r.PathValue("ticketId")
		ticketId, _ := strconv.ParseInt(ticketIdStr, 10, 64)

		rows, err := svcCtx.DB.Query(`
			SELECT id, ticket_id, operation_type, from_status, to_status, operator_id, operator_role, operator_name, content, created_at
			FROM ticket_operation_log WHERE ticket_id = ? ORDER BY id ASC
		`, ticketId)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.OperationLogInfo
		for rows.Next() {
			var l types.OperationLogInfo
			var fromStatus, toStatus sql.NullString
			rows.Scan(&l.Id, &l.TicketId, &l.OperationType, &fromStatus, &toStatus, &l.OperatorId, &l.OperatorRole, &l.OperatorName, &l.Content, &l.CreatedAt)
			l.FromStatus = nullString(fromStatus)
			l.ToStatus = nullString(toStatus)
			list = append(list, l)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}
