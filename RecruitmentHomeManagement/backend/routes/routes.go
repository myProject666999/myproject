package routes

import (
	"recruithub/controllers"
	"recruithub/middlewares"
	"recruithub/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	auth := r.Group("/api/auth")
	{
		auth.POST("/register", controllers.Register)
		auth.POST("/login", controllers.Login)
		auth.GET("/me", middlewares.AuthMiddleware(), controllers.GetCurrentUser)
		auth.PUT("/update", middlewares.AuthMiddleware(), controllers.UpdateUser)
	}

	job := r.Group("/api/jobs")
	{
		job.GET("", controllers.GetJobs)
		job.GET("/hot", controllers.GetHotJobs)
		job.GET("/:id", controllers.GetJobDetail)
		job.GET("/:id/applicants", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.GetJobApplicants)
		job.POST("/:id/apply", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.ApplyJob)
		job.POST("", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.CreateJob)
		job.PUT("/:id", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.UpdateJob)
		job.DELETE("/:id", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.DeleteJob)
	}

	company := r.Group("/api/companies")
	{
		company.GET("", controllers.GetCompanies)
		company.GET("/famous", controllers.GetFamousCompanies)
		company.GET("/:id", controllers.GetCompanyDetail)
		company.POST("", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.CreateCompany)
		company.PUT("", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.UpdateCompany)
	}

	seeker := r.Group("/api/seekers")
	{
		seeker.GET("", controllers.GetSeekers)
		seeker.GET("/my", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.GetMySeekers)
		seeker.GET("/applications", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.GetMyApplications)
		seeker.GET("/:id", controllers.GetSeekerDetail)
		seeker.POST("", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.CreateSeeker)
		seeker.PUT("/:id", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.UpdateSeeker)
		seeker.DELETE("/:id", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleUser), controllers.DeleteSeeker)
	}

	history := r.Group("/api/history")
	{
		history.GET("", middlewares.AuthMiddleware(), controllers.GetBrowsingHistory)
	}

	companyJobs := r.Group("/api/company")
	{
		companyJobs.GET("/jobs", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.GetMyJobs)
		companyJobs.PUT("/applications/:id/status", middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleCompany), controllers.UpdateApplicationStatus)
	}

	blog := r.Group("/api/blogs")
	{
		blog.GET("", controllers.GetBlogs)
		blog.GET("/my", middlewares.AuthMiddleware(), controllers.GetMyBlogs)
		blog.GET("/:id", controllers.GetBlogDetail)
		blog.POST("", middlewares.AuthMiddleware(), controllers.CreateBlog)
		blog.PUT("/:id", middlewares.AuthMiddleware(), controllers.UpdateBlog)
		blog.DELETE("/:id", middlewares.AuthMiddleware(), controllers.DeleteBlog)
		blog.POST("/:id/like", controllers.LikeBlog)
	}

	admin := r.Group("/api/admin")
	admin.Use(middlewares.AuthMiddleware(), middlewares.RoleMiddleware(models.RoleAdmin))
	{
		admin.GET("/stats", controllers.AdminGetStats)

		admin.GET("/users", controllers.AdminGetUsers)
		admin.PUT("/users/:id", controllers.AdminUpdateUser)
		admin.DELETE("/users/:id", controllers.AdminDeleteUser)

		admin.GET("/companies", controllers.AdminGetCompanies)
		admin.PUT("/companies/:id", controllers.AdminUpdateCompany)
		admin.DELETE("/companies/:id", controllers.AdminDeleteCompany)

		admin.GET("/jobs", controllers.AdminGetJobs)
		admin.PUT("/jobs/:id", controllers.AdminUpdateJob)
		admin.DELETE("/jobs/:id", controllers.AdminDeleteJob)

		admin.GET("/seekers", controllers.AdminGetSeekers)
		admin.DELETE("/seekers/:id", controllers.AdminDeleteSeeker)

		admin.GET("/blogs", controllers.AdminGetBlogs)
		admin.PUT("/blogs/:id/review", controllers.AdminReviewBlog)
		admin.DELETE("/blogs/:id", controllers.AdminDeleteBlog)
	}

	return r
}
