package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8080"

type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type LoginData struct {
	Token string `json:"token"`
}

func main() {
	fmt.Println("=== Short Drama Platform API Test ===")
	fmt.Println()

	token := testLogin()
	if token == "" {
		fmt.Println("Login failed, exit")
		return
	}

	testStakeholderTypes(token)
	producerId := testCreateStakeholder(token)
	dramaId := testCreateDrama(token)
	ruleId := testCreateRule(token)
	testPublishRule(token, ruleId)
	testBindRule(token, dramaId, ruleId)
	testAddDramaRight(token, dramaId, producerId)
	testImportPlayData(token, dramaId)
	testImportPaymentData(token, dramaId)
	taskNo := testCalculateShare(token, dramaId)
	fmt.Println("Task No:", taskNo)
	time.Sleep(2 * time.Second)
	testListTasks(token)

	fmt.Println()
	fmt.Println("=== All tests completed! ===")
}

func testLogin() string {
	fmt.Println("1. Testing login API...")
	body := map[string]string{
		"username": "admin",
		"password": "admin123",
	}
	resp := sendRequest("POST", "/api/auth/login", body, "")
	if resp.Code == 0 {
		dataMap := resp.Data.(map[string]interface{})
		token := dataMap["token"].(string)
		fmt.Println("   Login success! Token:", token[:20]+"...")
		fmt.Println()
		return token
	}
	fmt.Println("   Login failed:", resp.Message)
	fmt.Println()
	return ""
}

func testStakeholderTypes(token string) {
	fmt.Println("2. Testing get stakeholder types...")
	resp := sendRequest("GET", "/api/stakeholders/types", nil, token)
	if resp.Code == 0 {
		types := resp.Data.([]interface{})
		fmt.Println("   Got", len(types), "types")
		for _, t := range types {
			tMap := t.(map[string]interface{})
			fmt.Printf("     - %s (%s)\n", tMap["type_name"], tMap["type_code"])
		}
	}
	fmt.Println()
}

func testCreateStakeholder(token string) uint64 {
	fmt.Println("3. Testing create stakeholder...")
	body := map[string]interface{}{
		"type_code":      "PRODUCER",
		"name":           "Test Production Co., Ltd.",
		"contact_person": "John Doe",
		"contact_phone":  "13800138000",
	}
	resp := sendRequest("POST", "/api/stakeholders", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		id := uint64(data["id"].(float64))
		name := data["name"].(string)
		fmt.Println("   Create success! ID:", id, "Name:", name)
		fmt.Println()
		return id
	}
	fmt.Println("   Failed:", resp.Message)
	fmt.Println()
	return 0
}

func testCreateDrama(token string) uint64 {
	fmt.Println("4. Testing create drama...")
	body := map[string]interface{}{
		"title":          "Test Drama: Office Story",
		"description":    "A short drama about office life",
		"total_episodes": 24,
		"duration":       10,
	}
	resp := sendRequest("POST", "/api/dramas", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		id := uint64(data["id"].(float64))
		title := data["title"].(string)
		fmt.Println("   Create success! ID:", id, "Title:", title)
		fmt.Println()
		return id
	}
	fmt.Println("   Failed:", resp.Message)
	fmt.Println()
	return 0
}

func testCreateRule(token string) uint64 {
	fmt.Println("5. Testing create profit share rule...")
	dsl := map[string]interface{}{
		"base_ratio":     70.0,
		"platform_ratio": 30.0,
		"min_payout":     100.0,
	}
	body := map[string]interface{}{
		"rule_name":   "Test Fixed Ratio Rule",
		"rule_type":   1,
		"description": "Fixed 70% share ratio",
		"dsl_content": dsl,
		"priority":    10,
	}
	resp := sendRequest("POST", "/api/rules", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		id := uint64(data["id"].(float64))
		name := data["rule_name"].(string)
		fmt.Println("   Create success! ID:", id, "Name:", name)
		fmt.Println()
		return id
	}
	fmt.Println("   Failed:", resp.Message)
	fmt.Println()
	return 0
}

func testPublishRule(token string, ruleId uint64) {
	fmt.Println("6. Testing publish rule...")
	body := map[string]interface{}{
		"status": 1,
	}
	url := fmt.Sprintf("/api/rules/%d", ruleId)
	resp := sendRequest("PUT", url, body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		status := int8(data["status"].(float64))
		fmt.Println("   Rule status updated to:", status, "(1=Published)")
	}
	fmt.Println()
}

func testBindRule(token string, dramaId, ruleId uint64) {
	fmt.Println("7. Testing bind rule to drama...")
	body := map[string]interface{}{
		"drama_id": dramaId,
		"rule_id":  ruleId,
	}
	resp := sendRequest("POST", "/api/rules/bind", body, token)
	if resp.Code == 0 {
		fmt.Println("   Bind success!")
	} else {
		fmt.Println("   Failed:", resp.Message)
	}
	fmt.Println()
}

func testAddDramaRight(token string, dramaId, stakeholderId uint64) {
	fmt.Println("8. Testing add drama right...")
	body := map[string]interface{}{
		"drama_id":       dramaId,
		"stakeholder_id": stakeholderId,
		"base_ratio":     100.0,
		"remark":         "Producer 100% share",
	}
	resp := sendRequest("POST", "/api/dramas/rights", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		ratio := data["base_ratio"].(float64)
		fmt.Println("   Right allocation success! Ratio:", ratio, "%")
	} else {
		fmt.Println("   Failed:", resp.Message)
	}
	fmt.Println()
}

func testImportPlayData(token string, dramaId uint64) {
	fmt.Println("9. Testing import play data...")
	body := map[string]interface{}{
		"drama_id":       dramaId,
		"play_count":     10000,
		"play_duration":  100000,
		"unique_viewers": 5000,
		"data_date":      "2026-05-01",
		"data_source":    "Test Data",
	}
	resp := sendRequest("POST", "/api/data/play", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		playCount := int64(data["play_count"].(float64))
		fmt.Println("   Import success! Play count:", playCount)
	} else {
		fmt.Println("   Failed:", resp.Message)
	}
	fmt.Println()
}

func testImportPaymentData(token string, dramaId uint64) {
	fmt.Println("10. Testing import payment data...")
	body := map[string]interface{}{
		"drama_id":        dramaId,
		"payment_amount":  5000.00,
		"payment_count":   500,
		"unique_payers":   300,
		"data_date":       "2026-05-01",
		"data_source":     "Test Data",
	}
	resp := sendRequest("POST", "/api/data/payment", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		amount := data["payment_amount"].(float64)
		fmt.Println("   Import success! Payment amount:", amount)
	} else {
		fmt.Println("   Failed:", resp.Message)
	}
	fmt.Println()
}

func testCalculateShare(token string, dramaId uint64) string {
	fmt.Println("11. Testing trigger share calculation...")
	body := map[string]interface{}{
		"drama_id":          dramaId,
		"settlement_period": "202605",
		"task_type":         3,
	}
	resp := sendRequest("POST", "/api/share/calculate", body, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		taskNo := data["task_no"].(string)
		fmt.Println("   Calculation task submitted! Task No:", taskNo)
		fmt.Println()
		return taskNo
	}
	fmt.Println("   Failed:", resp.Message)
	fmt.Println()
	return ""
}

func testListTasks(token string) {
	fmt.Println("12. Testing list share tasks...")
	resp := sendRequest("GET", "/api/share/tasks", nil, token)
	if resp.Code == 0 {
		data := resp.Data.(map[string]interface{})
		total := int64(data["total"].(float64))
		fmt.Println("   Got", total, "tasks")
		list := data["list"].([]interface{})
		for _, task := range list {
			tMap := task.(map[string]interface{})
			taskNo := tMap["task_no"].(string)
			status := int8(tMap["status"].(float64))
			statusText := []string{"Pending", "Processing", "Completed", "Failed"}[status]
			fmt.Printf("     - Task No: %s, Status: %s\n", taskNo, statusText)
		}
	}
	fmt.Println()
}

func sendRequest(method, path string, body interface{}, token string) APIResponse {
	var reqBody []byte
	var err error
	if body != nil {
		reqBody, err = json.Marshal(body)
		if err != nil {
			return APIResponse{Code: 1, Message: err.Error()}
		}
	}

	req, err := http.NewRequest(method, baseURL+path, bytes.NewBuffer(reqBody))
	if err != nil {
		return APIResponse{Code: 1, Message: err.Error()}
	}

	req.Header.Set("Content-Type", "application/json")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return APIResponse{Code: 1, Message: err.Error()}
	}
	defer resp.Body.Close()

	respBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return APIResponse{Code: 1, Message: err.Error()}
	}

	var apiResp APIResponse
	err = json.Unmarshal(respBody, &apiResp)
	if err != nil {
		return APIResponse{Code: 1, Message: err.Error() + ": " + string(respBody)}
	}

	return apiResp
}
