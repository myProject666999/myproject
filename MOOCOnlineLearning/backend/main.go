package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"mooc-platform/config"
	"mooc-platform/handlers"
	"mooc-platform/middleware"
	"mooc-platform/services"
)

var DB *gorm.DB
var RedisClient *redis.Client

func initMySQL() {
	var err error
	DB, err = gorm.Open(mysql.Open(config.Cfg.MySQL.DSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("connect mysql failed: %v", err)
	}
	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatalf("get sql.DB failed: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
}

func initRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     config.Cfg.Redis.Addr(),
		Password: config.Cfg.Redis.Password,
		DB:       config.Cfg.Redis.DB,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if _, err := RedisClient.Ping(ctx).Result(); err != nil {
		log.Printf("redis connection warning: %v, continuing without redis", err)
		RedisClient = nil
	}
}

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORS())

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "pong"})
	})

	userService := services.NewUserService(DB)
	courseService := services.NewCourseService(DB)
	videoService := services.NewVideoService(DB)
	progressService := services.NewProgressService(DB)
	quizService := services.NewQuizService(DB)
	certificateService := services.NewCertificateService(DB)
	reviewService := services.NewReviewService(DB)

	authHandler := handlers.NewAuthHandler(userService)
	courseHandler := handlers.NewCourseHandler(courseService)
	videoHandler := handlers.NewVideoHandler(videoService)
	progressHandler := handlers.NewProgressHandler(progressService)
	quizHandler := handlers.NewQuizHandler(quizService)
	certificateHandler := handlers.NewCertificateHandler(certificateService)
	reviewHandler := handlers.NewReviewHandler(reviewService)
	teacherHandler := handlers.NewTeacherHandler(courseService, progressService, reviewService)

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/profile", middleware.AuthMiddleware(), authHandler.Profile)
			auth.PUT("/profile", middleware.AuthMiddleware(), authHandler.UpdateProfile)
		}

		courses := api.Group("/courses")
		{
			courses.GET("", courseHandler.List)
			courses.GET("/hot", courseHandler.HotList)
			courses.GET("/:id", courseHandler.GetByID)
			courses.POST("", middleware.AuthMiddleware(), courseHandler.Create)
			courses.PUT("/:id", middleware.AuthMiddleware(), courseHandler.Update)
			courses.DELETE("/:id", middleware.AuthMiddleware(), courseHandler.Delete)
			courses.POST("/:id/enroll", middleware.AuthMiddleware(), func(c *gin.Context) {
				c.JSON(200, gin.H{"code": 200, "message": "选课成功"})
			})
		}

		api.GET("/courses/:id/quiz/questions", quizHandler.GetQuestions)
		api.POST("/courses/:id/quiz/submit", middleware.AuthMiddleware(), quizHandler.Submit)
		api.GET("/courses/:id/quiz/score", middleware.AuthMiddleware(), quizHandler.GetScore)

		api.GET("/courses/:id/reviews", reviewHandler.ListByCourse)
		api.GET("/courses/:id/reviews/stats", reviewHandler.GetStats)

		videos := api.Group("/videos")
		{
			videos.POST("/upload", middleware.AuthMiddleware(), videoHandler.Upload)
			videos.POST("/chunk/init", middleware.AuthMiddleware(), videoHandler.InitChunk)
			videos.POST("/chunk/upload", middleware.AuthMiddleware(), videoHandler.UploadChunk)
			videos.POST("/chunk/complete", middleware.AuthMiddleware(), videoHandler.CompleteChunk)
			videos.GET("/:id", videoHandler.GetByID)
			videos.GET("/:id/play-sign", middleware.AuthMiddleware(), videoHandler.GetPlaySign)
		}

		progress := api.Group("/progress")
		{
			progress.POST("/report", middleware.AuthMiddleware(), progressHandler.Report)
			progress.GET("/course/:course_id", middleware.AuthMiddleware(), progressHandler.GetCourseProgress)
			progress.GET("/lesson/:lesson_id", middleware.AuthMiddleware(), progressHandler.GetLessonProgress)
			progress.GET("/my-courses", middleware.AuthMiddleware(), progressHandler.GetMyCourses)
		}

		quiz := api.Group("/quiz")
		{
			quiz.POST("/submit", middleware.AuthMiddleware(), quizHandler.Submit)
			quiz.GET("/scores", middleware.AuthMiddleware(), quizHandler.GetMyScores)
		}

		certificates := api.Group("/certificates")
		{
			certificates.POST("/generate/:course_id", middleware.AuthMiddleware(), certificateHandler.Generate)
			certificates.GET("/:id", certificateHandler.GetByID)
			certificates.GET("", middleware.AuthMiddleware(), certificateHandler.ListByUser)
			certificates.GET("/verify/:cert_no", certificateHandler.Verify)
		}

		reviews := api.Group("/reviews")
		{
			reviews.POST("", middleware.AuthMiddleware(), reviewHandler.Create)
			reviews.PUT("/:id", middleware.AuthMiddleware(), reviewHandler.Update)
			reviews.DELETE("/:id", middleware.AuthMiddleware(), reviewHandler.Delete)
		}

		teacher := api.Group("/teacher")
		{
			teacher.GET("/courses", middleware.AuthMiddleware(), teacherHandler.MyCourses)
			teacher.PUT("/courses/:id/publish", middleware.AuthMiddleware(), teacherHandler.Publish)
			teacher.PUT("/courses/:id/offline", middleware.AuthMiddleware(), teacherHandler.Offline)
			teacher.GET("/courses/:id/stats", middleware.AuthMiddleware(), teacherHandler.CourseStats)
			teacher.GET("/courses/:id/reviews", middleware.AuthMiddleware(), teacherHandler.CourseReviews)
			teacher.DELETE("/reviews/:id", middleware.AuthMiddleware(), teacherHandler.DeleteReview)
		}
	}

	return r
}

func main() {
	if err := config.Load("config/config.yaml"); err != nil {
		log.Fatalf("load config failed: %v", err)
	}

	initMySQL()
	initRedis()

	r := setupRouter()
	addr := fmt.Sprintf(":%d", config.Cfg.Server.Port)
	log.Printf("server listening on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("start server failed: %v", err)
	}
}
