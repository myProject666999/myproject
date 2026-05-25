package svc

import (
	"database/sql"

	"smart-customer-service/internal/config"
	"smart-customer-service/internal/socket"
	"smart-customer-service/internal/statemachine"

	_ "github.com/go-sql-driver/mysql"
	"github.com/zeromicro/go-zero/core/stores/redis"
)

type ServiceContext struct {
	Config       config.Config
	DB           *sql.DB
	RedisClient  *redis.Redis
	StateMachine *statemachine.StateMachine
	Hub          *socket.Hub
}

func NewServiceContext(c config.Config) *ServiceContext {
	db, err := sql.Open("mysql", c.Mysql.DataSource)
	if err != nil {
		panic(err)
	}
	db.SetMaxOpenConns(100)
	db.SetMaxIdleConns(10)

	rdb := redis.MustNewRedis(redis.RedisConf{
		Host: c.Redis.Host,
		Type: c.Redis.Type,
		Pass: c.Redis.Pass,
	})

	stateMachine := statemachine.NewStateMachine(db)

	return &ServiceContext{
		Config:       c,
		DB:           db,
		RedisClient:  rdb,
		StateMachine: stateMachine,
	}
}

func (s *ServiceContext) SetHub(hub *socket.Hub) {
	s.Hub = hub
}
