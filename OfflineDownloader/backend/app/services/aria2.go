package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"offlinedownloader/config"
	"strings"
)

type Aria2Client struct {
	RPCUrl    string
	RPCSecret string
}

type Aria2Request struct {
	JSONRPC string        `json:"jsonrpc"`
	Method  string        `json:"method"`
	Params  []interface{} `json:"params"`
	ID      string        `json:"id"`
}

type Aria2Response struct {
	JSONRPC string                 `json:"jsonrpc"`
	ID      string                 `json:"id"`
	Result  interface{}            `json:"result,omitempty"`
	Error   map[string]interface{} `json:"error,omitempty"`
}

type Aria2TaskStatus struct {
	GID             string `json:"gid"`
	Status          string `json:"status"`
	TotalLength     string `json:"totalLength"`
	CompletedLength string `json:"completedLength"`
	DownloadSpeed   string `json:"downloadSpeed"`
	UploadSpeed     string `json:"uploadSpeed"`
	FileName        string `json:"fileName"`
	Dir             string `json:"dir"`
	Files           []struct {
		Index   string `json:"index"`
		Path    string `json:"path"`
		Length  string `json:"length"`
		CompletedLength string `json:"completedLength"`
		URIs    []struct {
			URI    string `json:"uri"`
			Status string `json:"status"`
		} `json:"uris"`
	} `json:"files"`
	BitField     string `json:"bitfield"`
	InfoHash     string `json:"infoHash,omitempty"`
	NumSeeders   string `json:"numSeeders,omitempty"`
	Seeder       string `json:"seeder,omitempty"`
	ErrorMessage string `json:"errorMessage,omitempty"`
	ErrorCode    string `json:"errorCode,omitempty"`
}

var Aria2 *Aria2Client

func InitAria2() {
	Aria2 = &Aria2Client{
		RPCUrl:    config.AppConfig.Aria2RPCUrl,
		RPCSecret: config.AppConfig.Aria2RPCSecret,
	}
}

func (c *Aria2Client) call(method string, params []interface{}) (interface{}, error) {
	if c.RPCSecret != "" {
		params = append([]interface{}{"token:" + c.RPCSecret}, params...)
	}

	req := Aria2Request{
		JSONRPC: "2.0",
		Method:  method,
		Params:  params,
		ID:      "offline_downloader",
	}

	reqBody, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	resp, err := http.Post(c.RPCUrl, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %v", err)
	}

	var aria2Resp Aria2Response
	if err := json.Unmarshal(body, &aria2Resp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %v, body: %s", err, string(body))
	}

	if aria2Resp.Error != nil {
		return nil, fmt.Errorf("aria2 error: %v", aria2Resp.Error)
	}

	return aria2Resp.Result, nil
}

func (c *Aria2Client) AddURI(url string, options map[string]interface{}) (string, error) {
	params := []interface{}{[]string{url}}
	if options != nil {
		params = append(params, options)
	}

	result, err := c.call("aria2.addUri", params)
	if err != nil {
		return "", err
	}

	gid, ok := result.(string)
	if !ok {
		return "", fmt.Errorf("unexpected result type: %T", result)
	}

	return gid, nil
}

func (c *Aria2Client) AddTorrent(torrentFile string, options map[string]interface{}) (string, error) {
	params := []interface{}{torrentFile}
	if options != nil {
		params = append(params, options)
	}

	result, err := c.call("aria2.addTorrent", params)
	if err != nil {
		return "", err
	}

	gid, ok := result.(string)
	if !ok {
		return "", fmt.Errorf("unexpected result type: %T", result)
	}

	return gid, nil
}

func (c *Aria2Client) AddMetalink(metalink string, options map[string]interface{}) (string, error) {
	params := []interface{}{metalink}
	if options != nil {
		params = append(params, options)
	}

	result, err := c.call("aria2.addMetalink", params)
	if err != nil {
		return "", err
	}

	gid, ok := result.(string)
	if !ok {
		return "", fmt.Errorf("unexpected result type: %T", result)
	}

	return gid, nil
}

func (c *Aria2Client) TellStatus(gid string) (*Aria2TaskStatus, error) {
	result, err := c.call("aria2.tellStatus", []interface{}{gid})
	if err != nil {
		return nil, err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal result: %v", err)
	}

	var status Aria2TaskStatus
	if err := json.Unmarshal(resultBytes, &status); err != nil {
		return nil, fmt.Errorf("failed to unmarshal status: %v", err)
	}

	return &status, nil
}

func (c *Aria2Client) TellActive() ([]Aria2TaskStatus, error) {
	result, err := c.call("aria2.tellActive", []interface{}{})
	if err != nil {
		return nil, err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal result: %v", err)
	}

	var statuses []Aria2TaskStatus
	if err := json.Unmarshal(resultBytes, &statuses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal statuses: %v", err)
	}

	return statuses, nil
}

func (c *Aria2Client) TellWaiting(offset, num int) ([]Aria2TaskStatus, error) {
	result, err := c.call("aria2.tellWaiting", []interface{}{offset, num})
	if err != nil {
		return nil, err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal result: %v", err)
	}

	var statuses []Aria2TaskStatus
	if err := json.Unmarshal(resultBytes, &statuses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal statuses: %v", err)
	}

	return statuses, nil
}

func (c *Aria2Client) TellStopped(offset, num int) ([]Aria2TaskStatus, error) {
	result, err := c.call("aria2.tellStopped", []interface{}{offset, num})
	if err != nil {
		return nil, err
	}

	resultBytes, err := json.Marshal(result)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal result: %v", err)
	}

	var statuses []Aria2TaskStatus
	if err := json.Unmarshal(resultBytes, &statuses); err != nil {
		return nil, fmt.Errorf("failed to unmarshal statuses: %v", err)
	}

	return statuses, nil
}

func (c *Aria2Client) Pause(gid string) error {
	_, err := c.call("aria2.pause", []interface{}{gid})
	return err
}

func (c *Aria2Client) PauseAll() error {
	_, err := c.call("aria2.pauseAll", []interface{}{})
	return err
}

func (c *Aria2Client) Resume(gid string) error {
	_, err := c.call("aria2.unpause", []interface{}{gid})
	return err
}

func (c *Aria2Client) ResumeAll() error {
	_, err := c.call("aria2.unpauseAll", []interface{}{})
	return err
}

func (c *Aria2Client) Remove(gid string) error {
	_, err := c.call("aria2.remove", []interface{}{gid})
	return err
}

func (c *Aria2Client) RemoveDownloadResult(gid string) error {
	_, err := c.call("aria2.removeDownloadResult", []interface{}{gid})
	return err
}

func (c *Aria2Client) ForceRemove(gid string) error {
	_, err := c.call("aria2.forceRemove", []interface{}{gid})
	return err
}

func IsMagnetLink(url string) bool {
	return strings.HasPrefix(strings.ToLower(url), "magnet:")
}

func ParseInfoHash(magnetLink string) string {
	if !IsMagnetLink(magnetLink) {
		return ""
	}

	parts := strings.Split(magnetLink, "?")
	if len(parts) < 2 {
		return ""
	}

	params := strings.Split(parts[1], "&")
	for _, param := range params {
		if strings.HasPrefix(param, "xt=urn:btih:") {
			hash := strings.TrimPrefix(param, "xt=urn:btih:")
			return strings.ToLower(hash)
		}
	}

	return ""
}

func IsED2KLink(url string) bool {
	return strings.HasPrefix(strings.ToLower(url), "ed2k://")
}

func ParseED2KFileName(ed2kLink string) string {
	if !IsED2KLink(ed2kLink) {
		return ""
	}

	parts := strings.Split(ed2kLink, "|")
	if len(parts) >= 3 {
		return parts[2]
	}

	return ""
}

func (c *Aria2Client) GetGlobalStat() (map[string]interface{}, error) {
	result, err := c.call("aria2.getGlobalStat", []interface{}{})
	if err != nil {
		return nil, err
	}

	stats, ok := result.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("unexpected result type: %T", result)
	}

	return stats, nil
}

func (s *Aria2TaskStatus) GetFileCount() int {
	return len(s.Files)
}

func (s *Aria2TaskStatus) GetMainFileName() string {
	if s.FileName != "" {
		return s.FileName
	}
	if len(s.Files) > 0 {
		parts := strings.Split(s.Files[0].Path, "/")
		return parts[len(parts)-1]
	}
	return ""
}
