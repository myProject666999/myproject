package main

import (
	"log"

	"urbanrail/config"
	"urbanrail/database"
	"urbanrail/routers"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Println("警告: 无法加载环境变量文件，将使用默认值")
	}

	if err := database.Connect(); err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("数据库迁移失败: %v", err)
	}

	if err := database.SeedData(); err != nil {
		log.Printf("种子数据创建警告: %v", err)
	}

	r := routers.SetupRouter()

	log.Printf("服务器启动在端口 %s", config.AppConfig.Port)
	if err := r.Run(":" + config.AppConfig.Port); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
