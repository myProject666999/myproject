package controller

import (
	"strconv"

	"hospital-management-system/internal/model"
	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type RegistrationController struct {
	registrationService *service.RegistrationService
}

func NewRegistrationController() *RegistrationController {
	return &RegistrationController{
		registrationService: service.NewRegistrationService(),
	}
}

func (ctrl *RegistrationController) SearchPatient(c *gin.Context) {
	keyword := c.Query("keyword")

	patients, err := ctrl.registrationService.SearchPatient(keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, patients)
}

func (ctrl *RegistrationController) CreatePatient(c *gin.Context) {
	var patient model.Patient
	if err := c.ShouldBindJSON(&patient); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.registrationService.CreatePatient(&patient); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, patient)
}

func (ctrl *RegistrationController) GetPatientByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	patient, err := ctrl.registrationService.GetPatientByID(uint(id))
	if err != nil {
		response.NotFound(c, "患者不存在")
		return
	}
	response.Success(c, patient)
}

func (ctrl *RegistrationController) GetAvailableSchedules(c *gin.Context) {
	date := c.Query("date")
	departmentID, _ := strconv.ParseUint(c.Query("department_id"), 10, 32)

	schedules, err := ctrl.registrationService.GetAvailableSchedules(date, uint(departmentID))
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, schedules)
}

func (ctrl *RegistrationController) CreateRegistration(c *gin.Context) {
	var registration model.Registration
	if err := c.ShouldBindJSON(&registration); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.registrationService.CreateRegistration(&registration); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, registration)
}

func (ctrl *RegistrationController) GetRegistrations(c *gin.Context) {
	date := c.Query("date")
	status, _ := strconv.Atoi(c.DefaultQuery("status", "0"))

	registrations, err := ctrl.registrationService.GetRegistrations(date, status)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, registrations)
}

func (ctrl *RegistrationController) CancelRegistration(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.registrationService.CancelRegistration(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func (ctrl *RegistrationController) GetPatientFees(c *gin.Context) {
	patientID, _ := strconv.ParseUint(c.Query("patient_id"), 10, 32)
	registrationID, _ := strconv.ParseUint(c.Query("registration_id"), 10, 32)

	fees, err := ctrl.registrationService.GetPatientFees(uint(patientID), uint(registrationID))
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, fees)
}

func (ctrl *RegistrationController) ChargeFees(c *gin.Context) {
	var req struct {
		FeeIDs               []uint `json:"fee_ids"`
		SettlementCategoryID uint   `json:"settlement_category_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.registrationService.ChargeFees(req.FeeIDs, req.SettlementCategoryID); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}
