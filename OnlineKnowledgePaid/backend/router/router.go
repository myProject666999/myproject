package router

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"online-knowledge-paid/handler"
	"online-knowledge-paid/middleware"
)

func SetupRouter(db *gorm.DB, jwtSecret string) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	authMiddleware := middleware.AuthMiddleware(jwtSecret)
	adminMiddleware := middleware.AdminMiddleware()

	userHandler := &handler.UserHandler{}
	columnHandler := &handler.ColumnHandler{}
	articleHandler := &handler.ArticleHandler{}
	commentHandler := &handler.CommentHandler{}
	likeHandler := &handler.LikeHandler{}
	subscriptionHandler := &handler.SubscriptionHandler{}
	orderHandler := &handler.OrderHandler{}
	statsHandler := &handler.StatsHandler{}

	r.POST("/api/auth/register", userHandler.Register)
	r.POST("/api/auth/login", userHandler.Login)
	r.GET("/api/columns", columnHandler.GetColumns)
	r.GET("/api/columns/:id", columnHandler.GetColumnByID)
	r.GET("/api/articles", articleHandler.GetArticlesByColumn)
	r.GET("/api/articles/:id", articleHandler.GetArticleByID)
	r.GET("/api/comments", commentHandler.GetCommentsByArticle)
	r.GET("/api/authors/:id", userHandler.GetAuthorProfile)

	auth := r.Group("/")
	auth.Use(authMiddleware)
	{
		auth.GET("/api/user/profile", userHandler.GetProfile)
		auth.POST("/api/comments", commentHandler.CreateComment)
		auth.DELETE("/api/comments/:id", commentHandler.DeleteComment)
		auth.POST("/api/likes/toggle", likeHandler.ToggleLike)
		auth.GET("/api/likes/check", likeHandler.CheckLike)
		auth.GET("/api/subscriptions/check", subscriptionHandler.CheckSubscription)
		auth.GET("/api/subscriptions/my", subscriptionHandler.GetMySubscriptions)
		auth.POST("/api/orders", orderHandler.CreateOrder)
		auth.POST("/api/orders/pay", orderHandler.PayOrder)
		auth.GET("/api/orders/my", orderHandler.GetMyOrders)
		auth.GET("/api/orders/:id", orderHandler.GetOrderByID)
	}

	admin := r.Group("/")
	admin.Use(authMiddleware, adminMiddleware)
	{
		admin.POST("/api/columns", columnHandler.CreateColumn)
		admin.PUT("/api/columns/:id", columnHandler.UpdateColumn)
		admin.DELETE("/api/columns/:id", columnHandler.DeleteColumn)
		admin.GET("/api/columns/my", columnHandler.GetMyColumns)
		admin.POST("/api/articles", articleHandler.CreateArticle)
		admin.PUT("/api/articles/:id", articleHandler.UpdateArticle)
		admin.DELETE("/api/articles/:id", articleHandler.DeleteArticle)
		admin.GET("/api/articles/my", articleHandler.GetMyArticles)
		admin.GET("/api/subscriptions/column", subscriptionHandler.GetColumnSubscribers)
		admin.GET("/api/stats/revenue", statsHandler.GetRevenueStats)
		admin.GET("/api/stats/overview", statsHandler.GetAuthorOverview)
		admin.GET("/api/stats/column", statsHandler.GetColumnStats)
	}

	return r
}