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

	r.Static("/uploads", gin.Dir("./uploads", true))

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
	admin.Use(middleware.Auth(), middleware.AdminAuth())
	{
		admin.GET("/users", controllers.GetUserList)
		admin.GET("/users/:id", controllers.GetUserDetail)
		admin.POST("/users", controllers.CreateUser)
		admin.PUT("/users/:id", controllers.UpdateUser)
		admin.DELETE("/users/:id", controllers.DeleteUser)
		admin.POST("/users/batch-delete", controllers.BatchDeleteUser)

		admin.GET("/intros", controllers.AdminGetIntroList)
		admin.POST("/intros", controllers.AdminCreateIntro)
		admin.PUT("/intros/:id", controllers.AdminUpdateIntro)
		admin.DELETE("/intros/:id", controllers.AdminDeleteIntro)

		admin.GET("/projects", controllers.AdminGetProjectList)
		admin.POST("/projects", controllers.AdminCreateProject)
		admin.PUT("/projects/:id", controllers.AdminUpdateProject)
		admin.DELETE("/projects/:id", controllers.AdminDeleteProject)

		admin.GET("/papers", controllers.AdminGetPaperList)
		admin.POST("/papers", controllers.AdminCreatePaper)
		admin.PUT("/papers/:id", controllers.AdminUpdatePaper)
		admin.DELETE("/papers/:id", controllers.AdminDeletePaper)

		admin.GET("/questions", controllers.AdminGetQuestionList)
		admin.POST("/questions", controllers.AdminCreateQuestion)
		admin.PUT("/questions/:id", controllers.AdminUpdateQuestion)
		admin.DELETE("/questions/:id", controllers.AdminDeleteQuestion)

		admin.GET("/posts", controllers.AdminGetPostList)
		admin.PUT("/posts/:id", controllers.AdminUpdatePost)
		admin.DELETE("/posts/:id", controllers.AdminDeletePost)

		admin.GET("/orders", controllers.AdminGetOrderList)
		admin.GET("/orders/:id", controllers.AdminGetOrderDetail)

		admin.GET("/exam-records", controllers.AdminGetExamRecordList)
		admin.GET("/wrong-questions", controllers.AdminGetWrongQuestionList)
	}

	return r
}
