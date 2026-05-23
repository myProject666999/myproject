package model

import (
	"context"
	"database/sql"
	"time"
)

type ShortLink struct {
	ID         uint64     `json:"id"`
	Code       string     `json:"code"`
	URL        string     `json:"url"`
	URLHash    string     `json:"-"`
	UserID     *uint64    `json:"userId"`
	ExpireAt   *time.Time `json:"expireAt"`
	Status     int8       `json:"status"`
	IsCustom   int8       `json:"isCustom"`
	ClickCount uint64     `json:"clickCount"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

type ShortLinkRepo struct {
	db *sql.DB
}

func NewShortLinkRepo(db *sql.DB) *ShortLinkRepo {
	return &ShortLinkRepo{db: db}
}

func (r *ShortLinkRepo) Insert(ctx context.Context, sl *ShortLink) error {
	res, err := r.db.ExecContext(ctx,
		"INSERT INTO short_link (code, url, url_hash, user_id, expire_at, status, is_custom) VALUES (?,?,?,?,?,?,?)",
		sl.Code, sl.URL, sl.URLHash, sl.UserID, sl.ExpireAt, sl.Status, sl.IsCustom,
	)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	sl.ID = uint64(id)
	return nil
}

func (r *ShortLinkRepo) GetByCode(ctx context.Context, code string) (*ShortLink, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, code, url, url_hash, user_id, expire_at, status, is_custom, click_count, created_at, updated_at FROM short_link WHERE code=?",
		code,
	)
	sl := &ShortLink{}
	var userId sql.NullInt64
	var expireAt sql.NullTime
	err := row.Scan(&sl.ID, &sl.Code, &sl.URL, &sl.URLHash, &userId, &expireAt, &sl.Status, &sl.IsCustom, &sl.ClickCount, &sl.CreatedAt, &sl.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if userId.Valid {
		u := uint64(userId.Int64)
		sl.UserID = &u
	}
	if expireAt.Valid {
		t := expireAt.Time
		sl.ExpireAt = &t
	}
	return sl, nil
}

func (r *ShortLinkRepo) GetByURLHash(ctx context.Context, urlHash string) (*ShortLink, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, code, url, url_hash, user_id, expire_at, status, is_custom, click_count, created_at, updated_at FROM short_link WHERE url_hash=? AND is_custom=0 ORDER BY id ASC LIMIT 1",
		urlHash,
	)
	sl := &ShortLink{}
	var userId sql.NullInt64
	var expireAt sql.NullTime
	err := row.Scan(&sl.ID, &sl.Code, &sl.URL, &sl.URLHash, &userId, &expireAt, &sl.Status, &sl.IsCustom, &sl.ClickCount, &sl.CreatedAt, &sl.UpdatedAt)
	if err != nil {
		return nil, err
	}
	if userId.Valid {
		u := uint64(userId.Int64)
		sl.UserID = &u
	}
	if expireAt.Valid {
		t := expireAt.Time
		sl.ExpireAt = &t
	}
	return sl, nil
}

func (r *ShortLinkRepo) ListByUser(ctx context.Context, userID uint64, page, size int) ([]ShortLink, int64, error) {
	var total int64
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM short_link WHERE user_id=?", userID,
	).Scan(&total)
	if err != nil {
		return nil, 0, err
	}
	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = 10
	}
	rows, err := r.db.QueryContext(ctx,
		"SELECT id, code, url, url_hash, user_id, expire_at, status, is_custom, click_count, created_at, updated_at FROM short_link WHERE user_id=? ORDER BY id DESC LIMIT ? OFFSET ?",
		userID, size, (page-1)*size,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	var list []ShortLink
	for rows.Next() {
		sl := ShortLink{}
		var userId sql.NullInt64
		var expireAt sql.NullTime
		err := rows.Scan(&sl.ID, &sl.Code, &sl.URL, &sl.URLHash, &userId, &expireAt, &sl.Status, &sl.IsCustom, &sl.ClickCount, &sl.CreatedAt, &sl.UpdatedAt)
		if err != nil {
			return nil, 0, err
		}
		if userId.Valid {
			u := uint64(userId.Int64)
			sl.UserID = &u
		}
		if expireAt.Valid {
			t := expireAt.Time
			sl.ExpireAt = &t
		}
		list = append(list, sl)
	}
	return list, total, nil
}

func (r *ShortLinkRepo) UpdateStatus(ctx context.Context, id uint64, userID uint64, status int8) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE short_link SET status=? WHERE id=? AND user_id=?",
		status, id, userID,
	)
	return err
}

func (r *ShortLinkRepo) Delete(ctx context.Context, id uint64, userID uint64) error {
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM short_link WHERE id=? AND user_id=?",
		id, userID,
	)
	return err
}

func (r *ShortLinkRepo) IncrementClick(ctx context.Context, id uint64) error {
	_, err := r.db.ExecContext(ctx,
		"UPDATE short_link SET click_count=click_count+1 WHERE id=?", id,
	)
	return err
}

// ------- access log --------

type AccessLog struct {
	ID           uint64    `json:"id"`
	Code         string    `json:"code"`
	ShortLinkID  *uint64   `json:"shortLinkId"`
	IP           string    `json:"ip"`
	UserAgent    string    `json:"userAgent"`
	Referer      string    `json:"referer"`
	CreatedAt    time.Time `json:"createdAt"`
}

type AccessLogRepo struct {
	db *sql.DB
}

func NewAccessLogRepo(db *sql.DB) *AccessLogRepo {
	return &AccessLogRepo{db: db}
}

func (r *AccessLogRepo) BatchInsert(ctx context.Context, logs []AccessLog) error {
	if len(logs) == 0 {
		return nil
	}
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	stmt, err := tx.PrepareContext(ctx,
		"INSERT INTO access_log (code, short_link_id, ip, user_agent, referer) VALUES (?,?,?,?,?)",
	)
	if err != nil {
		return err
	}
	defer stmt.Close()
	for _, l := range logs {
		_, err := stmt.ExecContext(ctx, l.Code, l.ShortLinkID, l.IP, l.UserAgent, l.Referer)
		if err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *AccessLogRepo) CountByCodeAndRange(ctx context.Context, code string, from, to time.Time) (int64, error) {
	var n int64
	err := r.db.QueryRowContext(ctx,
		"SELECT COUNT(*) FROM access_log WHERE code=? AND created_at>=? AND created_at<?",
		code, from, to,
	).Scan(&n)
	return n, err
}

type DailyPoint struct {
	Day string
	Cnt int64
}

func (r *AccessLogRepo) DailyTrend(ctx context.Context, code string, days int) ([]DailyPoint, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS d, COUNT(*) AS c FROM access_log WHERE code=? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) GROUP BY d ORDER BY d ASC",
		code, days,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []DailyPoint
	for rows.Next() {
		var d string
		var c int64
		if err := rows.Scan(&d, &c); err != nil {
			return nil, err
		}
		out = append(out, DailyPoint{Day: d, Cnt: c})
	}
	return out, nil
}

// ------- user --------

type User struct {
	ID        uint64    `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"-"`
	Email     string    `json:"email"`
	Status    int8      `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type UserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) *UserRepo {
	return &UserRepo{db: db}
}

func (r *UserRepo) Insert(ctx context.Context, u *User) error {
	res, err := r.db.ExecContext(ctx,
		"INSERT INTO user (username, password, email, status) VALUES (?,?,?,?)",
		u.Username, u.Password, u.Email, u.Status,
	)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return err
	}
	u.ID = uint64(id)
	return nil
}

func (r *UserRepo) GetByUsername(ctx context.Context, username string) (*User, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, username, password, email, status, created_at, updated_at FROM user WHERE username=?",
		username,
	)
	u := &User{}
	err := row.Scan(&u.ID, &u.Username, &u.Password, &u.Email, &u.Status, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *UserRepo) GetByID(ctx context.Context, id uint64) (*User, error) {
	row := r.db.QueryRowContext(ctx,
		"SELECT id, username, password, email, status, created_at, updated_at FROM user WHERE id=?",
		id,
	)
	u := &User{}
	err := row.Scan(&u.ID, &u.Username, &u.Password, &u.Email, &u.Status, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}
