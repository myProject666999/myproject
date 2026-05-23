package sequence

import (
	"context"
	"database/sql"
	"sync"
)

type NumberAllocator struct {
	mu   sync.Mutex
	db   *sql.DB
	step int64
	cur  int64
	max  int64
}

func New(db *sql.DB, step int64) *NumberAllocator {
	if step <= 0 {
		step = 1000
	}
	return &NumberAllocator{db: db, step: step}
}

func (n *NumberAllocator) Next(ctx context.Context) (uint64, error) {
	n.mu.Lock()
	defer n.mu.Unlock()
	if n.cur < n.max {
		n.cur++
		return uint64(n.cur), nil
	}
	return n.alloc(ctx)
}

func (n *NumberAllocator) alloc(ctx context.Context) (uint64, error) {
	for i := 0; i < 3; i++ {
		tx, err := n.db.BeginTx(ctx, nil)
		if err != nil {
			return 0, err
		}
		var current int64
		err = tx.QueryRowContext(ctx,
			"SELECT value FROM sequence WHERE stub='x' FOR UPDATE",
		).Scan(&current)
		if err != nil {
			_ = tx.Rollback()
			if err == sql.ErrNoRows {
				_, err2 := n.db.ExecContext(ctx,
					"INSERT IGNORE INTO sequence (stub, value) VALUES ('x', 0)")
				if err2 != nil {
					return 0, err2
				}
				continue
			}
			return 0, err
		}
		nextMax := current + n.step
		_, err = tx.ExecContext(ctx,
			"UPDATE sequence SET value=? WHERE stub='x'", nextMax)
		if err != nil {
			_ = tx.Rollback()
			return 0, err
		}
		if err := tx.Commit(); err != nil {
			return 0, err
		}
		n.cur = current
		n.max = nextMax
		n.cur++
		return uint64(n.cur), nil
	}
	return 0, ErrAllocFailed
}

var ErrAllocFailed = sql.ErrNoRows
