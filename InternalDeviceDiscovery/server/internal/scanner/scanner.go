package scanner

import (
	"context"
	"encoding/binary"
	"fmt"
	"net"
	"os/exec"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type ScanOptions struct {
	CIDR        string
	Concurrency int
	Timeout     time.Duration
}

type ScanEvent struct {
	Type    string      `json:"type"`
	Percent int         `json:"percent,omitempty"`
	Current string      `json:"current,omitempty"`
	Done    int         `json:"done,omitempty"`
	Total   int         `json:"total,omitempty"`
	Device  *ScanDevice `json:"device,omitempty"`
	Message string      `json:"message,omitempty"`
	Error   string      `json:"error,omitempty"`
	TotalDevices int    `json:"totalDevices,omitempty"`
	NewFound    int    `json:"newFound,omitempty"`
}

type ScanDevice struct {
	IP       string `json:"ip"`
	MAC      string `json:"mac"`
	Vendor   string `json:"vendor"`
	Hostname string `json:"hostname"`
}

// Task represents a running scan task. It emits events through its channel.
type Task struct {
	opts      ScanOptions
	ips       []string
	events    chan ScanEvent
	cancel    context.CancelFunc
	ctx       context.Context
	done      int64
	total     int
	mu        sync.Mutex
	results   []ScanDevice
	seen      map[string]struct{}
}

func NewTask(opts ScanOptions) (*Task, error) {
	ips, err := expandCIDR(opts.CIDR)
	if err != nil {
		return nil, err
	}
	if opts.Concurrency <= 0 {
		opts.Concurrency = 64
	}
	if opts.Timeout <= 0 {
		opts.Timeout = 600 * time.Millisecond
	}
	ctx, cancel := context.WithCancel(context.Background())
	return &Task{
		opts:   opts,
		ips:    ips,
		total:  len(ips),
		events: make(chan ScanEvent, 256),
		ctx:    ctx,
		cancel: cancel,
		seen:   map[string]struct{}{},
	}, nil
}

func (t *Task) Events() <-chan ScanEvent { return t.events }

func (t *Task) Stop() { t.cancel() }

func (t *Task) Run() {
	defer close(t.events)
	defer func() {
		t.mu.Lock()
		total := len(t.results)
		t.mu.Unlock()
		t.events <- ScanEvent{
			Type:         "finish",
			TotalDevices: total,
			NewFound:     total,
		}
	}()

	sem := make(chan struct{}, t.opts.Concurrency)
	var wg sync.WaitGroup
	for _, ip := range t.ips {
		select {
		case <-t.ctx.Done():
			return
		case sem <- struct{}{}:
		}
		wg.Add(1)
		go func(ip string) {
			defer wg.Done()
			defer func() { <-sem }()
			select {
			case <-t.ctx.Done():
				return
			default:
			}
			dev, ok := t.probe(ip)
			if ok {
				t.mu.Lock()
				key := dev.IP + "|" + dev.MAC
				if _, dup := t.seen[key]; !dup {
					t.seen[key] = struct{}{}
					t.results = append(t.results, dev)
					t.mu.Unlock()
					select {
					case t.events <- ScanEvent{Type: "device", Device: &dev}:
					case <-t.ctx.Done():
						return
					}
				} else {
					t.mu.Unlock()
				}
			}
			done := atomic.AddInt64(&t.done, 1)
			percent := 0
			if t.total > 0 {
				percent = int(float64(done) * 100 / float64(t.total))
			}
			select {
			case t.events <- ScanEvent{
				Type:    "progress",
				Percent: percent,
				Current: ip,
				Done:    int(done),
				Total:   t.total,
			}:
			case <-t.ctx.Done():
				return
			}
		}(ip)
	}
	wg.Wait()
}

func (t *Task) probe(ip string) (ScanDevice, bool) {
	if runtime.GOOS == "windows" {
		return t.probeWindows(ip)
	}
	return t.probeUnix(ip)
}

func (t *Task) probeWindows(ip string) (ScanDevice, bool) {
	ctx, cancel := context.WithTimeout(t.ctx, t.opts.Timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, "ping", "-n", "1", "-w", fmt.Sprintf("%d", t.opts.Timeout/time.Millisecond), ip)
	out, err := cmd.CombinedOutput()
	alive := err == nil || ctx.Err() == nil && strings.Contains(string(out), "TTL")
	if !alive {
		return ScanDevice{}, false
	}
	ctx2, cancel2 := context.WithTimeout(t.ctx, 1200*time.Millisecond)
	defer cancel2()
	_ = exec.CommandContext(ctx2, "arp", "-d", ip).Run() // flush to force request
	cmd2 := exec.CommandContext(ctx2, "arp", "-a", ip)
	data, err := cmd2.CombinedOutput()
	if err != nil {
		return ScanDevice{IP: ip, Hostname: lookupHost(ip)}, true
	}
	mac := extractMAC(string(data))
	if mac == "" {
		return ScanDevice{IP: ip, Hostname: lookupHost(ip)}, true
	}
	return ScanDevice{IP: ip, MAC: mac, Hostname: lookupHost(ip)}, true
}

func (t *Task) probeUnix(ip string) (ScanDevice, bool) {
	ctx, cancel := context.WithTimeout(t.ctx, t.opts.Timeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, "ping", "-c", "1", "-W", fmt.Sprintf("%d", t.opts.Timeout/time.Second), ip)
	err := cmd.Run()
	if err != nil && ctx.Err() == nil {
		return ScanDevice{}, false
	}
	// Try to read ARP cache
	cmd2 := exec.CommandContext(t.ctx, "arp", "-n", ip)
	data, err := cmd2.CombinedOutput()
	if err == nil {
		if mac := extractMAC(string(data)); mac != "" {
			return ScanDevice{IP: ip, MAC: mac, Hostname: lookupHost(ip)}, true
		}
	}
	return ScanDevice{IP: ip, Hostname: lookupHost(ip)}, true
}

func lookupHost(ip string) string {
	ctx, cancel := context.WithTimeout(context.Background(), 800*time.Millisecond)
	defer cancel()
	names, err := net.DefaultResolver.LookupAddr(ctx, ip)
	if err == nil && len(names) > 0 {
		return strings.TrimSuffix(names[0], ".")
	}
	return ""
}

var macRe = regexp.MustCompile(`([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}`)

func extractMAC(s string) string {
	m := macRe.FindString(s)
	if m == "" {
		return ""
	}
	return strings.ToLower(strings.ReplaceAll(m, "-", ":"))
}

func expandCIDR(cidr string) ([]string, error) {
	if !strings.Contains(cidr, "/") {
		cidr = cidr + "/32"
	}
	ip, ipnet, err := net.ParseCIDR(cidr)
	if err != nil {
		return nil, err
	}
	ones, bits := ipnet.Mask.Size()
	if bits == 0 {
		return nil, fmt.Errorf("invalid network")
	}
	// Restrict to IPv4 for this project
	if bits != 32 {
		return nil, fmt.Errorf("only IPv4 networks are supported")
	}
	size := 1 << (bits - ones)
	if size > 65536 {
		return nil, fmt.Errorf("network too large (%d hosts), max 65536", size)
	}
	ips := make([]string, 0, size)
	start := ip.Mask(ipnet.Mask).To4()
	startInt := binary.BigEndian.Uint32(start)
	for i := 0; i < size; i++ {
		next := make(net.IP, 4)
		binary.BigEndian.PutUint32(next, startInt+uint32(i))
		if next.Equal(ipnet.IP) || isBroadcast(next, ipnet) {
			continue
		}
		ips = append(ips, next.String())
	}
	return ips, nil
}

func isBroadcast(ip net.IP, n *net.IPNet) bool {
	if ip.To4() == nil {
		return false
	}
	mask := n.Mask
	if len(mask) != 4 {
		mask = mask[len(mask)-4:]
	}
	v4 := ip.To4()
	for i := 0; i < 4; i++ {
		if v4[i]|mask[i] != 255 {
			return false
		}
	}
	return true
}
