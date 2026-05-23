package db

import (
	"database/sql"
	"fmt"
	"wifipwd/internal/config"

	_ "modernc.org/sqlite"
)

func Open(cfg *config.Config) (*sql.DB, error) {
	conn, err := sql.Open("sqlite", fmt.Sprintf("%s?_pragma=journal_mode(WAL)&_pragma=foreign_keys(1)", cfg.DBPath))
	if err != nil {
		return nil, err
	}
	if err := conn.Ping(); err != nil {
		return nil, err
	}
	if err := migrate(conn); err != nil {
		return nil, err
	}
	return conn, nil
}

func migrate(db *sql.DB) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS networks (
			id TEXT PRIMARY KEY,
			ssid TEXT NOT NULL,
			security TEXT NOT NULL DEFAULT 'WPA',
			enc_password BLOB NOT NULL,
			enc_iv BLOB NOT NULL,
			enc_tag BLOB NOT NULL,
			notes TEXT,
			owner TEXT,
			expires_at TEXT,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS shares (
			id TEXT PRIMARY KEY,
			network_id TEXT NOT NULL,
			token TEXT NOT NULL UNIQUE,
			expires_at TEXT,
			visit_count INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL,
			FOREIGN KEY (network_id) REFERENCES networks(id) ON DELETE CASCADE
		)`,
		`CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(token)`,
		`CREATE INDEX IF NOT EXISTS idx_networks_expires ON networks(expires_at)`,
	}
	for _, s := range stmts {
		if _, err := db.Exec(s); err != nil {
			return err
		}
	}
	return nil
}
