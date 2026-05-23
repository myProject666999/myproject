package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

type Config struct {
	Port       int    `json:"port"`
	DataRoot   string `json:"data_root"`
	DBPath     string `json:"db_path"`
	MaxUpload  int64  `json:"max_upload_mb"`
}

var DefaultConfig = Config{
	Port:      8080,
	DataRoot:  "./data",
	DBPath:    "./simplehomenas.db",
	MaxUpload: 4096,
}

func Load(path string) (*Config, error) {
	cfg := DefaultConfig
	if path == "" {
		return &cfg, nil
	}
	data, err := os.ReadFile(path)
	if err != nil {
		if os.IsNotExist(err) {
			return &cfg, nil
		}
		return nil, err
	}
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, err
	}
	if cfg.DataRoot == "" {
		cfg.DataRoot = DefaultConfig.DataRoot
	}
	absRoot, _ := filepath.Abs(cfg.DataRoot)
	cfg.DataRoot = absRoot
	return &cfg, nil
}

func (c *Config) DataRootAbs() string {
	abs, _ := filepath.Abs(c.DataRoot)
	return abs
}
