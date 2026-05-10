package routes

import (
	"power-team-management/config"
	"power-team-management/handlers"
	"power-team-management/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORSMiddleware())

	api := r.Group("/api")
	{
		api.POST("/login", handlers.Login(cfg))

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware(cfg))
		{
			auth.GET("/me", handlers.GetCurrentUser)
			auth.GET("/user-menus", handlers.GetUserMenus)

			auth.GET("/dashboard/stats", handlers.GetDashboardStats)
			auth.GET("/dashboard/opportunities-by-status", handlers.GetOpportunitiesByStatus)
			auth.GET("/dashboard/conversion-stats", handlers.GetConversionStats)
			auth.GET("/dashboard/upcoming-deadlines", handlers.GetUpcomingDeadlines)

			auth.GET("/customers", handlers.GetCustomers)
			auth.GET("/customers/all", handlers.GetAllCustomers)
			auth.GET("/customers/:id", handlers.GetCustomer)
			auth.POST("/customers", handlers.CreateCustomer)
			auth.PUT("/customers/:id", handlers.UpdateCustomer)
			auth.DELETE("/customers/:id", handlers.DeleteCustomer)

			auth.GET("/contacts", handlers.GetContacts)
			auth.GET("/contacts/:id", handlers.GetContact)
			auth.POST("/contacts", handlers.CreateContact)
			auth.PUT("/contacts/:id", handlers.UpdateContact)
			auth.DELETE("/contacts/:id", handlers.DeleteContact)

			auth.GET("/opportunities", handlers.GetOpportunities)
			auth.GET("/opportunities/:id", handlers.GetOpportunity)
			auth.POST("/opportunities", handlers.CreateOpportunity)
			auth.PUT("/opportunities/:id", handlers.UpdateOpportunity)
			auth.DELETE("/opportunities/:id", handlers.DeleteOpportunity)

			auth.GET("/my-reports", handlers.GetMyReports)
			auth.GET("/my-reports/date/:date", handlers.GetReportByDate)
			auth.POST("/my-reports", handlers.CreateReport)

			teamReports := auth.Group("/team-reports")
			teamReports.Use(middleware.ManagerOrAdmin())
			{
				teamReports.GET("", handlers.GetTeamReports)
				teamReports.GET("/:id", handlers.GetReport)
				teamReports.PUT("/:id", handlers.UpdateReport)
				teamReports.DELETE("/:id", handlers.DeleteReport)
			}

			auth.GET("/organizations", handlers.GetOrganizations)
			auth.GET("/organizations/:id", handlers.GetOrganization)
			auth.GET("/organizations/:id/users", handlers.GetOrganizationUsers)
			auth.POST("/organizations", handlers.CreateOrganization)
			auth.PUT("/organizations/:id", handlers.UpdateOrganization)
			auth.DELETE("/organizations/:id", handlers.DeleteOrganization)
			auth.POST("/organizations/:id/assign-users", handlers.AssignUsersToOrganization)

			admin := auth.Group("")
			admin.Use(middleware.AdminOnly())
			{
				admin.GET("/users", handlers.GetUsers)
				admin.GET("/users/all", handlers.GetAllUsers)
				admin.GET("/users/:id", handlers.GetUser)
				admin.POST("/users", handlers.CreateUser)
				admin.PUT("/users/:id", handlers.UpdateUser)
				admin.DELETE("/users/:id", handlers.DeleteUser)

				admin.GET("/roles", handlers.GetRoles)
				admin.GET("/roles/:id", handlers.GetRole)
				admin.POST("/roles", handlers.CreateRole)
				admin.PUT("/roles/:id", handlers.UpdateRole)
				admin.DELETE("/roles/:id", handlers.DeleteRole)
				admin.POST("/roles/:id/menus", handlers.AssignRoleMenus)
				admin.POST("/roles/:id/permissions", handlers.AssignRolePermissions)

				admin.GET("/menus", handlers.GetMenus)
				admin.GET("/menus/all", handlers.GetAllMenus)
				admin.GET("/menus/:id", handlers.GetMenu)
				admin.POST("/menus", handlers.CreateMenu)
				admin.PUT("/menus/:id", handlers.UpdateMenu)
				admin.DELETE("/menus/:id", handlers.DeleteMenu)

				admin.GET("/permissions", handlers.GetPermissions)
				admin.GET("/permissions/:id", handlers.GetPermission)
				admin.POST("/permissions", handlers.CreatePermission)
				admin.PUT("/permissions/:id", handlers.UpdatePermission)
				admin.DELETE("/permissions/:id", handlers.DeletePermission)
			}
		}
	}

	return r
}
