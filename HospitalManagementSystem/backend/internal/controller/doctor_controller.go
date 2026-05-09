package controller

import (
	"strconv"

	"hospital-management-system/internal/model"
	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type DoctorController struct {
	doctorService *service.DoctorService
}

func NewDoctorController() *DoctorController {
	return &DoctorController{
		doctorService: service.NewDoctorService(),
	}
}

func (ctrl *DoctorController) GetWaitingList(c *gin.Context) {
	doctorID, _ := c.Get("user_id")
	date := c.Query("date")

	registrations, err := ctrl.doctorService.GetWaitingList(doctorID.(uint), date)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, registrations)
}

func (ctrl *DoctorController) GetRegistrationDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	registration, err := ctrl.doctorService.GetRegistrationDetail(uint(id))
	if err != nil {
		response.NotFound(c, "挂号记录不存在")
		return
	}
	response.Success(c, registration)
}

func (ctrl *DoctorController) StartDiagnosis(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.doctorService.StartDiagnosis(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func (ctrl *DoctorController) SaveMedicalRecord(c *gin.Context) {
	var record model.MedicalRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	doctorID, _ := c.Get("user_id")
	record.DoctorID = doctorID.(uint)

	if err := ctrl.doctorService.SaveMedicalRecord(&record); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, record)
}

func (ctrl *DoctorController) GetMedicalRecord(c *gin.Context) {
	registrationID, _ := strconv.ParseUint(c.Query("registration_id"), 10, 32)

	record, err := ctrl.doctorService.GetMedicalRecord(uint(registrationID))
	if err != nil {
		response.Success(c, nil)
		return
	}
	response.Success(c, record)
}

func (ctrl *DoctorController) CreateExaminationRequest(c *gin.Context) {
	var request model.ExaminationRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	doctorID, _ := c.Get("user_id")
	request.DoctorID = doctorID.(uint)

	if err := ctrl.doctorService.CreateExaminationRequest(&request); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, request)
}

func (ctrl *DoctorController) CreateLaboratoryRequest(c *gin.Context) {
	var request model.LaboratoryRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	doctorID, _ := c.Get("user_id")
	request.DoctorID = doctorID.(uint)

	if err := ctrl.doctorService.CreateLaboratoryRequest(&request); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, request)
}

func (ctrl *DoctorController) CreateTreatmentRequest(c *gin.Context) {
	var request model.TreatmentRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	doctorID, _ := c.Get("user_id")
	request.DoctorID = doctorID.(uint)

	if err := ctrl.doctorService.CreateTreatmentRequest(&request); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, request)
}

type PrescriptionCreateRequest struct {
	Prescription model.Prescription     `json:"prescription"`
	Items        []model.PrescriptionItem `json:"items"`
}

func (ctrl *DoctorController) CreatePrescription(c *gin.Context) {
	var req PrescriptionCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	doctorID, _ := c.Get("user_id")
	req.Prescription.DoctorID = doctorID.(uint)

	if err := ctrl.doctorService.CreatePrescription(&req.Prescription, req.Items); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, req.Prescription)
}

func (ctrl *DoctorController) GetPrescriptions(c *gin.Context) {
	registrationID, _ := strconv.ParseUint(c.Query("registration_id"), 10, 32)

	prescriptions, err := ctrl.doctorService.GetPrescriptions(uint(registrationID))
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, prescriptions)
}

func (ctrl *DoctorController) GetPatientFees(c *gin.Context) {
	registrationID, _ := strconv.ParseUint(c.Query("registration_id"), 10, 32)

	fees, err := ctrl.doctorService.GetPatientFees(uint(registrationID))
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, fees)
}

func (ctrl *DoctorController) FinishDiagnosis(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.doctorService.FinishDiagnosis(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func (ctrl *DoctorController) SearchMedicines(c *gin.Context) {
	keyword := c.Query("keyword")
	mType, _ := strconv.Atoi(c.DefaultQuery("type", "0"))

	medicines, err := ctrl.doctorService.SearchMedicines(keyword, mType)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, medicines)
}

func (ctrl *DoctorController) SearchDiagnosis(c *gin.Context) {
	keyword := c.Query("keyword")

	items, err := ctrl.doctorService.SearchDiagnosis(keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, items)
}

func (ctrl *DoctorController) SearchChargeItems(c *gin.Context) {
	keyword := c.Query("keyword")

	items, err := ctrl.doctorService.SearchChargeItems(keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, items)
}

func (ctrl *DoctorController) ConfirmDiagnosis(c *gin.Context) {
	var req struct {
		RegistrationID uint   `json:"registration_id"`
		Diagnosis      string `json:"diagnosis"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.doctorService.ConfirmDiagnosis(req.RegistrationID, req.Diagnosis); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}
