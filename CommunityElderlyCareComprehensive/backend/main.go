package main

import (
	"community-care/config"
	"community-care/controller"
	"community-care/middleware"
	"community-care/model"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	config.InitConfig()
	config.InitDB()

	err := config.DB.AutoMigrate(
		&model.User{},
		&model.Role{},
		&model.Menu{},
		&model.UserRole{},
		&model.RoleMenu{},
		&model.Insurance{},
		&model.Medicine{},
		&model.HealthRecord{},
		&model.Appointment{},
		&model.VisitRecord{},
	)
	if err != nil {
		log.Fatal("数据库迁移失败:", err)
	}

	initDefaultData()

	r := gin.Default()

	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		api.POST("/auth/login", controller.Login)
		api.POST("/auth/register", controller.Register)

		auth := api.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/auth/me", controller.GetCurrentUser)

			user := auth.Group("/users")
			{
				user.GET("", middleware.RequireRole("admin", "doctor"), controller.GetUsers)
				user.GET("/:id", middleware.RequireRole("admin", "doctor"), controller.GetUser)
				user.POST("", middleware.RequireRole("admin"), controller.CreateUser)
				user.PUT("/:id", middleware.RequireRole("admin"), controller.UpdateUser)
				user.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteUser)
			}

			role := auth.Group("/roles")
			{
				role.GET("", middleware.RequireRole("admin"), controller.GetRoles)
				role.GET("/:id", middleware.RequireRole("admin"), controller.GetRole)
				role.POST("", middleware.RequireRole("admin"), controller.CreateRole)
				role.PUT("/:id", middleware.RequireRole("admin"), controller.UpdateRole)
				role.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteRole)
			}

			menu := auth.Group("/menus")
			{
				menu.GET("", controller.GetMenus)
				menu.GET("/tree", controller.GetMenuTree)
				menu.GET("/:id", middleware.RequireRole("admin"), controller.GetMenu)
				menu.POST("", middleware.RequireRole("admin"), controller.CreateMenu)
				menu.PUT("/:id", middleware.RequireRole("admin"), controller.UpdateMenu)
				menu.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteMenu)
			}

			insurance := auth.Group("/insurances")
			{
				insurance.GET("", controller.GetInsurances)
				insurance.GET("/:id", controller.GetInsurance)
				insurance.POST("", middleware.RequireRole("admin", "doctor"), controller.CreateInsurance)
				insurance.PUT("/:id", middleware.RequireRole("admin", "doctor"), controller.UpdateInsurance)
				insurance.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteInsurance)
			}

			medicine := auth.Group("/medicines")
			{
				medicine.GET("", controller.GetMedicines)
				medicine.GET("/:id", controller.GetMedicine)
				medicine.POST("", middleware.RequireRole("admin", "doctor"), controller.CreateMedicine)
				medicine.PUT("/:id", middleware.RequireRole("admin", "doctor"), controller.UpdateMedicine)
				medicine.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteMedicine)
			}

			health := auth.Group("/health")
			{
				health.GET("", controller.GetHealthRecords)
				health.GET("/:id", controller.GetHealthRecord)
				health.POST("", middleware.RequireRole("admin", "doctor"), controller.CreateHealthRecord)
				health.PUT("/:id", middleware.RequireRole("admin", "doctor"), controller.UpdateHealthRecord)
				health.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteHealthRecord)
			}

			appointment := auth.Group("/appointments")
			{
				appointment.GET("", controller.GetAppointments)
				appointment.GET("/:id", controller.GetAppointment)
				appointment.POST("", controller.CreateAppointment)
				appointment.PUT("/:id", controller.UpdateAppointment)
				appointment.DELETE("/:id", controller.DeleteAppointment)
			}

			visit := auth.Group("/visits")
			{
				visit.GET("", controller.GetVisitRecords)
				visit.GET("/:id", controller.GetVisitRecord)
				visit.POST("", middleware.RequireRole("admin", "doctor"), controller.CreateVisitRecord)
				visit.PUT("/:id", middleware.RequireRole("admin", "doctor"), controller.UpdateVisitRecord)
				visit.DELETE("/:id", middleware.RequireRole("admin"), controller.DeleteVisitRecord)
			}

			auth.GET("/doctors", controller.GetDoctors)
			auth.GET("/patients", controller.GetPatients)
		}
	}

	port := config.AppConfig.Server.Port
	fmt.Printf("服务器运行在 :%d\n", port)
	r.Run(fmt.Sprintf(":%d", port))
}

func initDefaultData() {
	var count int64
	config.DB.Model(&model.Role{}).Count(&count)
	if count == 0 {
		roles := []model.Role{
			{Name: "admin", DisplayName: "管理员", Description: "系统管理员"},
			{Name: "doctor", DisplayName: "医生", Description: "医生用户"},
			{Name: "patient", DisplayName: "患者", Description: "患者用户"},
		}
		for _, role := range roles {
			config.DB.Create(&role)
		}

		menus := []model.Menu{
			{Name: "系统管理", Path: "/system", Icon: "setting", ParentID: 0, Sort: 1},
			{Name: "用户管理", Path: "/system/users", Icon: "user", ParentID: 1, Sort: 1},
			{Name: "角色管理", Path: "/system/roles", Icon: "team", ParentID: 1, Sort: 2},
			{Name: "菜单管理", Path: "/system/menus", Icon: "menu", ParentID: 1, Sort: 3},
			{Name: "医疗管理", Path: "/medical", Icon: "medicine-box", ParentID: 0, Sort: 2},
			{Name: "医保信息", Path: "/medical/insurances", Icon: "insurance", ParentID: 5, Sort: 1},
			{Name: "药物管理", Path: "/medical/medicines", Icon: "pill", ParentID: 5, Sort: 2},
			{Name: "健康信息", Path: "/medical/health", Icon: "heart", ParentID: 5, Sort: 3},
			{Name: "预约管理", Path: "/appointments", Icon: "calendar", ParentID: 0, Sort: 3},
			{Name: "就诊记录", Path: "/visits", Icon: "file-text", ParentID: 0, Sort: 4},
		}
		for _, menu := range menus {
			config.DB.Create(&menu)
		}

		roleMenus := []model.RoleMenu{}
		for i := 1; i <= 10; i++ {
			roleMenus = append(roleMenus, model.RoleMenu{RoleID: 1, MenuID: uint(i)})
		}
		for i := 5; i <= 10; i++ {
			roleMenus = append(roleMenus, model.RoleMenu{RoleID: 2, MenuID: uint(i)})
		}
		for i := 6; i <= 10; i++ {
			roleMenus = append(roleMenus, model.RoleMenu{RoleID: 3, MenuID: uint(i)})
		}
		for _, rm := range roleMenus {
			config.DB.Create(&rm)
		}

		admin := model.User{
			Username: "admin",
			Password: "admin123",
			RealName: "管理员",
			Phone:    "13800000000",
		}
		config.DB.Create(&admin)
		config.DB.Create(&model.UserRole{UserID: admin.ID, RoleID: 1})

		doctor := model.User{
			Username: "doctor",
			Password: "doctor123",
			RealName: "张医生",
			Phone:    "13900000000",
		}
		config.DB.Create(&doctor)
		config.DB.Create(&model.UserRole{UserID: doctor.ID, RoleID: 2})

		patient := model.User{
			Username: "patient",
			Password: "patient123",
			RealName: "李大爷",
			Phone:    "13700000000",
		}
		config.DB.Create(&patient)
		config.DB.Create(&model.UserRole{UserID: patient.ID, RoleID: 3})
	}
}
