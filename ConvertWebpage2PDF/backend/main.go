package main

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
	"ConvertWebpage2PDF/config"
	"ConvertWebpage2PDF/controllers"
	"ConvertWebpage2PDF/models"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Printf("警告: 加载配置文件失败: %v", err)
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	if err := models.InitDB(dsn); err != nil {
		log.Fatalf("数据库连接失败: %v", err)
	}
	defer models.DB.Close()
	log.Println("数据库连接成功")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")
	{
		api.POST("/convert", controllers.ConvertWebpage)
		api.GET("/job/:id", controllers.GetJobStatus)
		api.GET("/download/:id", controllers.DownloadPDF)
		api.GET("/history", controllers.GetHistory)
		api.DELETE("/job/:id", controllers.DeleteJob)

		api.POST("/batch", controllers.BatchConvert)
		api.GET("/batch/:id", controllers.GetBatchStatus)
	}

	log.Printf("服务器启动在端口 %s", config.AppConfig.ServerPort)
	if err := r.Run(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatalf("服务器启动失败: %v", err)
	}
}
