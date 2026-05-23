package repository

import (
	"database/sql"
	"errors"
	"time"
	"wifipwd/internal/model"

	"github.com/google/uuid"
)

type NetworkRepo struct {
	DB *sql.DB
}

func NewNetworkRepo(db *sql.DB) *NetworkRepo {
	return &NetworkRepo{DB: db}
}

type NetworkRow struct {
	ID          string
	SSID        string
	Security    string
	EncPassword []byte
	EncIV       []byte
	EncTag      []byte
	Notes       string
	Owner       string
	ExpiresAt   sql.NullString
	CreatedAt   string
	UpdatedAt   string
}

func (r *NetworkRepo) List() ([]NetworkRow, error) {
	rows, err := r.DB.Query(`SELECT id, ssid, security, enc_password, enc_iv, enc_tag, notes, owner, expires_at, created_at, updated_at FROM networks ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []NetworkRow
	for rows.Next() {
		var n NetworkRow
		if err := rows.Scan(&n.ID, &n.SSID, &n.Security, &n.EncPassword, &n.EncIV, &n.EncTag, &n.Notes, &n.Owner, &n.ExpiresAt, &n.CreatedAt, &n.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, rows.Err()
}

func (r *NetworkRepo) Get(id string) (*NetworkRow, error) {
	row := r.DB.QueryRow(`SELECT id, ssid, security, enc_password, enc_iv, enc_tag, notes, owner, expires_at, created_at, updated_at FROM networks WHERE id = ?`, id)
	var n NetworkRow
	if err := row.Scan(&n.ID, &n.SSID, &n.Security, &n.EncPassword, &n.EncIV, &n.EncTag, &n.Notes, &n.Owner, &n.ExpiresAt, &n.CreatedAt, &n.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &n, nil
}

func (r *NetworkRepo) Create(n *model.Network, encPassword, iv, tag []byte) (*NetworkRow, error) {
	now := time.Now().UTC()
	id := uuid.New().String()
	var exp sql.NullString
	if n.ExpiresAt != nil {
		exp = sql.NullString{String: *n.ExpiresAt, Valid: true}
	}
	_, err := r.DB.Exec(`INSERT INTO networks (id, ssid, security, enc_password, enc_iv, enc_tag, notes, owner, expires_at, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		id, n.SSID, n.Security, encPassword, iv, tag, n.Notes, n.Owner, exp, now.Format(time.RFC3339), now.Format(time.RFC3339))
	if err != nil {
		return nil, err
	}
	return r.Get(id)
}

func (r *NetworkRepo) Update(n *model.Network, encPassword, iv, tag []byte) (*NetworkRow, error) {
	now := time.Now().UTC()
	var exp sql.NullString
	if n.ExpiresAt != nil {
		exp = sql.NullString{String: *n.ExpiresAt, Valid: true}
	}
	res, err := r.DB.Exec(`UPDATE networks SET ssid=?, security=?, enc_password=?, enc_iv=?, enc_tag=?, notes=?, owner=?, expires_at=?, updated_at=? WHERE id=?`,
		n.SSID, n.Security, encPassword, iv, tag, n.Notes, n.Owner, exp, now.Format(time.RFC3339), n.ID)
	if err != nil {
		return nil, err
	}
	affected, _ := res.RowsAffected()
	if affected == 0 {
		return nil, nil
	}
	return r.Get(n.ID)
}

func (r *NetworkRepo) Delete(id string) error {
	_, err := r.DB.Exec(`DELETE FROM networks WHERE id=?`, id)
	return err
}

type ShareRow struct {
	ID         string
	NetworkID  string
	Token      string
	ExpiresAt  sql.NullString
	VisitCount int
	CreatedAt  string
}

type ShareRepo struct {
	DB *sql.DB
}

func NewShareRepo(db *sql.DB) *ShareRepo {
	return &ShareRepo{DB: db}
}

func (r *ShareRepo) Create(networkID string, expiresAt *string) (*ShareRow, error) {
	id := uuid.New().String()
	token := uuid.New().String()
	now := time.Now().UTC()
	var exp sql.NullString
	if expiresAt != nil {
		exp = sql.NullString{String: *expiresAt, Valid: true}
	}
	_, err := r.DB.Exec(`INSERT INTO shares (id, network_id, token, expires_at, visit_count, created_at) VALUES (?,?,?,?,0,?)`,
		id, networkID, token, exp, now.Format(time.RFC3339))
	if err != nil {
		return nil, err
	}
	return r.GetByToken(token)
}

func (r *ShareRepo) GetByToken(token string) (*ShareRow, error) {
	row := r.DB.QueryRow(`SELECT id, network_id, token, expires_at, visit_count, created_at FROM shares WHERE token=?`, token)
	var s ShareRow
	if err := row.Scan(&s.ID, &s.NetworkID, &s.Token, &s.ExpiresAt, &s.VisitCount, &s.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *ShareRepo) IncVisit(id string) error {
	_, err := r.DB.Exec(`UPDATE shares SET visit_count=visit_count+1 WHERE id=?`, id)
	return err
}

func (r *ShareRepo) ListByNetwork(networkID string) ([]ShareRow, error) {
	rows, err := r.DB.Query(`SELECT id, network_id, token, expires_at, visit_count, created_at FROM shares WHERE network_id=? ORDER BY created_at DESC`, networkID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []ShareRow
	for rows.Next() {
		var s ShareRow
		if err := rows.Scan(&s.ID, &s.NetworkID, &s.Token, &s.ExpiresAt, &s.VisitCount, &s.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, s)
	}
	return out, rows.Err()
}

func (r *ShareRepo) Delete(id string) error {
	_, err := r.DB.Exec(`DELETE FROM shares WHERE id=?`, id)
	return err
}
