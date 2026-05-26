package handler

import (
	"fmt"
	"math"
	"net/http"
	"online-invoice-management/internal/models"
	"online-invoice-management/internal/repository"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func ok(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{Code: 0, Message: "success", Data: data})
}

func fail(c echo.Context, code int, msg string) error {
	return c.JSON(code, Response{Code: code, Message: msg})
}

func GetTitles(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	titles, err := repository.GetTitles(keyword)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, titles)
}

func GetTitle(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	title, err := repository.GetTitleByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if title == nil {
		return fail(c, http.StatusNotFound, "抬头不存在")
	}
	return ok(c, title)
}

func CreateTitle(c echo.Context) error {
	var t models.Title
	if err := c.Bind(&t); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}
	if t.Name == "" {
		return fail(c, http.StatusBadRequest, "抬头名称不能为空")
	}
	if t.TaxNumber == "" {
		return fail(c, http.StatusBadRequest, "税号不能为空")
	}
	if !repository.ValidateTaxNumber(t.TaxNumber) {
		return fail(c, http.StatusBadRequest, "税号格式不正确")
	}

	existing, err := repository.GetTitleByTaxNumber(t.TaxNumber)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if existing != nil {
		return fail(c, http.StatusBadRequest, "税号已存在")
	}

	if err := repository.CreateTitle(&t); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, t)
}

func UpdateTitle(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var t models.Title
	if err := c.Bind(&t); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}
	t.ID = id

	if t.Name == "" {
		return fail(c, http.StatusBadRequest, "抬头名称不能为空")
	}
	if t.TaxNumber == "" {
		return fail(c, http.StatusBadRequest, "税号不能为空")
	}
	if !repository.ValidateTaxNumber(t.TaxNumber) {
		return fail(c, http.StatusBadRequest, "税号格式不正确")
	}

	existing, err := repository.GetTitleByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if existing == nil {
		return fail(c, http.StatusNotFound, "抬头不存在")
	}

	existingByTax, err := repository.GetTitleByTaxNumber(t.TaxNumber)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if existingByTax != nil && existingByTax.ID != id {
		return fail(c, http.StatusBadRequest, "税号已存在")
	}

	if err := repository.UpdateTitle(&t); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, t)
}

func DeleteTitle(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	hasApps, err := repository.CheckTitleHasApplications(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if hasApps {
		return fail(c, http.StatusBadRequest, "该抬头已有开票申请，无法删除")
	}

	hasInvoices, err := repository.CheckTitleHasInvoices(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if hasInvoices {
		return fail(c, http.StatusBadRequest, "该抬头已有发票记录，无法删除")
	}

	if err := repository.DeleteTitle(id); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, nil)
}

func GetApplications(c echo.Context) error {
	statusStr := c.QueryParam("status")
	keyword := c.QueryParam("keyword")
	status := 0
	if statusStr != "" {
		status, _ = strconv.Atoi(statusStr)
	}
	apps, err := repository.GetApplications(status, keyword)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, apps)
}

func GetApplication(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	app, err := repository.GetApplicationByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if app == nil {
		return fail(c, http.StatusNotFound, "申请不存在")
	}
	return ok(c, app)
}

func CreateApplication(c echo.Context) error {
	var req models.CreateApplicationRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}
	if req.TitleID == 0 {
		return fail(c, http.StatusBadRequest, "请选择抬头")
	}
	title, err := repository.GetTitleByID(req.TitleID)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if title == nil {
		return fail(c, http.StatusBadRequest, "抬头不存在")
	}
	if len(req.Items) == 0 {
		return fail(c, http.StatusBadRequest, "请添加至少一条明细")
	}

	var netAmount, taxAmount, totalAmount float64
	for i := range req.Items {
		item := &req.Items[i]
		if item.ProductName == "" {
			return fail(c, http.StatusBadRequest, "商品/服务名称不能为空")
		}
		if item.Quantity <= 0 {
			return fail(c, http.StatusBadRequest, "数量必须大于0")
		}
		if item.UnitPrice < 0 {
			return fail(c, http.StatusBadRequest, "单价不能为负数")
		}
		if item.TaxRate < 0 || item.TaxRate > 1 {
			return fail(c, http.StatusBadRequest, "税率应在0-1之间")
		}

		item.Amount = roundTo2(item.Quantity * item.UnitPrice)
		item.TaxAmount = roundTo2(item.Amount * item.TaxRate)

		netAmount += item.Amount
		taxAmount += item.TaxAmount
	}
	totalAmount = roundTo2(netAmount + taxAmount)

	app := &models.InvoiceApplication{
		TitleID:     req.TitleID,
		Status:      1,
		TotalAmount: totalAmount,
		NetAmount:   roundTo2(netAmount),
		TaxAmount:   roundTo2(taxAmount),
		Applicant:   req.Applicant,
		Remark:      req.Remark,
		Items:       req.Items,
	}

	if err := repository.CreateApplication(app); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, app)
}

func ReviewApplication(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req models.ReviewRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	app, err := repository.GetApplicationByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if app == nil {
		return fail(c, http.StatusNotFound, "申请不存在")
	}
	if app.Status != 1 {
		return fail(c, http.StatusBadRequest, "只有待审核的申请可以审核")
	}

	if err := repository.UpdateApplicationStatus(id, req.Status); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, map[string]interface{}{"id": id, "status": req.Status})
}

func GetInvoices(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	invoices, err := repository.GetInvoices(keyword)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, invoices)
}

func GetInvoice(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	inv, err := repository.GetInvoiceByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if inv == nil {
		return fail(c, http.StatusNotFound, "发票不存在")
	}
	return ok(c, inv)
}

func IssueInvoice(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var req models.IssueInvoiceRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}
	if req.InvoiceNumber == "" {
		return fail(c, http.StatusBadRequest, "发票号码不能为空")
	}
	if req.IssuedDate == "" {
		return fail(c, http.StatusBadRequest, "开票日期不能为空")
	}

	existing, err := repository.GetInvoiceByNumber(req.InvoiceNumber)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if existing != nil {
		return fail(c, http.StatusBadRequest, "发票号码已存在")
	}

	app, err := repository.GetApplicationByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if app == nil {
		return fail(c, http.StatusNotFound, "申请不存在")
	}
	if app.Status != 2 {
		return fail(c, http.StatusBadRequest, "只有已通过的申请可以开票")
	}

	inv := &models.Invoice{
		ApplicationID: id,
		TitleID:       app.TitleID,
		InvoiceNumber: req.InvoiceNumber,
		InvoiceCode:   req.InvoiceCode,
		IssuedDate:    req.IssuedDate,
		TotalAmount:   app.TotalAmount,
		NetAmount:     app.NetAmount,
		TaxAmount:     app.TaxAmount,
		PdfPath:       req.PdfPath,
		Remark:        req.Remark,
	}

	if err := repository.CreateInvoice(inv); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	if err := repository.UpdateApplicationStatus(id, 4); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return ok(c, inv)
}

func GetStatistics(c echo.Context) error {
	stats, err := repository.GetStatistics()
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	return ok(c, stats)
}

func roundTo2(v float64) float64 {
	return math.Round(v*100) / 100
}

func StatusFlow(c echo.Context) error {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	app, err := repository.GetApplicationByID(id)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}
	if app == nil {
		return fail(c, http.StatusNotFound, "申请不存在")
	}

	var nextStatuses []int
	switch app.Status {
	case 1:
		nextStatuses = []int{2, 3}
	case 2:
		nextStatuses = []int{4}
	}

	return ok(c, map[string]interface{}{
		"current_status":  app.Status,
		"current_status_text": app.StatusText,
		"next_statuses":   nextStatuses,
	})
}

func _unused() {
	_ = time.Now
	_ = fmt.Sprintf
}