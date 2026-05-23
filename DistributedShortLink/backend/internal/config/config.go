package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Name        string `yaml:"Name"`
	Host        string `yaml:"Host"`
	Port        int    `yaml:"Port"`
	ShortDomain string `yaml:"ShortDomain"`

	Mysql struct {
		DataSource string `yaml:"DataSource"`
	} `yaml:"Mysql"`

	Redis struct {
		Host string `yaml:"Host"`
		Pass string `yaml:"Pass"`
		DB   int    `yaml:"DB"`
	} `yaml:"Redis"`

	Auth struct {
		AccessSecret string `yaml:"AccessSecret"`
		AccessExpire int64  `yaml:"AccessExpire"`
	} `yaml:"Auth"`

	Sequence struct {
		Step int64 `yaml:"Step"`
	} `yaml:"Sequence"`

	Bloom struct {
		Key                 string  `yaml:"Key"`
		ExpectedInsertions  uint    `yaml:"ExpectedInsertions"`
		FalsePositiveRate   float64 `yaml:"FalsePositiveRate"`
	} `yaml:"Bloom"`

	MQueue struct {
		Stream        string `yaml:"Stream"`
		Group         string `yaml:"Group"`
		Consumer      string `yaml:"Consumer"`
		BatchSize     int64  `yaml:"BatchSize"`
		PullIntervalMs int   `yaml:"PullIntervalMs"`
	} `yaml:"MQueue"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read config: %w", err)
	}
	var c Config
	if err := yaml.Unmarshal(data, &c); err != nil {
		return nil, fmt.Errorf("parse config: %w", err)
	}
	if c.Port == 0 {
		c.Port = 8888
	}
	if c.Host == "" {
		c.Host = "0.0.0.0"
	}
	if c.Sequence.Step == 0 {
		c.Sequence.Step = 1000
	}
	return &c, nil
}
