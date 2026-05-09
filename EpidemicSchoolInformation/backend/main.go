package main

import (
	"github.com/epidemic-system/database"
	"github.com/epidemic-system/routes"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()

	r := gin.Default()

	routes.SetupRoutes(r)

	r.Run(":8080")
}
