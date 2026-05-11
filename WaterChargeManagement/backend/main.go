package main

import (
	"watercharge/config"
	"watercharge/controllers"
	"watercharge/database"
	"watercharge/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.InitDB()
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)

		auth := api.Group("/")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/me", controllers.GetCurrentUser)

			auth.POST("/admin/change-password", controllers.ChangeAdminPassword)
			auth.POST("/user/change-password", controllers.ChangeUserPassword)

			auth.GET("/user/bills", controllers.GetUserBills)

			admin := auth.Group("/")
			admin.Use(middleware.AdminMiddleware())
			{
				admin.GET("/admins", controllers.GetAdmins)
				admin.GET("/admins/:id", controllers.GetAdmin)
				admin.POST("/admins", controllers.CreateAdmin)
				admin.PUT("/admins/:id", controllers.UpdateAdmin)
				admin.DELETE("/admins/:id", controllers.DeleteAdmin)

				admin.GET("/users", controllers.GetUsers)
				admin.GET("/users/:id", controllers.GetUser)
				admin.POST("/users", controllers.CreateUser)
				admin.PUT("/users/:id", controllers.UpdateUser)
				admin.DELETE("/users/:id", controllers.DeleteUser)

				admin.GET("/communities", controllers.GetCommunities)
				admin.GET("/communities/:id", controllers.GetCommunity)
				admin.POST("/communities", controllers.CreateCommunity)
				admin.PUT("/communities/:id", controllers.UpdateCommunity)
				admin.DELETE("/communities/:id", controllers.DeleteCommunity)

				admin.GET("/settlement-types", controllers.GetSettlementTypes)
				admin.GET("/settlement-types/:id", controllers.GetSettlementType)
				admin.POST("/settlement-types", controllers.CreateSettlementType)
				admin.PUT("/settlement-types/:id", controllers.UpdateSettlementType)
				admin.DELETE("/settlement-types/:id", controllers.DeleteSettlementType)

				admin.GET("/water-prices", controllers.GetWaterPrices)
				admin.GET("/water-prices/:id", controllers.GetWaterPrice)
				admin.POST("/water-prices", controllers.CreateWaterPrice)
				admin.PUT("/water-prices/:id", controllers.UpdateWaterPrice)
				admin.DELETE("/water-prices/:id", controllers.DeleteWaterPrice)

				admin.GET("/water-meters", controllers.GetWaterMeters)
				admin.GET("/water-meters/:id", controllers.GetWaterMeter)
				admin.POST("/water-meters", controllers.CreateWaterMeter)
				admin.PUT("/water-meters/:id", controllers.UpdateWaterMeter)
				admin.DELETE("/water-meters/:id", controllers.DeleteWaterMeter)

				admin.GET("/water-bills", controllers.GetWaterBills)
				admin.GET("/water-bills/:id", controllers.GetWaterBill)
				admin.POST("/water-bills", controllers.CreateWaterBill)
				admin.PUT("/water-bills/:id", controllers.UpdateWaterBill)
				admin.POST("/water-bills/:id/pay", controllers.PayWaterBill)
				admin.DELETE("/water-bills/:id", controllers.DeleteWaterBill)
			}
		}
	}

	r.Run(config.ServerPort)
}
