package handlers

import (
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type StatusHandler struct {
	Root string
}

func NewStatusHandler(root string) *StatusHandler {
	return &StatusHandler{Root: root}
}

type DiskUsage struct {
	Path    string  `json:"path"`
	Total   uint64  `json:"total"`
	Free    uint64  `json:"free"`
	Used    uint64  `json:"used"`
	UsedPct float64 `json:"used_pct"`
}

type SambaStatus struct {
	Running    bool   `json:"running"`
	StatusText string `json:"status_text"`
	Service    string `json:"service"`
}

func (h *StatusHandler) Disk(c *gin.Context) {
	du, err := diskUsage(h.Root)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"error": err.Error(), "path": h.Root})
		return
	}
	c.JSON(http.StatusOK, du)
}

func (h *StatusHandler) Samba(c *gin.Context) {
	status := SambaStatus{Service: "smbd"}
	if runtime.GOOS == "windows" {
		out, err := exec.Command("powershell", "-NoProfile", "-Command",
			"Get-Service -Name LanmanServer | Select-Object -ExpandProperty Status").Output()
		if err == nil {
			s := strings.TrimSpace(string(out))
			status.Service = "LanmanServer"
			status.StatusText = s
			status.Running = strings.Contains(strings.ToLower(s), "running")
		} else {
			status.StatusText = "unable to query: " + err.Error()
		}
		c.JSON(http.StatusOK, status)
		return
	}
	for _, svc := range []string{"smbd", "smb", "samba"} {
		out, err := exec.Command("systemctl", "is-active", svc).Output()
		if err == nil {
			txt := strings.TrimSpace(string(out))
			status.Service = svc
			status.StatusText = txt
			status.Running = txt == "active"
			c.JSON(http.StatusOK, status)
			return
		}
	}
	status.StatusText = "samba service not detected"
	c.JSON(http.StatusOK, status)
}

type SystemInfo struct {
	OS         string `json:"os"`
	Arch       string `json:"arch"`
	Hostname   string `json:"hostname"`
	NumCPU     int    `json:"num_cpu"`
	GoVersion  string `json:"go_version"`
	ServerTime string `json:"server_time"`
}

func (h *StatusHandler) System(c *gin.Context) {
	hostname, _ := os.Hostname()
	c.JSON(http.StatusOK, SystemInfo{
		OS:         runtime.GOOS,
		Arch:       runtime.GOARCH,
		Hostname:   hostname,
		NumCPU:     runtime.NumCPU(),
		GoVersion:  runtime.Version(),
		ServerTime: time.Now().Format(time.RFC3339),
	})
}

func (h *StatusHandler) Index(c *gin.Context) {
	hostname, _ := os.Hostname()
	info := SystemInfo{
		OS:         runtime.GOOS,
		Arch:       runtime.GOARCH,
		Hostname:   hostname,
		NumCPU:     runtime.NumCPU(),
		GoVersion:  runtime.Version(),
		ServerTime: time.Now().Format(time.RFC3339),
	}
	du, _ := diskUsage(h.Root)
	c.JSON(http.StatusOK, gin.H{
		"system": info,
		"disk":   du,
	})
}
