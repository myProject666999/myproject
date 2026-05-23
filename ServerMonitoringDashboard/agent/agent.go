package main

import (
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"
)

type Report struct {
	Token     string  `json:"token"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
	Disk      float64 `json:"disk"`
	MemUsed   int64   `json:"mem_used"`
	MemTotal  int64   `json:"mem_total"`
	DiskUsed  int64   `json:"disk_used"`
	DiskTotal int64   `json:"disk_total"`
}

func getCPU() float64 {
	if runtime.GOOS == "windows" {
		return getCPUWindows()
	}
	return getCPUUnix()
}

func getCPUUnix() float64 {
	data, err := os.ReadFile("/proc/stat")
	if err != nil {
		return 0
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "cpu ") {
			fields := strings.Fields(line)
			if len(fields) < 5 {
				continue
			}
			var total, idle float64
			for i := 1; i < len(fields); i++ {
				v, _ := strconv.ParseFloat(fields[i], 64)
				total += v
			}
			idle, _ = strconv.ParseFloat(fields[4], 64)
			if total > 0 {
				return (1 - idle/total) * 100
			}
		}
	}
	return 0
}

func getCPUWindows() float64 {
	cmd := exec.Command("powershell", "-Command",
		`Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average`)
	output, err := cmd.Output()
	if err != nil {
		return 0
	}
	v, _ := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)
	return v
}

func getMemory() (float64, int64, int64) {
	if runtime.GOOS == "windows" {
		return getMemoryWindows()
	}
	return getMemoryUnix()
}

func getMemoryUnix() (float64, int64, int64) {
	data, err := os.ReadFile("/proc/meminfo")
	if err != nil {
		return 0, 0, 0
	}

	var total, available int64
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		if strings.HasPrefix(line, "MemTotal:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				v, _ := strconv.ParseInt(fields[1], 10, 64)
				total = v * 1024
			}
		}
		if strings.HasPrefix(line, "MemAvailable:") {
			fields := strings.Fields(line)
			if len(fields) >= 2 {
				v, _ := strconv.ParseInt(fields[1], 10, 64)
				available = v * 1024
			}
		}
	}

	if total > 0 {
		used := total - available
		return float64(used) / float64(total) * 100, used, total
	}
	return 0, 0, 0
}

func getMemoryWindows() (float64, int64, int64) {
	cmd := exec.Command("powershell", "-Command",
		`$os = Get-CimInstance Win32_OperatingSystem; [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 1)`)
	output, err := cmd.Output()
	if err != nil {
		return 0, 0, 0
	}
	v, _ := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)

	cmd2 := exec.Command("powershell", "-Command",
		`(Get-CimInstance Win32_OperatingSystem).TotalVisibleMemorySize * 1024`)
	out2, _ := cmd2.Output()
	total, _ := strconv.ParseInt(strings.TrimSpace(string(out2)), 10, 64)

	used := int64(float64(total) * v / 100)
	return v, used, total
}

func getDisk() (float64, int64, int64) {
	if runtime.GOOS == "windows" {
		return getDiskWindows()
	}
	return getDiskUnix()
}

func getDiskUnix() (float64, int64, int64) {
	cmd := exec.Command("df", "-k", "/")
	output, err := cmd.Output()
	if err != nil {
		return 0, 0, 0
	}

	lines := strings.Split(string(output), "\n")
	if len(lines) < 2 {
		return 0, 0, 0
	}

	fields := strings.Fields(lines[1])
	if len(fields) < 5 {
		return 0, 0, 0
	}

	totalKB, _ := strconv.ParseInt(fields[1], 10, 64)
	usedKB, _ := strconv.ParseInt(fields[2], 10, 64)
	usedPctStr := strings.TrimSuffix(fields[4], "%")
	usedPct, _ := strconv.ParseFloat(usedPctStr, 64)

	return usedPct, usedKB * 1024, totalKB * 1024
}

func getDiskWindows() (float64, int64, int64) {
	cmd := exec.Command("powershell", "-Command",
		`$d = Get-PSDrive -Name C; [math]::Round(($d.Used / ($d.Used + $d.Free)) * 100, 1)`)
	output, err := cmd.Output()
	if err != nil {
		return 0, 0, 0
	}
	v, _ := strconv.ParseFloat(strings.TrimSpace(string(output)), 64)

	cmd2 := exec.Command("powershell", "-Command",
		`$d = Get-PSDrive -Name C; $d.Used`)
	out2, _ := cmd2.Output()
	used, _ := strconv.ParseInt(strings.TrimSpace(string(out2)), 10, 64)

	cmd3 := exec.Command("powershell", "-Command",
		`$d = Get-PSDrive -Name C; $d.Used + $d.Free`)
	out3, _ := cmd3.Output()
	total, _ := strconv.ParseInt(strings.TrimSpace(string(out3)), 10, 64)

	return v, used, total
}

func report(server, token string) error {
	cpu := getCPU()
	memPct, memUsed, memTotal := getMemory()
	diskPct, diskUsed, diskTotal := getDisk()

	r := Report{
		Token:     token,
		CPU:       cpu,
		Memory:    memPct,
		Disk:      diskPct,
		MemUsed:   memUsed,
		MemTotal:  memTotal,
		DiskUsed:  diskUsed,
		DiskTotal: diskTotal,
	}

	body, _ := json.Marshal(r)
	url := strings.TrimRight(server, "/") + "/api/agent/report"

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("上报失败: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		return fmt.Errorf("服务器返回错误: %s", string(respBody))
	}

	return nil
}

func main() {
	server := flag.String("server", "http://localhost:8080", "监控服务器地址")
	token := flag.String("token", "", "节点 Token（必填）")
	interval := flag.Int("interval", 10, "上报间隔（秒）")
	once := flag.Bool("once", false, "仅上报一次后退出")
	flag.Parse()

	if *token == "" {
		fmt.Println("错误: 必须指定 -token 参数")
		fmt.Println("用法: agent -server http://your-server:8080 -token YOUR_TOKEN -interval 10")
		flag.PrintDefaults()
		os.Exit(1)
	}

	log.Printf("Agent 启动 - 服务器: %s, 间隔: %ds", *server, *interval)

	if *once {
		if err := report(*server, *token); err != nil {
			log.Println(err)
			os.Exit(1)
		}
		log.Println("上报完成")
		return
	}

	ticker := time.NewTicker(time.Duration(*interval) * time.Second)
	defer ticker.Stop()

	for {
		if err := report(*server, *token); err != nil {
			log.Println(err)
		} else {
			log.Println("上报成功")
		}
		<-ticker.C
	}
}
