package service

import (
	"crypto/tls"
	"net/http"
	"net/http/httptrace"
	"time"

	"websitespeedtest/model"
)

func PerformSpeedTest(url, region, regionName string) *model.SpeedTestResult {
	result := &model.SpeedTestResult{
		URL:        url,
		Region:     region,
		RegionName: regionName,
	}

	var (
		dnsStart, dnsDone, connectStart, connectDone, tlsStart, tlsDone,
		firstByte, domReady, loadComplete time.Time
	)

	start := time.Now()

	trace := &httptrace.ClientTrace{
		DNSStart: func(dsi httptrace.DNSStartInfo) {
			dnsStart = time.Now()
		},
		DNSDone: func(ddi httptrace.DNSDoneInfo) {
			dnsDone = time.Now()
		},
		ConnectStart: func(network, addr string) {
			if connectStart.IsZero() {
				connectStart = time.Now()
			}
		},
		ConnectDone: func(network, addr string, err error) {
			if err == nil && connectDone.IsZero() {
				connectDone = time.Now()
			}
		},
		TLSHandshakeStart: func() {
			tlsStart = time.Now()
		},
		TLSHandshakeDone: func(cs tls.ConnectionState, err error) {
			if err == nil {
				tlsDone = time.Now()
			}
		},
		GotFirstResponseByte: func() {
			firstByte = time.Now()
		},
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		result.Error = err.Error()
		result.TotalTime = time.Since(start).Milliseconds()
		return result
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: false},
		},
	}

	resp, err := client.Do(req)
	if err != nil {
		result.Error = err.Error()
		result.TotalTime = time.Since(start).Milliseconds()
		return result
	}
	defer resp.Body.Close()

	domReady = time.Now()
	buf := make([]byte, 1024)
	for {
		_, err := resp.Body.Read(buf)
		if err != nil {
			break
		}
	}
	loadComplete = time.Now()

	result.StatusCode = resp.StatusCode
	result.DNSLookup = elapsed(dnsStart, dnsDone)
	result.TCPConnect = elapsed(connectStart, connectDone)
	result.TLSHandshake = elapsed(tlsStart, tlsDone)
	result.TTFB = elapsed(connectStart, firstByte)
	result.ContentDL = elapsed(firstByte, loadComplete)
	result.DOMReady = elapsed(start, domReady)
	result.LoadComplete = elapsed(start, loadComplete)
	result.TotalTime = time.Since(start).Milliseconds()

	return result
}

func elapsed(start, end time.Time) int64 {
	if start.IsZero() || end.IsZero() {
		return 0
	}
	return end.Sub(start).Milliseconds()
}
