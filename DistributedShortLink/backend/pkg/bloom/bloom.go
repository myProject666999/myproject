package bloom

import (
	"context"
	"fmt"
	"math"

	"github.com/redis/go-redis/v9"
)

type Filter struct {
	rdb    *redis.Client
	key    string
	m      uint64
	k      uint64
	hashes []func([]byte) uint64
}

func New(rdb *redis.Client, key string, expectedInsertions uint, falsePositiveRate float64) *Filter {
	m := optimalM(expectedInsertions, falsePositiveRate)
	k := optimalK(expectedInsertions, m)
	return &Filter{
		rdb: rdb,
		key: key,
		m:   m,
		k:   k,
	}
}

func optimalM(n uint, p float64) uint64 {
	return uint64(math.Ceil(-1 * float64(n) * math.Log(p) / math.Pow(math.Log(2), 2)))
}

func optimalK(n uint, m uint64) uint64 {
	return uint64(math.Ceil(math.Log(2) * float64(m) / float64(n)))
}

// FNV-1a and FNV-1a with offset-based doubling
func (f *Filter) offsets(data []byte) []uint64 {
	offsets := make([]uint64, 0, f.k)
	seen := map[uint64]struct{}{}
	var h1, h2 uint64 = 1469598103934665603, 1099511628211
	for _, b := range data {
		h1 ^= uint64(b)
		h1 *= 1099511628211
		h2 ^= uint64(b)
		h2 *= 1099511628211 + 0x9e3779b9
	}
	for i := uint64(0); i < f.k; i++ {
		off := (h1 + i*h2) % f.m
		if _, ok := seen[off]; !ok {
			seen[off] = struct{}{}
			offsets = append(offsets, off)
		}
	}
	return offsets
}

func (f *Filter) Add(ctx context.Context, item string) error {
	offs := f.offsets([]byte(item))
	if len(offs) == 0 {
		return nil
	}
	pipe := f.rdb.Pipeline()
	for _, o := range offs {
		pipe.SetBit(ctx, f.key, int64(o), 1)
	}
	_, err := pipe.Exec(ctx)
	if err != nil {
		return fmt.Errorf("bloom add: %w", err)
	}
	return nil
}

func (f *Filter) MightContain(ctx context.Context, item string) (bool, error) {
	offs := f.offsets([]byte(item))
	if len(offs) == 0 {
		return false, nil
	}
	pipe := f.rdb.Pipeline()
	cmds := make([]*redis.IntCmd, 0, len(offs))
	for _, o := range offs {
		cmds = append(cmds, pipe.GetBit(ctx, f.key, int64(o)))
	}
	_, err := pipe.Exec(ctx)
	if err != nil {
		return true, fmt.Errorf("bloom query: %w", err)
	}
	for _, c := range cmds {
		v, err := c.Result()
		if err != nil {
			return true, err
		}
		if v == 0 {
			return false, nil
		}
	}
	return true, nil
}
