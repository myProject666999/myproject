package routes

import (
	"moonsister/controllers"
	"moonsister/middleware"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")

	api.POST("/login", controllers.Login)
	api.POST("/register", controllers.Register)

	auth := api.Group("/")
	auth.Use(middleware.JWT())
	{
		auth.GET("/profile", controllers.GetProfile)

		auth.GET("/skills", controllers.GetSkillTags)
		auth.GET("/nannies", controllers.GetNannies)
		auth.GET("/nannies/:id", controllers.GetNannyDetail)

		auth.GET("/courses", controllers.GetCourses)
		auth.GET("/courses/:id", controllers.GetCourseDetail)

		auth.GET("/disputes", controllers.GetDisputes)
		auth.GET("/reviews", controllers.GetReviews)

		auth.GET("/demands", controllers.GetDemands)

		auth.GET("/orders", controllers.GetOrders)

		auth.GET("/my-orders", controllers.GetMyOrders)
		auth.GET("/orders/:id", controllers.GetOrderDetail)
		auth.GET("/contracts/:order_id", controllers.GetContract)

		auth.GET("/demands/:id/recommend", controllers.RecommendNannies)
		auth.PUT("/contracts/:id/sign", controllers.SignContract)

		admin := auth.Group("/")
		admin.Use(middleware.RoleAuth("admin"))
		{
			admin.POST("/nannies", controllers.CreateNanny)
			admin.PUT("/nannies/:id", controllers.UpdateNanny)
			admin.DELETE("/nannies/:id", controllers.DeleteNanny)
			admin.POST("/nannies/:id/skills", controllers.AddNannySkill)
			admin.POST("/skills", controllers.CreateSkillTag)

			admin.PUT("/demands/:id/status", controllers.UpdateDemandStatus)

			admin.PUT("/orders/:id/status", controllers.UpdateOrderStatus)

			admin.POST("/contracts", controllers.CreateContract)

			admin.PUT("/disputes/:id/handle", controllers.HandleDispute)

			admin.POST("/courses", controllers.CreateCourse)
			admin.PUT("/courses/:id", controllers.UpdateCourse)
			admin.DELETE("/courses/:id", controllers.DeleteCourse)
		}

		customer := auth.Group("/")
		customer.Use(middleware.RoleAuth("customer", "admin"))
		{
			customer.POST("/demands", controllers.CreateDemand)
			customer.GET("/my-demands", controllers.GetMyDemands)

			customer.POST("/orders", controllers.CreateOrder)

			customer.POST("/reviews", controllers.CreateReview)

			customer.POST("/disputes", controllers.CreateDispute)

			customer.PUT("/daily-records/:id/review", controllers.ReviewDailyRecord)
		}

		nanny := auth.Group("/")
		nanny.Use(middleware.RoleAuth("nanny", "admin"))
		{
			nanny.POST("/checkin", controllers.CheckIn)
			nanny.POST("/checkout", controllers.CheckOut)
			nanny.GET("/attendance", controllers.GetAttendanceList)

			nanny.POST("/daily-records", controllers.CreateDailyRecord)
			nanny.GET("/daily-records", controllers.GetDailyRecords)

			nanny.POST("/courses/:id/learn", controllers.StartLearning)
			nanny.PUT("/courses/:id/progress", controllers.UpdateProgress)
			nanny.GET("/my-courses", controllers.GetMyCourses)
		}
	}
}
