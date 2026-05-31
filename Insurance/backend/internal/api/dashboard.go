package api

import (
	"emergency-material/internal/service"
	"emergency-material/pkg/response"

	"github.com/gin-gonic/gin"
)

type DashboardController struct {
	materialService *service.MaterialService
}

func NewDashboardController() *DashboardController {
	return &DashboardController{
		materialService: service.NewMaterialService(),
	}
}

func (ctrl *DashboardController) GetData(c *gin.Context) {
	data, err := ctrl.materialService.GetDashboardData(c.Request.Context())
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, data)
}
