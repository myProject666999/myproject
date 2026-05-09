package router

import (
	"hospital-management-system/internal/controller"
	"hospital-management-system/internal/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS())

	authCtrl := controller.NewAuthController()
	adminCtrl := controller.NewAdminController()
	doctorCtrl := controller.NewDoctorController()
	registrationCtrl := controller.NewRegistrationController()
	pharmacyCtrl := controller.NewPharmacyController()
	statisticsCtrl := controller.NewStatisticsController()

	api := r.Group("/api")
	{
		api.POST("/login", authCtrl.Login)

		auth := api.Group("")
		auth.Use(middleware.JWTAuth())
		{
			auth.GET("/user/me", authCtrl.GetCurrentUser)

			admin := auth.Group("/admin")
			admin.Use(middleware.RoleAuth(1))
			{
				admin.GET("/roles", adminCtrl.GetRoleList)

				admin.GET("/users", adminCtrl.GetUserList)
				admin.POST("/users", adminCtrl.CreateUser)
				admin.PUT("/users/:id", adminCtrl.UpdateUser)
				admin.DELETE("/users/:id", adminCtrl.DeleteUser)

				admin.GET("/departments", adminCtrl.GetDepartmentList)
				admin.POST("/departments", adminCtrl.CreateDepartment)
				admin.PUT("/departments/:id", adminCtrl.UpdateDepartment)
				admin.DELETE("/departments/:id", adminCtrl.DeleteDepartment)

				admin.GET("/registration-levels", adminCtrl.GetRegistrationLevelList)
				admin.POST("/registration-levels", adminCtrl.CreateRegistrationLevel)
				admin.PUT("/registration-levels/:id", adminCtrl.UpdateRegistrationLevel)
				admin.DELETE("/registration-levels/:id", adminCtrl.DeleteRegistrationLevel)

				admin.GET("/settlement-categories", adminCtrl.GetSettlementCategoryList)
				admin.POST("/settlement-categories", adminCtrl.CreateSettlementCategory)
				admin.PUT("/settlement-categories/:id", adminCtrl.UpdateSettlementCategory)
				admin.DELETE("/settlement-categories/:id", adminCtrl.DeleteSettlementCategory)

				admin.GET("/diagnosis-catalogs", adminCtrl.GetDiagnosisCatalogList)
				admin.POST("/diagnosis-catalogs", adminCtrl.CreateDiagnosisCatalog)
				admin.PUT("/diagnosis-catalogs/:id", adminCtrl.UpdateDiagnosisCatalog)
				admin.DELETE("/diagnosis-catalogs/:id", adminCtrl.DeleteDiagnosisCatalog)

				admin.GET("/charge-items", adminCtrl.GetChargeItemList)
				admin.POST("/charge-items", adminCtrl.CreateChargeItem)
				admin.PUT("/charge-items/:id", adminCtrl.UpdateChargeItem)
				admin.DELETE("/charge-items/:id", adminCtrl.DeleteChargeItem)

				admin.GET("/medicines", adminCtrl.GetMedicineList)
				admin.POST("/medicines", adminCtrl.CreateMedicine)
				admin.PUT("/medicines/:id", adminCtrl.UpdateMedicine)
				admin.DELETE("/medicines/:id", adminCtrl.DeleteMedicine)

				admin.GET("/expense-subjects", adminCtrl.GetExpenseSubjectList)
				admin.POST("/expense-subjects", adminCtrl.CreateExpenseSubject)
				admin.PUT("/expense-subjects/:id", adminCtrl.UpdateExpenseSubject)
				admin.DELETE("/expense-subjects/:id", adminCtrl.DeleteExpenseSubject)

				admin.GET("/doctor-schedules", adminCtrl.GetDoctorScheduleList)
				admin.POST("/doctor-schedules", adminCtrl.CreateDoctorSchedule)
				admin.PUT("/doctor-schedules/:id", adminCtrl.UpdateDoctorSchedule)
				admin.DELETE("/doctor-schedules/:id", adminCtrl.DeleteDoctorSchedule)
			}

			doctor := auth.Group("/doctor")
			doctor.Use(middleware.RoleAuth(1, 2))
			{
				doctor.GET("/waiting-list", doctorCtrl.GetWaitingList)
				doctor.GET("/registrations/:id", doctorCtrl.GetRegistrationDetail)
				doctor.POST("/registrations/:id/start", doctorCtrl.StartDiagnosis)
				doctor.POST("/registrations/:id/finish", doctorCtrl.FinishDiagnosis)

				doctor.GET("/medical-records", doctorCtrl.GetMedicalRecord)
				doctor.POST("/medical-records", doctorCtrl.SaveMedicalRecord)

				doctor.POST("/examination-requests", doctorCtrl.CreateExaminationRequest)
				doctor.POST("/laboratory-requests", doctorCtrl.CreateLaboratoryRequest)
				doctor.POST("/treatment-requests", doctorCtrl.CreateTreatmentRequest)
				doctor.POST("/prescriptions", doctorCtrl.CreatePrescription)
				doctor.GET("/prescriptions", doctorCtrl.GetPrescriptions)

				doctor.GET("/patient-fees", doctorCtrl.GetPatientFees)

				doctor.GET("/search/medicines", doctorCtrl.SearchMedicines)
				doctor.GET("/search/diagnosis", doctorCtrl.SearchDiagnosis)
				doctor.GET("/search/charge-items", doctorCtrl.SearchChargeItems)

				doctor.POST("/confirm-diagnosis", doctorCtrl.ConfirmDiagnosis)
			}

			reception := auth.Group("/reception")
			reception.Use(middleware.RoleAuth(1, 5))
			{
				reception.GET("/patients/search", registrationCtrl.SearchPatient)
				reception.POST("/patients", registrationCtrl.CreatePatient)
				reception.GET("/patients/:id", registrationCtrl.GetPatientByID)

				reception.GET("/schedules", registrationCtrl.GetAvailableSchedules)
				reception.POST("/registrations", registrationCtrl.CreateRegistration)
				reception.GET("/registrations", registrationCtrl.GetRegistrations)
				reception.POST("/registrations/:id/cancel", registrationCtrl.CancelRegistration)

				reception.GET("/patient-fees", registrationCtrl.GetPatientFees)
				reception.POST("/charge-fees", registrationCtrl.ChargeFees)
			}

			pharmacy := auth.Group("/pharmacy")
			pharmacy.Use(middleware.RoleAuth(1, 4))
			{
				pharmacy.GET("/prescriptions/pending", pharmacyCtrl.GetPendingPrescriptions)
				pharmacy.GET("/prescriptions/:id", pharmacyCtrl.GetPrescriptionDetail)
				pharmacy.POST("/prescriptions/:id/dispense", pharmacyCtrl.DispensePrescription)
				pharmacy.POST("/prescriptions/:id/return", pharmacyCtrl.ReturnPrescription)
				pharmacy.GET("/medicine-stock", pharmacyCtrl.GetMedicineStock)
			}

			statistics := auth.Group("/statistics")
			statistics.Use(middleware.RoleAuth(1, 2, 3, 4, 5))
			{
				statistics.GET("/workload", statisticsCtrl.GetWorkloadStatistics)
				statistics.GET("/daily-settlements", statisticsCtrl.GetDailySettlements)
				statistics.POST("/daily-settlement", statisticsCtrl.CreateDailySettlement)
				statistics.GET("/today-overview", statisticsCtrl.GetTodayOverview)
			}

			common := auth.Group("/common")
			{
				common.GET("/departments", adminCtrl.GetDepartmentList)
				common.GET("/roles", adminCtrl.GetRoleList)
				common.GET("/registration-levels", adminCtrl.GetRegistrationLevelList)
				common.GET("/settlement-categories", adminCtrl.GetSettlementCategoryList)
			}
		}
	}

	return r
}
