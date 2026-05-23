package database

import (
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Init(dbPath string) error {
	var err error
	DB, err = sql.Open("sqlite", dbPath)
	if err != nil {
		return fmt.Errorf("open sqlite: %w", err)
	}
	DB.SetMaxOpenConns(1)
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("ping sqlite: %w", err)
	}
	return migrate()
}

func migrate() error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS shares (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			token TEXT NOT NULL UNIQUE,
			path TEXT NOT NULL,
			is_dir INTEGER NOT NULL DEFAULT 0,
			expire_at DATETIME,
			access_count INTEGER NOT NULL DEFAULT 0,
			max_access INTEGER NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL
		)`,
		`CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token)`,
	}
	for _, s := range stmts {
		if _, err := DB.Exec(s); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	return nil
}

type Share struct {
	ID          uint       `json:"id"`
	Token       string     `json:"token"`
	Path        string     `json:"path"`
	IsDir       bool       `json:"is_dir"`
	ExpireAt    *time.Time `json:"expire_at"`
	AccessCount int        `json:"access_count"`
	MaxAccess   int        `json:"max_access"`
	CreatedAt   time.Time  `json:"created_at"`
}

func (s *Share) Expired() bool {
	if s.ExpireAt == nil {
		return false
	}
	return time.Now().After(*s.ExpireAt)
}

func (s *Share) Maxed() bool {
	if s.MaxAccess <= 0 {
		return false
	}
	return s.AccessCount >= s.MaxAccess
}

func CreateShare(s *Share) error {
	s.CreatedAt = time.Now()
	res, err := DB.Exec(
		`INSERT INTO shares (token, path, is_dir, expire_at, access_count, max_access, created_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		s.Token, s.Path, boolToInt(s.IsDir), s.ExpireAt, s.AccessCount, s.MaxAccess, s.CreatedAt,
	)
	if err != nil {
		return err
	}
	id, err := res.LastInsertId()
	if err == nil {
		s.ID = uint(id)
	}
	return nil
}

func GetShareByToken(token string) (*Share, error) {
	row := DB.QueryRow(
		`SELECT id, token, path, is_dir, expire_at, access_count, max_access, created_at
		 FROM shares WHERE token = ?`, token,
	)
	s := &Share{}
	var isDir int
	err := row.Scan(&s.ID, &s.Token, &s.Path, &isDir, &s.ExpireAt, &s.AccessCount, &s.MaxAccess, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	s.IsDir = isDir != 0
	return s, nil
}

func ListShares() ([]Share, error) {
	rows, err := DB.Query(
		`SELECT id, token, path, is_dir, expire_at, access_count, max_access, created_at
		 FROM shares ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var shares []Share
	for rows.Next() {
		var s Share
		var isDir int
		if err := rows.Scan(&s.ID, &s.Token, &s.Path, &isDir, &s.ExpireAt, &s.AccessCount, &s.MaxAccess, &s.CreatedAt); err != nil {
			return nil, err
		}
		s.IsDir = isDir != 0
		shares = append(shares, s)
	}
	return shares, rows.Err()
}

func DeleteShare(id uint) error {
	_, err := DB.Exec(`DELETE FROM shares WHERE id = ?`, id)
	return err
}

func IncShareAccess(id uint) error {
	_, err := DB.Exec(`UPDATE shares SET access_count = access_count + 1 WHERE id = ?`, id)
	return err
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
