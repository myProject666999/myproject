package oui

import (
	"encoding/csv"
	"io"
	"os"
	"strings"
	"sync"
)

var (
	once     sync.Once
	registry map[string]string
)

// Lookup returns vendor name for the given MAC address.
// The mac argument may contain separators like : or -.
func Lookup(mac string) string {
	once.Do(loadDefault)
	key := normalizePrefix(mac)
	if v, ok := registry[key]; ok {
		return v
	}
	return "Unknown"
}

func normalizePrefix(mac string) string {
	clean := strings.ToLower(strings.NewReplacer(":", "", "-", "", ".", "").Replace(mac))
	if len(clean) < 6 {
		return ""
	}
	return clean[:6]
}

func loadDefault() {
	registry = map[string]string{}
	// built-in common entries
	for k, v := range builtin {
		registry[k] = v
	}
	// try to load from oui.csv next to binary or working directory
	for _, path := range []string{"oui.csv", "data/oui.csv", "../data/oui.csv"} {
		if f, err := os.Open(path); err == nil {
			loadCSV(f)
			f.Close()
			return
		}
	}
}

func loadCSV(r io.Reader) {
	rd := csv.NewReader(r)
	rd.FieldsPerRecord = -1
	for {
		rec, err := rd.Read()
		if err != nil {
			return
		}
		if len(rec) < 2 {
			continue
		}
		prefix := strings.ToLower(strings.TrimSpace(rec[0]))
		vendor := strings.TrimSpace(rec[1])
		if len(prefix) != 6 {
			continue
		}
		registry[prefix] = vendor
	}
}
