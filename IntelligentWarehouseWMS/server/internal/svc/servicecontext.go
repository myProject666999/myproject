package svc

import (
	"wms-server/config"
	"wms-server/model"

	"github.com/zeromicro/go-zero/core/stores/redis"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
)

type ServiceContext struct {
	Config              config.Config
	RedisClient         *redis.Redis
	CacheManager        *model.CacheManager
	SysUserModel        model.SysUserModel
	WarehouseModel      model.WarehouseModel
	ShelfModel          model.ShelfModel
	LocationModel       model.LocationModel
	ProductModel        model.ProductModel
	InventoryModel      model.InventoryModel
	InventoryLogModel   model.InventoryLogModel
	InboundOrderModel   model.InboundOrderModel
	OutboundOrderModel  model.OutboundOrderModel
	PickingTaskModel    model.PickingTaskModel
	PutawayTaskModel    model.PutawayTaskModel
	StocktakeTaskModel  model.StocktakeTaskModel
}

func NewServiceContext(c config.Config) *ServiceContext {
	conn := sqlx.NewMysql(c.MySQL.DataSource)
	redisClient := redis.MustNewRedis(c.Redis)
	cacheManager := model.NewCacheManager(redisClient)

	return &ServiceContext{
		Config:              c,
		RedisClient:         redisClient,
		CacheManager:        cacheManager,
		SysUserModel:        model.NewSysUserModel(conn),
		WarehouseModel:      model.NewWarehouseModel(conn),
		ShelfModel:          model.NewShelfModel(conn),
		LocationModel:       model.NewLocationModel(conn),
		ProductModel:        model.NewProductModel(conn),
		InventoryModel:      model.NewInventoryModel(conn),
		InventoryLogModel:   model.NewInventoryLogModel(conn),
		InboundOrderModel:   model.NewInboundOrderModel(conn),
		OutboundOrderModel:  model.NewOutboundOrderModel(conn),
		PickingTaskModel:    model.NewPickingTaskModel(conn),
		PutawayTaskModel:    model.NewPutawayTaskModel(conn),
		StocktakeTaskModel:  model.NewStocktakeTaskModel(conn),
	}
}
