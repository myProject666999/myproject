package routes

import (
	"hospital-medical-record/config"
	"hospital-medical-record/controllers"
	"hospital-medical-record/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.Static("/uploads", config.AppConfig.Upload.Dir)

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "server is running",
		})
	})

	api := r.Group("/api")
	{
		api.POST("/login", controllers.Login)

		auth := api.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/me", controllers.GetCurrentUser)
			auth.PUT("/change-password", controllers.ChangePassword)

			admin := auth.Group("")
			admin.Use(middleware.RequireRole("admin"))
			{
				users := admin.Group("/users")
				{
					users.GET("", controllers.GetUsers)
					users.GET("/:id", controllers.GetUser)
					users.POST("", controllers.CreateUser)
					users.PUT("/:id", controllers.UpdateUser)
					users.DELETE("/:id", controllers.DeleteUser)
					users.POST("/:id/reset-password", controllers.ResetUserPassword)
				}
			}

			staff := auth.Group("")
			staff.Use(middleware.RequireRole("admin", "doctor", "nurse"))
			{
				doctors := staff.Group("/doctors")
				{
					doctors.GET("", controllers.GetDoctors)
					doctors.GET("/:id", controllers.GetDoctor)
					doctors.POST("", controllers.CreateDoctor)
					doctors.PUT("/:id", controllers.UpdateDoctor)
					doctors.DELETE("/:id", controllers.DeleteDoctor)
				}

				nurses := staff.Group("/nurses")
				{
					nurses.GET("", controllers.GetNurses)
					nurses.GET("/:id", controllers.GetNurse)
					nurses.POST("", controllers.CreateNurse)
					nurses.PUT("/:id", controllers.UpdateNurse)
					nurses.DELETE("/:id", controllers.DeleteNurse)
				}

				patients := staff.Group("/patients")
				{
					patients.GET("", controllers.GetPatients)
					patients.GET("/:id", controllers.GetPatient)
					patients.POST("", controllers.CreatePatient)
					patients.PUT("/:id", controllers.UpdatePatient)
					patients.DELETE("/:id", controllers.DeletePatient)
				}

				records := staff.Group("/medical-records")
				{
					records.GET("", controllers.GetMedicalRecords)
					records.GET("/:id", controllers.GetMedicalRecord)
					records.POST("", controllers.CreateMedicalRecord)
					records.PUT("/:id", controllers.UpdateMedicalRecord)
					records.DELETE("/:id", controllers.DeleteMedicalRecord)
				}

				medicines := staff.Group("/medicines")
				{
					medicines.GET("", controllers.GetMedicines)
					medicines.GET("/:id", controllers.GetMedicine)
					medicines.POST("", controllers.CreateMedicine)
					medicines.PUT("/:id", controllers.UpdateMedicine)
					medicines.DELETE("/:id", controllers.DeleteMedicine)
					medicines.POST("/upload-image", controllers.UploadMedicineImage)
				}
			}
		}
	}

	return r
}
