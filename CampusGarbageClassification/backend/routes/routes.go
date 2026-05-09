package routes

import (
	"garbage-classification/controllers"
	"garbage-classification/middleware"

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

	public := r.Group("/api")
	{
		public.POST("/login", controllers.Login)
		public.POST("/register", controllers.Register)

		public.GET("/siteinfo", controllers.GetSiteInfo)

		public.GET("/notices", controllers.GetNoticeList)
		public.GET("/notices/:id", controllers.GetNoticeDetail)

		public.GET("/advocate-categories", controllers.GetAdvocateCategories)
		public.GET("/advocates", controllers.GetAdvocateList)
		public.GET("/advocates/:id", controllers.GetAdvocateDetail)

		public.GET("/bag-types", controllers.GetBagTypes)
		public.GET("/bags", controllers.GetBagList)
		public.GET("/bags/:id", controllers.GetBagDetail)

		public.GET("/products", controllers.GetProductList)
		public.GET("/products/:id", controllers.GetProductDetail)

		public.GET("/creative-types", controllers.GetCreativeTypes)
	}

	student := r.Group("/api")
	student.Use(middleware.AuthMiddleware(), middleware.StudentMiddleware())
	{
		student.GET("/user/me", controllers.GetCurrentUser)
		student.PUT("/user/profile", controllers.UpdateProfile)
		student.PUT("/user/password", controllers.UpdatePassword)

		student.POST("/bags/purchase", controllers.PurchaseBag)
		student.GET("/my-purchases", controllers.GetMyPurchases)

		student.POST("/products/exchange", controllers.ExchangeProduct)
		student.GET("/my-exchanges", controllers.GetMyExchanges)

		student.GET("/my-throws", controllers.GetMyThrowRecords)
		student.POST("/throws", controllers.AddThrowRecord)

		student.GET("/my-creatives", controllers.GetMyCreatives)
		student.POST("/creatives", controllers.CreateCreative)
		student.PUT("/creatives/:id", controllers.UpdateCreative)
		student.DELETE("/creatives/:id", controllers.DeleteCreative)
	}

	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		admin.GET("/me", controllers.GetCurrentUser)
		admin.PUT("/profile", controllers.UpdateProfile)
		admin.PUT("/password", controllers.UpdatePassword)

		admin.POST("/siteinfo", controllers.UpdateSiteInfo)

		admin.GET("/students", controllers.GetStudents)

		admin.GET("/notices", controllers.AdminGetNoticeList)
		admin.POST("/notices", controllers.CreateNotice)
		admin.PUT("/notices/:id", controllers.UpdateNotice)
		admin.DELETE("/notices/:id", controllers.DeleteNotice)

		admin.GET("/advocate-categories", controllers.GetAdvocateCategories)
		admin.POST("/advocate-categories", controllers.CreateAdvocateCategory)
		admin.PUT("/advocate-categories/:id", controllers.UpdateAdvocateCategory)
		admin.DELETE("/advocate-categories/:id", controllers.DeleteAdvocateCategory)

		admin.GET("/advocates", controllers.AdminGetAdvocateList)
		admin.POST("/advocates", controllers.CreateAdvocate)
		admin.PUT("/advocates/:id", controllers.UpdateAdvocate)
		admin.DELETE("/advocates/:id", controllers.DeleteAdvocate)

		admin.GET("/bag-types", controllers.GetBagTypes)
		admin.POST("/bag-types", controllers.CreateBagType)
		admin.PUT("/bag-types/:id", controllers.UpdateBagType)
		admin.DELETE("/bag-types/:id", controllers.DeleteBagType)

		admin.GET("/bags", controllers.AdminGetBagList)
		admin.POST("/bags", controllers.CreateBag)
		admin.PUT("/bags/:id", controllers.UpdateBag)
		admin.DELETE("/bags/:id", controllers.DeleteBag)
		admin.GET("/purchases", controllers.AdminGetPurchases)

		admin.GET("/bins", controllers.GetBins)
		admin.POST("/bins", controllers.CreateBin)
		admin.PUT("/bins/:id", controllers.UpdateBin)
		admin.DELETE("/bins/:id", controllers.DeleteBin)

		admin.GET("/throws", controllers.GetThrowRecords)

		admin.GET("/products", controllers.AdminGetProductList)
		admin.POST("/products", controllers.CreateProduct)
		admin.PUT("/products/:id", controllers.UpdateProduct)
		admin.DELETE("/products/:id", controllers.DeleteProduct)
		admin.GET("/exchanges", controllers.AdminGetExchanges)

		admin.GET("/creative-types", controllers.GetCreativeTypes)
		admin.POST("/creative-types", controllers.CreateCreativeType)
		admin.PUT("/creative-types/:id", controllers.UpdateCreativeType)
		admin.DELETE("/creative-types/:id", controllers.DeleteCreativeType)
		admin.GET("/creatives", controllers.AdminGetCreatives)
	}

	return r
}
