package controller

import (
	"strconv"

	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type PharmacyController struct {
	pharmacyService *service.PharmacyService
}

func NewPharmacyController() *PharmacyController {
	return &PharmacyController{
		pharmacyService: service.NewPharmacyService(),
	}
}

func (ctrl *PharmacyController) GetPendingPrescriptions(c *gin.Context) {
	prescriptions, err := ctrl.pharmacyService.GetPendingPrescriptions()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, prescriptions)
}

func (ctrl *PharmacyController) GetPrescriptionDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	prescription, err := ctrl.pharmacyService.GetPrescriptionDetail(uint(id))
	if err != nil {
		response.NotFound(c, "处方不存在")
		return
	}
	response.Success(c, prescription)
}

func (ctrl *PharmacyController) DispensePrescription(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	pharmacistID, _ := c.Get("user_id")

	if err := ctrl.pharmacyService.DispensePrescription(uint(id), pharmacistID.(uint)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func (ctrl *PharmacyController) ReturnPrescription(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.pharmacyService.ReturnPrescription(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func (ctrl *PharmacyController) GetMedicineStock(c *gin.Context) {
	medicines, err := ctrl.pharmacyService.GetMedicineStock()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, medicines)
}
