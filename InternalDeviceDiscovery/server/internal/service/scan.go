package service

import (
	"internal-device-discovery/internal/scanner"
	"net"
	"sync"
)

type ScanService struct {
	current   *scanner.Task
	mu        sync.Mutex
	deviceSvc *DeviceService
}

func NewScanService(ds *DeviceService) *ScanService {
	return &ScanService{deviceSvc: ds}
}

func (s *ScanService) Start(cidr string, concurrency int) (*scanner.Task, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.current != nil {
		return nil, ErrRunning
	}
	task, err := scanner.NewTask(scanner.ScanOptions{
		CIDR:        cidr,
		Concurrency: concurrency,
	})
	if err != nil {
		return nil, err
	}
	s.current = task
	go func() {
		task.Run()
		s.mu.Lock()
		if s.current == task {
			s.current = nil
		}
		s.mu.Unlock()
	}()
	return task, nil
}

func (s *ScanService) Stop() {
	s.mu.Lock()
	cur := s.current
	s.mu.Unlock()
	if cur != nil {
		cur.Stop()
	}
}

func (s *ScanService) Status() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.current != nil {
		return "running"
	}
	return "idle"
}

func (s *ScanService) CurrentTask() *scanner.Task {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.current
}

// SaveScanResult records a device returned from the scanner.
func (s *ScanService) SaveScanResult(ip, mac, vendor, hostname, cidr string) {
	_, _ = s.deviceSvc.UpsertScanResult(ip, mac, vendor, hostname, cidr)
}

// LocalNetworks returns the list of local network CIDRs detected on interfaces.
func LocalNetworks() ([]string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return nil, err
	}
	var out []string
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}
		for _, a := range addrs {
			if ipnet, ok := a.(*net.IPNet); ok && ipnet.IP.To4() != nil {
				out = append(out, ipnet.String())
			}
		}
	}
	return out, nil
}

type scanErr string

func (e scanErr) Error() string { return string(e) }

const ErrRunning scanErr = "scan already running"
