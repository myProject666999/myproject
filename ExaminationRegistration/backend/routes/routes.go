package routes

import (
	"examination-registration/controllers"
	"examination-registration/middleware"

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

	r.StaticFS("/uploads", gin.Dir("./uploads", true))

	api := r.Group("/api")

	api.POST("/register", controllers.Register)
	api.POST("/login", controllers.Login)

	public := api.Group("")
	{
		public.GET("/intros", controllers.GetIntroList)
		public.GET("/intros/:id", controllers.GetIntroDetail)

		public.GET("/projects", controllers.GetProjectList)
		public.GET("/projects/:id", controllers.GetProjectDetail)

		public.GET("/papers", controllers.GetPaperList)
		public.GET("/papers/:id", controllers.GetPaperDetail)

		public.GET("/posts", controllers.GetPostList)
		public.GET("/posts/:id", controllers.GetPostDetail)
	}

	user := api.Group("")
	user.Use(middleware.Auth())
	{
		user.POST("/intros/:id/like", controllers.LikeIntro)
		user.POST("/intros/:id/dislike", controllers.DislikeIntro)

		user.POST("/cart", controllers.AddToCart)
		user.GET("/cart", controllers.GetCartList)
		user.PUT("/cart/:id", controllers.UpdateCartItem)
		user.DELETE("/cart/:id", controllers.RemoveCartItem)

		user.POST("/orders", controllers.CreateOrder)
		user.GET("/orders", controllers.GetOrderList)
		user.GET("/orders/:id", controllers.GetOrderDetail)
		user.POST("/orders/:id/pay", controllers.PayOrder)

		user.GET("/addresses", controllers.GetAddressList)
		user.POST("/addresses", controllers.CreateAddress)
		user.PUT("/addresses/:id", controllers.UpdateAddress)
		user.DELETE("/addresses/:id", controllers.DeleteAddress)
		user.POST("/addresses/:id/default", controllers.SetDefaultAddress)

		user.POST("/favorites", controllers.AddFavorite)
		user.DELETE("/favorites/:id", controllers.RemoveFavorite)
		user.GET("/favorites", controllers.GetFavoriteList)
		user.GET("/favorites/check", controllers.CheckFavorite)

		user.GET("/papers/:id/questions", controllers.GetPaperQuestions)
		user.POST("/papers/:id/start", controllers.StartExam)
		user.POST("/exam-records/:record_id/submit", controllers.SubmitExam)

		user.GET("/exam-records", controllers.GetExamRecordList)
		user.GET("/exam-records/:id", controllers.GetExamRecordDetail)

		user.GET("/wrong-questions", controllers.GetWrongQuestionList)
		user.DELETE("/wrong-questions/:id", controllers.RemoveWrongQuestion)

		user.POST("/posts", controllers.CreatePost)
		user.GET("/my-posts", controllers.GetMyPosts)

		user.GET("/user/info", controllers.GetCurrentUser)
		user.PUT("/user/profile", controllers.UpdateProfile)
		user.PUT("/user/password", controllers.UpdatePassword)
	}

	admin := api.Group("/admin")
	{
		admin.POST("/login", controllers.AdminLogin)

		adminAuth := admin.Group("")
		adminAuth.Use(middleware.Auth(), middleware.AdminAuth())
		{
			adminAuth.GET("/users", controllers.GetUserList)
			adminAuth.GET("/users/:id", controllers.GetUserDetail)
			adminAuth.POST("/users", controllers.CreateUser)
			adminAuth.PUT("/users/:id", controllers.UpdateUser)
			adminAuth.DELETE("/users/:id", controllers.DeleteUser)
			adminAuth.POST("/users/batch-delete", controllers.BatchDeleteUser)

			adminAuth.GET("/school-intros", controllers.AdminGetIntroList)
			adminAuth.POST("/school-intros", controllers.AdminCreateIntro)
			adminAuth.PUT("/school-intros/:id", controllers.AdminUpdateIntro)
			adminAuth.DELETE("/school-intros/:id", controllers.AdminDeleteIntro)

			adminAuth.GET("/enrollment-projects", controllers.AdminGetProjectList)
			adminAuth.POST("/enrollment-projects", controllers.AdminCreateProject)
			adminAuth.PUT("/enrollment-projects/:id", controllers.AdminUpdateProject)
			adminAuth.DELETE("/enrollment-projects/:id", controllers.AdminDeleteProject)

			adminAuth.GET("/exam-papers", controllers.AdminGetPaperList)
			adminAuth.POST("/exam-papers", controllers.AdminCreatePaper)
			adminAuth.PUT("/exam-papers/:id", controllers.AdminUpdatePaper)
			adminAuth.DELETE("/exam-papers/:id", controllers.AdminDeletePaper)

			adminAuth.GET("/questions", controllers.AdminGetQuestionList)
			adminAuth.GET("/questions/:id", controllers.AdminGetQuestionDetail)
			adminAuth.POST("/questions", controllers.AdminCreateQuestion)
			adminAuth.PUT("/questions/:id", controllers.AdminUpdateQuestion)
			adminAuth.DELETE("/questions/:id", controllers.AdminDeleteQuestion)

			adminAuth.GET("/forum-posts", controllers.AdminGetPostList)
			adminAuth.GET("/forum-posts/:id", controllers.AdminGetPostDetail)
			adminAuth.PUT("/forum-posts/:id", controllers.AdminUpdatePost)
			adminAuth.DELETE("/forum-posts/:id", controllers.AdminDeletePost)

			adminAuth.GET("/orders", controllers.AdminGetOrderList)
			adminAuth.GET("/orders/:id", controllers.AdminGetOrderDetail)

			adminAuth.GET("/exam-records", controllers.AdminGetExamRecordList)
			adminAuth.GET("/wrong-questions", controllers.AdminGetWrongQuestionList)
		}
	}

	return r
}
