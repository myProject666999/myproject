package routes

import (
	"emergency-mutual-aid/controllers"
	"emergency-mutual-aid/middleware"

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
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.GET("/me", middleware.AuthMiddleware(), controllers.GetCurrentUser)
		}

		notices := api.Group("/notices")
		{
			notices.GET("", controllers.GetEmergencyNotices)
			notices.GET("/:id", controllers.GetEmergencyNotice)
		}

		materials := api.Group("/materials")
		{
			materials.GET("", controllers.GetMaterials)
			materials.GET("/:id", controllers.GetMaterial)
		}

		knowledge := api.Group("/knowledge")
		{
			knowledge.GET("", controllers.GetPsychologicalKnowledge)
			knowledge.GET("/:id", controllers.GetPsychologicalKnowledgeDetail)
		}

		rumors := api.Group("/rumors")
		{
			rumors.GET("", controllers.GetRumors)
			rumors.GET("/:id", controllers.GetRumor)
		}

		recruitments := api.Group("/recruitments")
		{
			recruitments.GET("", controllers.GetRecruitments)
			recruitments.GET("/:id", controllers.GetRecruitment)
			recruitments.POST("/:id/like", controllers.LikeRecruitment)
			recruitments.POST("/:id/dislike", controllers.DislikeRecruitment)
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware())
		{
			user.PUT("/profile", controllers.UpdateProfile)
			user.POST("/apply-material", controllers.ApplyMaterial)
			user.POST("/apply-recruitment", controllers.ApplyRecruitment)
			user.GET("/favorites", controllers.GetFavorites)
			user.POST("/favorites", controllers.AddFavorite)
			user.DELETE("/favorites/:id", controllers.RemoveFavorite)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
		{
			admin.GET("/dashboard", controllers.GetDashboardStats)
			admin.PUT("/change-password", controllers.ChangePassword)

			adminUsers := admin.Group("/users")
			{
				adminUsers.GET("", controllers.GetUsers)
				adminUsers.GET("/:id", controllers.GetUser)
				adminUsers.POST("", controllers.CreateUser)
				adminUsers.PUT("/:id", controllers.UpdateUser)
				adminUsers.DELETE("/:id", controllers.DeleteUser)
			}

			adminNotices := admin.Group("/notices")
			{
				adminNotices.POST("", controllers.CreateEmergencyNotice)
				adminNotices.PUT("/:id", controllers.UpdateEmergencyNotice)
				adminNotices.DELETE("/:id", controllers.DeleteEmergencyNotice)
			}

			adminMaterials := admin.Group("/materials")
			{
				adminMaterials.POST("", controllers.CreateMaterial)
				adminMaterials.PUT("/:id", controllers.UpdateMaterial)
				adminMaterials.DELETE("/:id", controllers.DeleteMaterial)
				adminMaterials.POST("/allocate", controllers.AllocateMaterial)
			}

			adminKnowledge := admin.Group("/knowledge")
			{
				adminKnowledge.POST("", controllers.CreatePsychologicalKnowledge)
				adminKnowledge.PUT("/:id", controllers.UpdatePsychologicalKnowledge)
				adminKnowledge.DELETE("/:id", controllers.DeletePsychologicalKnowledge)
			}

			adminRumors := admin.Group("/rumors")
			{
				adminRumors.POST("", controllers.CreateRumor)
				adminRumors.PUT("/:id", controllers.UpdateRumor)
				adminRumors.DELETE("/:id", controllers.DeleteRumor)
			}

			adminRecruitments := admin.Group("/recruitments")
			{
				adminRecruitments.POST("", controllers.CreateRecruitment)
				adminRecruitments.PUT("/:id", controllers.UpdateRecruitment)
				adminRecruitments.DELETE("/:id", controllers.DeleteRecruitment)
			}

			adminVolunteers := admin.Group("/volunteers")
			{
				adminVolunteers.GET("", controllers.GetVolunteers)
				adminVolunteers.GET("/:id", controllers.GetVolunteer)
				adminVolunteers.POST("", controllers.CreateVolunteer)
				adminVolunteers.PUT("/:id", controllers.UpdateVolunteer)
				adminVolunteers.DELETE("/:id", controllers.DeleteVolunteer)
			}

			adminHelpRequests := admin.Group("/help-requests")
			{
				adminHelpRequests.GET("", controllers.GetHelpRequests)
				adminHelpRequests.PUT("/:id/approve", controllers.ApproveHelpRequest)
				adminHelpRequests.GET("/stats", controllers.GetHelpRequestStats)
			}

			adminApplications := admin.Group("/applications")
			{
				adminApplications.GET("", controllers.GetApplications)
				adminApplications.PUT("/:id/approve", controllers.ApproveApplication)
			}

			adminRecruitmentApps := admin.Group("/recruitment-applications")
			{
				adminRecruitmentApps.GET("", controllers.GetRecruitmentApplications)
				adminRecruitmentApps.PUT("/:id/approve", controllers.ApproveRecruitmentApplication)
			}

			adminMedicalAids := admin.Group("/medical-aids")
			{
				adminMedicalAids.GET("", controllers.GetMedicalAids)
				adminMedicalAids.GET("/:id", controllers.GetMedicalAid)
				adminMedicalAids.PUT("/:id/approve", controllers.ApproveMedicalAid)
				adminMedicalAids.DELETE("/:id", controllers.DeleteMedicalAid)
			}
		}
	}

	return r
}
