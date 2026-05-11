package routes

import (
	"epidemic/controllers"
	"epidemic/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")

	public := api.Group("")
	{
		public.POST("/login", controllers.Login)
		public.GET("/public/announcements", controllers.GetPublicAnnouncements)
		public.GET("/public/activities", controllers.GetPublicActivities)
	}

	auth := api.Group("")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/user/info", controllers.GetInfo)
	}

	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/hospitals", controllers.GetHospitals)
		admin.GET("/hospitals/:id", controllers.GetHospital)
		admin.POST("/hospitals", controllers.CreateHospital)
		admin.PUT("/hospitals/:id", controllers.UpdateHospital)
		admin.DELETE("/hospitals/:id", controllers.DeleteHospital)

		admin.GET("/manufacturers", controllers.GetManufacturers)
		admin.GET("/manufacturers/:id", controllers.GetManufacturer)
		admin.POST("/manufacturers", controllers.CreateManufacturer)
		admin.PUT("/manufacturers/:id", controllers.UpdateManufacturer)
		admin.DELETE("/manufacturers/:id", controllers.DeleteManufacturer)

		admin.GET("/volunteers", controllers.GetVolunteers)
		admin.GET("/volunteers/:id", controllers.GetVolunteer)
		admin.POST("/volunteers", controllers.CreateVolunteer)
		admin.PUT("/volunteers/:id", controllers.UpdateVolunteer)
		admin.DELETE("/volunteers/:id", controllers.DeleteVolunteer)

		admin.GET("/activities", controllers.GetActivities)
		admin.GET("/activities/:id", controllers.GetActivity)
		admin.POST("/activities", controllers.CreateActivity)
		admin.PUT("/activities/:id", controllers.UpdateActivity)
		admin.DELETE("/activities/:id", controllers.DeleteActivity)

		admin.GET("/announcements", controllers.GetAnnouncements)
		admin.GET("/announcements/:id", controllers.GetAnnouncement)
		admin.POST("/announcements", controllers.CreateAnnouncement)
		admin.PUT("/announcements/:id", controllers.UpdateAnnouncement)
		admin.DELETE("/announcements/:id", controllers.DeleteAnnouncement)

		admin.GET("/finances", controllers.GetFinances)
		admin.GET("/finances/stats", controllers.GetFinanceStats)
		admin.POST("/finances", controllers.CreateFinance)
		admin.PUT("/finances/:id", controllers.UpdateFinance)
		admin.DELETE("/finances/:id", controllers.DeleteFinance)
	}

	return r
}
