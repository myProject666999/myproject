package main

import (
	"flag"
	"fmt"

	"smart-customer-service/internal/config"
	"smart-customer-service/internal/handler"
	"smart-customer-service/internal/scheduler"
	"smart-customer-service/internal/svc"
	"smart-customer-service/internal/socket"

	"github.com/zeromicro/go-zero/core/conf"
	"github.com/zeromicro/go-zero/core/logx"
	"github.com/zeromicro/go-zero/rest"
)

var configFile = flag.String("f", "etc/service-api.yaml", "the config file")

func main() {
	flag.Parse()

	var c config.Config
	conf.MustLoad(*configFile, &c)

	server := rest.MustNewServer(c.RestConf)
	defer server.Stop()

	ctx := svc.NewServiceContext(c)
	handler.RegisterHandlers(server, ctx)

	hub := socket.NewHub()
	ctx.SetHub(hub)
	go hub.Run()

	slaScheduler := scheduler.NewSLAScheduler(ctx)
	go slaScheduler.Start()

	fmt.Printf("Starting server at %s:%d...\n", c.Host, c.Port)
	logx.Info("Server starting...")
	server.Start()
}
