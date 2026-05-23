package handler

import (
	"encoding/json"
	"fmt"
	"internal-device-discovery/internal/model"
	"internal-device-discovery/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type DeviceHandler struct {
	svc *service.DeviceService
}

func NewDeviceHandler(svc *service.DeviceService) *DeviceHandler {
	return &DeviceHandler{svc: svc}
}

type Paged struct {
	Items    any   `json:"items"`
	Total    int64 `json:"total"`
	Page     int   `json:"page"`
	PageSize int   `json:"pageSize"`
}

type errorResp struct {
	Error string `json:"error"`
}

func (h *DeviceHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "50"))
	items, total, err := h.svc.List(service.ListOptions{
		Keyword:  c.Query("keyword"),
		Status:   c.Query("status"),
		Vendor:   c.Query("vendor"),
		Page:     page,
		PageSize: pageSize,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	if items == nil {
		items = []model.Device{}
	}
	c.JSON(http.StatusOK, Paged{Items: items, Total: total, Page: page, PageSize: pageSize})
}

func (h *DeviceHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, errorResp{"invalid id"})
		return
	}
	d, err := h.svc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, errorResp{"not found"})
		return
	}
	c.JSON(http.StatusOK, d)
}

type updateReq struct {
	Name *string `json:"name"`
	Note *string `json:"note"`
}

func (h *DeviceHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, errorResp{"invalid id"})
		return
	}
	var req updateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResp{err.Error()})
		return
	}
	d, err := h.svc.Update(uint(id), req.Name, req.Note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	c.JSON(http.StatusOK, d)
}

func (h *DeviceHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, errorResp{"invalid id"})
		return
	}
	if err := h.svc.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

type batchDeleteReq struct {
	IDs []uint `json:"ids"`
}

func (h *DeviceHandler) BatchDelete(c *gin.Context) {
	var req batchDeleteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResp{err.Error()})
		return
	}
	if err := h.svc.BatchDelete(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *DeviceHandler) Vendors(c *gin.Context) {
	v, err := h.svc.Vendors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	if v == nil {
		v = []string{}
	}
	c.JSON(http.StatusOK, v)
}

// SSE event writer helpers
func WriteSSE(c *gin.Context, event string, data any) error {
	b, err := json.Marshal(data)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(c.Writer, "event: %s\ndata: %s\n\n", event, string(b))
	return err
}

func SSEHeaders(c *gin.Context) {
	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("X-Accel-Buffering", "no")
	c.Status(http.StatusOK)
}
