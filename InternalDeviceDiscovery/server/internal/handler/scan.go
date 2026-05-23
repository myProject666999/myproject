package handler

import (
	"internal-device-discovery/internal/oui"
	"internal-device-discovery/internal/service"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ScanHandler struct {
	svc *service.ScanService
}

func NewScanHandler(svc *service.ScanService) *ScanHandler {
	return &ScanHandler{svc: svc}
}

type startReq struct {
	CIDR        string `json:"cidr" binding:"required"`
	Concurrency int    `json:"concurrency"`
}

func (h *ScanHandler) Networks(c *gin.Context) {
	list, err := service.LocalNetworks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResp{err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"networks": list})
}

func (h *ScanHandler) Start(c *gin.Context) {
	var req startReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResp{err.Error()})
		return
	}
	_, err := h.svc.Start(req.CIDR, req.Concurrency)
	if err != nil {
		c.JSON(http.StatusConflict, errorResp{err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "started", "cidr": req.CIDR})
}

func (h *ScanHandler) Stop(c *gin.Context) {
	h.svc.Stop()
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func (h *ScanHandler) Status(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": h.svc.Status()})
}

// Stream relays the currently running task's events as SSE.
func (h *ScanHandler) Stream(c *gin.Context) {
	SSEHeaders(c)
	cidr := strings.TrimSpace(c.Query("cidr"))
	task := h.svc.CurrentTask()
	if task == nil {
		if cidr == "" {
			_ = WriteSSE(c, "error", errorResp{"no running task and no cidr provided"})
			return
		}
		var err error
		task, err = h.svc.Start(cidr, 64)
		if err != nil {
			_ = WriteSSE(c, "error", errorResp{err.Error()})
			return
		}
	}
	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		return
	}
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			select {
			case <-c.Request.Context().Done():
				return
			default:
			}
			_ = WriteSSE(c, "ping", gin.H{"ts": time.Now().Unix()})
			flusher.Flush()
		}
	}()
	for ev := range task.Events() {
		select {
		case <-c.Request.Context().Done():
			return
		default:
		}
		if ev.Type == "device" && ev.Device != nil {
			if ev.Device.Vendor == "" && ev.Device.MAC != "" {
				ev.Device.Vendor = oui.Lookup(ev.Device.MAC)
			}
			h.svc.SaveScanResult(ev.Device.IP, ev.Device.MAC, ev.Device.Vendor, ev.Device.Hostname, cidr)
		}
		_ = WriteSSE(c, ev.Type, ev)
		flusher.Flush()
	}
}

func VendorHandler(c *gin.Context) {
	mac := strings.TrimSpace(c.Param("mac"))
	c.JSON(http.StatusOK, gin.H{"mac": mac, "vendor": oui.Lookup(mac)})
}
