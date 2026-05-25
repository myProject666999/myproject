package handler

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

func GetKbCategoriesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		rows, err := svcCtx.DB.Query(`
			SELECT id, name, parent_id, sort, icon
			FROM kb_category WHERE status = 1 ORDER BY sort ASC, id ASC
		`)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var all []types.KbCategoryInfo
		categoryMap := make(map[int64]*types.KbCategoryInfo)

		for rows.Next() {
			var cat types.KbCategoryInfo
			var icon sql.NullString
			rows.Scan(&cat.Id, &cat.Name, &cat.ParentId, &cat.Sort, &icon)
			cat.Icon = nullString(icon)
			all = append(all, cat)
			categoryMap[cat.Id] = &all[len(all)-1]
		}

		var result []types.KbCategoryInfo
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

func GetKbArticlesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		page, _ := strconv.Atoi(r.URL.Query().Get("page"))
		pageSize, _ := strconv.Atoi(r.URL.Query().Get("pageSize"))
		categoryId, _ := strconv.ParseInt(r.URL.Query().Get("categoryId"), 10, 64)
		status, _ := strconv.Atoi(r.URL.Query().Get("status"))
		keyword := r.URL.Query().Get("keyword")

		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 10
		}

		var where = " WHERE a.deleted_at IS NULL"
		var args []interface{}

		if categoryId > 0 {
			where += " AND a.category_id = ?"
			args = append(args, categoryId)
		}
		if status > 0 {
			where += " AND a.status = ?"
			args = append(args, status)
		}
		if keyword != "" {
			where += " AND (a.title LIKE ? OR a.keywords LIKE ? OR a.content LIKE ?)"
			args = append(args, "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
		}

		var total int64
		svcCtx.DB.QueryRow("SELECT COUNT(*) FROM kb_article a"+where, args...).Scan(&total)

		offset := (page - 1) * pageSize
		rows, err := svcCtx.DB.Query(`
			SELECT a.id, a.category_id, c.name, a.title, a.summary, a.keywords,
				a.view_count, a.helpful_count, a.not_helpful_count, a.status, a.published_at, a.created_at
			FROM kb_article a
			LEFT JOIN kb_category c ON a.category_id = c.id
			`+where+` ORDER BY a.id DESC LIMIT ? OFFSET ?
		`, append(args, pageSize, offset)...)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("查询失败"))
			return
		}
		defer rows.Close()

		var list []types.KbArticleInfo
		for rows.Next() {
			var a types.KbArticleInfo
			var publishedAt sql.NullTime
			rows.Scan(&a.Id, &a.CategoryId, &a.CategoryName, &a.Title, &a.Summary, &a.Keywords,
				&a.ViewCount, &a.HelpfulCount, &a.NotHelpfulCount, &a.Status, &publishedAt, &a.CreatedAt)
			a.PublishedAt = nullTime(publishedAt)
			list = append(list, a)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(types.KbArticleListResp{Total: total, List: list}))
	}
}

func GetKbArticleDetailHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		var a types.KbArticleDetail
		var publishedAt sql.NullTime

		err := svcCtx.DB.QueryRow(`
			SELECT a.id, a.category_id, c.name, a.title, a.summary, a.keywords, a.content,
				a.view_count, a.helpful_count, a.not_helpful_count, a.status, a.published_at, a.created_at
			FROM kb_article a
			LEFT JOIN kb_category c ON a.category_id = c.id
			WHERE a.id = ? AND a.deleted_at IS NULL
		`, id).Scan(&a.Id, &a.CategoryId, &a.CategoryName, &a.Title, &a.Summary, &a.Keywords, &a.Content,
			&a.ViewCount, &a.HelpfulCount, &a.NotHelpfulCount, &a.Status, &publishedAt, &a.CreatedAt)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("文章不存在"))
			return
		}
		a.PublishedAt = nullTime(publishedAt)

		svcCtx.DB.Exec(`UPDATE kb_article SET view_count = view_count + 1 WHERE id = ?`, id)

		httpx.OkJsonCtx(r.Context(), w, OK(a))
	}
}

func CreateKbArticleHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userId, _, _ := ParseUserFromContext(r)

		var req types.CreateKbArticleReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		now := time.Now()
		var publishedAt *time.Time
		if req.Status == 1 {
			publishedAt = &now
		}

		result, err := svcCtx.DB.Exec(`
			INSERT INTO kb_article (category_id, title, content, summary, keywords, author_id, status, published_at, created_at, updated_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`, req.CategoryId, req.Title, req.Content, req.Summary, req.Keywords, userId, req.Status, publishedAt, now, now)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("创建文章失败"))
			return
		}

		id, _ := result.LastInsertId()
		httpx.OkJsonCtx(r.Context(), w, OK(map[string]int64{"id": id}))
	}
}

func UpdateKbArticleHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.UpdateKbArticleReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		now := time.Now()
		var publishedAt *time.Time
		if req.Status == 1 {
			publishedAt = &now
		}

		_, err := svcCtx.DB.Exec(`
			UPDATE kb_article SET category_id=?, title=?, content=?, summary=?, keywords=?, status=?, published_at=?, updated_at=? WHERE id=?
		`, req.CategoryId, req.Title, req.Content, req.Summary, req.Keywords, req.Status, publishedAt, now, req.Id)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("更新文章失败"))
			return
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func DeleteKbArticleHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		now := time.Now()
		_, err := svcCtx.DB.Exec(`UPDATE kb_article SET deleted_at=? WHERE id=?`, now, id)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("删除文章失败"))
			return
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}

func SearchKbArticlesHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Keyword string `json:"keyword"`
		}
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		rows, err := svcCtx.DB.Query(`
			SELECT id, title, summary, view_count FROM kb_article
			WHERE status = 1 AND deleted_at IS NULL AND (title LIKE ? OR keywords LIKE ? OR content LIKE ?)
			ORDER BY view_count DESC LIMIT 10
		`, "%"+req.Keyword+"%", "%"+req.Keyword+"%", "%"+req.Keyword+"%")
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("搜索失败"))
			return
		}
		defer rows.Close()

		var list []map[string]interface{}
		for rows.Next() {
			var id, viewCount int64
			var title, summary string
			rows.Scan(&id, &title, &summary, &viewCount)
			list = append(list, map[string]interface{}{
				"id":         id,
				"title":      title,
				"summary":    summary,
				"viewCount":  viewCount,
			})
		}

		httpx.OkJsonCtx(r.Context(), w, OK(list))
	}
}

func MarkKbHelpfulHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		idStr := r.PathValue("id")
		id, _ := strconv.ParseInt(idStr, 10, 64)

		var req struct {
			Helpful bool `json:"helpful"`
		}
		if err := httpx.Parse(r, &req); err != nil {
			httpx.OkJsonCtx(r.Context(), w, Fail("参数错误"))
			return
		}

		if req.Helpful {
			svcCtx.DB.Exec(`UPDATE kb_article SET helpful_count = helpful_count + 1 WHERE id = ?`, id)
		} else {
			svcCtx.DB.Exec(`UPDATE kb_article SET not_helpful_count = not_helpful_count + 1 WHERE id = ?`, id)
		}

		httpx.OkJsonCtx(r.Context(), w, OK(nil))
	}
}
