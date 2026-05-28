package config

import (
	"github.com/zeromicro/go-zero/rest"
	"github.com/zeromicro/go-zero/core/stores/redis"
)

type Config struct {
	rest.RestConf
	MySQL struct {
		DataSource string
	}
	Redis redis.RedisConf
}
