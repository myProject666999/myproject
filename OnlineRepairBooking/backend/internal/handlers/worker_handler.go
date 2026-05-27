package handlers

import (
	"database/sql"
	"strconv"
	"strings"

	"online-repair-booking/pkg/database"
	"online-repair-booking/pkg/response"

	"github.com/labstack/echo/v4"
)

type WorkerHandler struct {
}

func NewWorkerHandler(db *sql.DB) *WorkerHandler {
	return &WorkerHandler{}
}

func (h *WorkerHandler) GetWorkerList(c echo.Context) error {
	categoryIDStr := c.QueryParam("category_id")
	categoryIDStr2 := c.QueryParam("categoryId")
	if categoryIDStr == "" && categoryIDStr2 != "" {
		categoryIDStr = categoryIDStr2
	}
	city := c.QueryParam("city")
	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")
	pageSizeStr2 := c.QueryParam("pageSize")
	if pageSizeStr == "" && pageSizeStr2 != "" {
		pageSizeStr = pageSizeStr2
	}

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	whereConditions := make([]string, 0)
	args := make([]interface{}, 0)

	whereConditions = append(whereConditions, "w.status = 1")

	if categoryIDStr != "" {
		categoryID, err := strconv.ParseUint(categoryIDStr, 10, 64)
		if err == nil {
			whereConditions = append(whereConditions, "ws.category_id = ?")
			args = append(args, categoryID)
		}
	}

	if city != "" {
		whereConditions = append(whereConditions, "w.city = ?")
		args = append(args, city)
	}

	whereClause := ""
	if len(whereConditions) > 0 {
		whereClause = " WHERE " + strings.Join(whereConditions, " AND ")
	}

	countQuery := `SELECT COUNT(DISTINCT w.id) FROM workers w`
	if categoryIDStr != "" {
		countQuery += ` LEFT JOIN worker_skills ws ON w.id = ws.worker_id`
	}
	countQuery += whereClause

	var total int64
	err := database.MySQL.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取师傅总数失败")
	}

	offset := (page - 1) * pageSize

	query := `SELECT DISTINCT w.id, w.real_name, w.avatar, w.phone, w.province, w.city, 
	          w.district, w.introduction, w.skills, w.years_of_experience, w.rating, 
	          w.order_count, w.level, w.is_certified 
	          FROM workers w`
	if categoryIDStr != "" {
		query += ` LEFT JOIN worker_skills ws ON w.id = ws.worker_id`
	}
	query += whereClause
	query += ` ORDER BY w.rating DESC, w.order_count DESC LIMIT ? OFFSET ?`

	args = append(args, pageSize, offset)

	rows, err := database.MySQL.Query(query, args...)
	if err != nil {
		return response.InternalServerError(c, "获取师傅列表失败")
	}
	defer rows.Close()

	type WorkerItem struct {
		ID              uint64  `json:"id"`
		RealName        string  `json:"real_name"`
		Avatar          string  `json:"avatar"`
		Phone           string  `json:"phone"`
		Province        string  `json:"province"`
		City            string  `json:"city"`
		District        string  `json:"district"`
		Introduction    string  `json:"introduction"`
		Skills          string  `json:"skills"`
		YearsOfExperience int   `json:"years_of_experience"`
		Rating          float64 `json:"rating"`
		OrderCount      int     `json:"order_count"`
		Level           int     `json:"level"`
		IsCertified     int     `json:"is_certified"`
	}

	workers := make([]*WorkerItem, 0)
	for rows.Next() {
		worker := &WorkerItem{}
		var avatar, district, introduction, skills sql.NullString
		err := rows.Scan(&worker.ID, &worker.RealName, &avatar, &worker.Phone,
			&worker.Province, &worker.City, &district, &introduction,
			&skills, &worker.YearsOfExperience, &worker.Rating, &worker.OrderCount,
			&worker.Level, &worker.IsCertified)
		if err != nil {
			return response.InternalServerError(c, "解析师傅数据失败: "+err.Error())
		}
		if avatar.Valid {
			worker.Avatar = avatar.String
		}
		if district.Valid {
			worker.District = district.String
		}
		if introduction.Valid {
			worker.Introduction = introduction.String
		}
		if skills.Valid {
			worker.Skills = skills.String
		}
		workers = append(workers, worker)
	}

	result := &PaginationResult{
		List:     workers,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *WorkerHandler) GetWorkerDetail(c echo.Context) error {
	idStr := c.Param("id")
	if idStr == "" {
		return response.BadRequest(c, "师傅ID不能为空")
	}

	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "师傅ID格式错误")
	}

	query := `SELECT w.id, w.user_id, w.real_name, w.avatar, w.phone, w.province, w.city, 
	          w.district, w.introduction, w.skills, w.years_of_experience, w.rating, 
	          w.order_count, w.level, w.is_certified, w.status 
	          FROM workers w WHERE w.id = ?`

	type WorkerDetail struct {
		ID                uint64  `json:"id"`
		UserID            uint64  `json:"user_id"`
		RealName          string  `json:"real_name"`
		Avatar            string  `json:"avatar"`
		Phone             string  `json:"phone"`
		Province          string  `json:"province"`
		City              string  `json:"city"`
		District          string  `json:"district"`
		Introduction      string  `json:"introduction"`
		Skills            string  `json:"skills"`
		YearsOfExperience int     `json:"years_of_experience"`
		Rating            float64 `json:"rating"`
		OrderCount        int     `json:"order_count"`
		Level             int     `json:"level"`
		IsCertified       int     `json:"is_certified"`
		Status            int     `json:"status"`
		Categories        []uint64 `json:"categories"`
	}

	worker := &WorkerDetail{}
	var avatar, district, introduction, skills sql.NullString
	err = database.MySQL.QueryRow(query, id).Scan(&worker.ID, &worker.UserID, &worker.RealName,
		&avatar, &worker.Phone, &worker.Province, &worker.City, &district,
		&introduction, &skills, &worker.YearsOfExperience, &worker.Rating,
		&worker.OrderCount, &worker.Level, &worker.IsCertified, &worker.Status)
	if err != nil {
		if err == sql.ErrNoRows {
			return response.NotFound(c, "师傅不存在")
		}
		return response.InternalServerError(c, "获取师傅详情失败")
	}
	if avatar.Valid {
		worker.Avatar = avatar.String
	}
	if district.Valid {
		worker.District = district.String
	}
	if introduction.Valid {
		worker.Introduction = introduction.String
	}
	if skills.Valid {
		worker.Skills = skills.String
	}

	categoryQuery := `SELECT category_id FROM worker_skills WHERE worker_id = ?`
	categoryRows, err := database.MySQL.Query(categoryQuery, id)
	if err == nil {
		defer categoryRows.Close()
		categories := make([]uint64, 0)
		for categoryRows.Next() {
			var categoryID uint64
			if err := categoryRows.Scan(&categoryID); err == nil {
				categories = append(categories, categoryID)
			}
		}
		worker.Categories = categories
	}

	return response.Success(c, worker)
}

func (h *WorkerHandler) GetWorkerReviews(c echo.Context) error {
	workerIDStr := c.Param("id")
	pageStr := c.QueryParam("page")
	pageSizeStr := c.QueryParam("page_size")

	if workerIDStr == "" {
		return response.BadRequest(c, "师傅ID不能为空")
	}

	workerID, err := strconv.ParseUint(workerIDStr, 10, 64)
	if err != nil {
		return response.BadRequest(c, "师傅ID格式错误")
	}

	page := 1
	if pageStr != "" {
		page, _ = strconv.Atoi(pageStr)
	}
	if page < 1 {
		page = 1
	}

	pageSize := 10
	if pageSizeStr != "" {
		pageSize, _ = strconv.Atoi(pageSizeStr)
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	var total int64
	countQuery := `SELECT COUNT(*) FROM reviews WHERE worker_id = ?`
	err = database.MySQL.QueryRow(countQuery, workerID).Scan(&total)
	if err != nil {
		return response.InternalServerError(c, "获取评价总数失败")
	}

	offset := (page - 1) * pageSize

	query := `SELECT r.id, r.order_id, r.user_id, r.service_id, r.rating, r.content, 
	          r.images, r.is_anonymous, r.reply_content, r.reply_at, r.created_at,
	          u.username, u.avatar 
	          FROM reviews r 
	          LEFT JOIN users u ON r.user_id = u.id 
	          WHERE r.worker_id = ? 
	          ORDER BY r.created_at DESC LIMIT ? OFFSET ?`

	rows, err := database.MySQL.Query(query, workerID, pageSize, offset)
	if err != nil {
		return response.InternalServerError(c, "获取评价列表失败")
	}
	defer rows.Close()

	type ReviewItem struct {
		ID           uint64 `json:"id"`
		OrderID      uint64 `json:"order_id"`
		UserID       uint64 `json:"user_id"`
		ServiceID    uint64 `json:"service_id"`
		Rating       int    `json:"rating"`
		Content      string `json:"content"`
		Images       string `json:"images"`
		IsAnonymous  int    `json:"is_anonymous"`
		ReplyContent string `json:"reply_content"`
		ReplyAt      string `json:"reply_at"`
		CreatedAt    string `json:"created_at"`
		Username     string `json:"username"`
		Avatar       string `json:"avatar"`
	}

	reviews := make([]*ReviewItem, 0)
	for rows.Next() {
		review := &ReviewItem{}
		var replyAt, createdAt sql.NullTime
		err := rows.Scan(&review.ID, &review.OrderID, &review.UserID, &review.ServiceID,
			&review.Rating, &review.Content, &review.Images, &review.IsAnonymous,
			&review.ReplyContent, &replyAt, &createdAt, &review.Username, &review.Avatar)
		if err != nil {
			return response.InternalServerError(c, "解析评价数据失败")
		}
		if replyAt.Valid {
			review.ReplyAt = replyAt.Time.Format("2006-01-02 15:04:05")
		}
		if createdAt.Valid {
			review.CreatedAt = createdAt.Time.Format("2006-01-02 15:04:05")
		}
		reviews = append(reviews, review)
	}

	result := &PaginationResult{
		List:     reviews,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}

	return response.Success(c, result)
}

func (h *WorkerHandler) WorkerRegister(c echo.Context) error {
	var req struct {
		UserID            uint64   `json:"user_id" form:"user_id"`
		RealName          string   `json:"real_name" form:"real_name"`
		IDCard            string   `json:"id_card" form:"id_card"`
		Phone             string   `json:"phone" form:"phone"`
		Province          string   `json:"province" form:"province"`
		City              string   `json:"city" form:"city"`
		District          string   `json:"district" form:"district"`
		Introduction      string   `json:"introduction" form:"introduction"`
		Skills            string   `json:"skills" form:"skills"`
		YearsOfExperience int      `json:"years_of_experience" form:"years_of_experience"`
		CategoryIDs       []uint64 `json:"category_ids" form:"category_ids"`
	}

	if err := c.Bind(&req); err != nil {
		return response.BadRequest(c, "请求参数错误")
	}

	if req.UserID == 0 {
		return response.BadRequest(c, "用户ID不能为空")
	}
	if req.RealName == "" {
		return response.BadRequest(c, "真实姓名不能为空")
	}
	if req.IDCard == "" {
		return response.BadRequest(c, "身份证号不能为空")
	}
	if req.Phone == "" {
		return response.BadRequest(c, "手机号不能为空")
	}
	if req.Province == "" {
		return response.BadRequest(c, "省份不能为空")
	}
	if req.City == "" {
		return response.BadRequest(c, "城市不能为空")
	}

	var existingCount int
	checkQuery := `SELECT COUNT(*) FROM workers WHERE user_id = ?`
	err := database.MySQL.QueryRow(checkQuery, req.UserID).Scan(&existingCount)
	if err != nil {
		return response.InternalServerError(c, "检查用户注册状态失败")
	}
	if existingCount > 0 {
		return response.BadRequest(c, "该用户已申请成为师傅")
	}

	tx, err := database.MySQL.Begin()
	if err != nil {
		return response.InternalServerError(c, "创建事务失败")
	}
	defer tx.Rollback()

	insertQuery := `INSERT INTO workers (user_id, real_name, id_card, phone, province, city, 
	                  district, introduction, skills, years_of_experience, rating, order_count, 
	                  level, is_certified, status) 
	                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 0, 1, 0, 1)`
	result, err := tx.Exec(insertQuery, req.UserID, req.RealName, req.IDCard, req.Phone,
		req.Province, req.City, req.District, req.Introduction, req.Skills, req.YearsOfExperience)
	if err != nil {
		return response.InternalServerError(c, "注册师傅信息失败")
	}

	workerID, err := result.LastInsertId()
	if err != nil {
		return response.InternalServerError(c, "获取师傅ID失败")
	}

	if len(req.CategoryIDs) > 0 {
		skillInsertQuery := `INSERT INTO worker_skills (worker_id, category_id) VALUES (?, ?)`
		stmt, err := tx.Prepare(skillInsertQuery)
		if err != nil {
			return response.InternalServerError(c, "准备技能插入失败")
		}
		defer stmt.Close()

		for _, categoryID := range req.CategoryIDs {
			_, err := stmt.Exec(workerID, categoryID)
			if err != nil {
				return response.InternalServerError(c, "插入技能信息失败")
			}
		}
	}

	if err := tx.Commit(); err != nil {
		return response.InternalServerError(c, "提交事务失败")
	}

	return response.SuccessWithMessage(c, "师傅注册申请提交成功", map[string]interface{}{
		"worker_id": workerID,
	})
}
