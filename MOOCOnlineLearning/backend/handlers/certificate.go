package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type CertificateHandler struct {
	certificateService *services.CertificateService
}

func NewCertificateHandler(certificateService *services.CertificateService) *CertificateHandler {
	return &CertificateHandler{certificateService: certificateService}
}

func (h *CertificateHandler) Generate(c *gin.Context) {
	courseID, err := strconv.ParseUint(c.Param("course_id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	cert, err := h.certificateService.Generate(uint64(userID.(uint)), courseID)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	utils.Response(c, http.StatusOK, "生成成功", cert)
}

func (h *CertificateHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	cert, err := h.certificateService.GetByID(id)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "证书不存在", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", cert)
}

func (h *CertificateHandler) ListByUser(c *gin.Context) {
	userID, _ := c.Get(middleware.UserIDKey)

	certs, err := h.certificateService.ListByUser(uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", certs)
}

func (h *CertificateHandler) Verify(c *gin.Context) {
	certNo := c.Param("cert_no")

	cert, err := h.certificateService.Verify(certNo)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "证书不存在", nil)
		return
	}

	utils.Response(c, http.StatusOK, "校验成功", cert)
}
