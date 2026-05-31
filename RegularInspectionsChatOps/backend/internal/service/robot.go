package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"inspection-chatops/internal/model"
	"inspection-chatops/internal/repository"
	"inspection-chatops/pkg/logger"
	"inspection-chatops/pkg/redis"
	"io"
	"net/http"
	"os/exec"
	"text/template"
	"time"

	"go.uber.org/zap"
)

type RobotService struct {
	robotRepo *repository.RobotRepository
	planRepo  *repository.PlanRepository
	auditRepo *repository.AuditRepository
	userRepo  *repository.UserRepository
}

func NewRobotService() *RobotService {
	return &RobotService{
		robotRepo: repository.NewRobotRepository(),
		planRepo:  repository.NewPlanRepository(),
		auditRepo: repository.NewAuditRepository(),
		userRepo:  repository.NewUserRepository(),
	}
}

func (s *RobotService) CreateRobot(req *model.CreateRobotRequest, userID uint64) (*model.RobotConfig, error) {
	robot := &model.RobotConfig{
		Name:       req.Name,
		Type:       req.Type,
		WebhookURL: req.WebhookURL,
		Secret:     req.Secret,
		Token:      req.Token,
		AtMobiles:  req.AtMobiles,
		AtAll:      req.AtAll,
		IsDefault:  req.IsDefault,
		Status:     req.Status,
		CreatedBy:  userID,
	}

	if robot.IsDefault == 1 {
		if err := s.clearDefault(); err != nil {
			logger.Error("清除默认机器人失败", zap.Error(err))
		}
	}

	err := s.robotRepo.Create(robot)
	return robot, err
}

func (s *RobotService) clearDefault() error {
	robots, err := s.robotRepo.GetAllEnabled()
	if err != nil {
		return err
	}

	for _, r := range robots {
		if r.IsDefault == 1 {
			r.IsDefault = 0
			s.robotRepo.Update(&r)
		}
	}
	return nil
}

func (s *RobotService) GetRobot(id uint64) (*model.RobotConfig, error) {
	return s.robotRepo.GetByID(id)
}

func (s *RobotService) UpdateRobot(id uint64, req *model.CreateRobotRequest) (*model.RobotConfig, error) {
	robot, err := s.robotRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	robot.Name = req.Name
	robot.Type = req.Type
	robot.WebhookURL = req.WebhookURL
	robot.Secret = req.Secret
	robot.Token = req.Token
	robot.AtMobiles = req.AtMobiles
	robot.AtAll = req.AtAll
	robot.IsDefault = req.IsDefault
	robot.Status = req.Status

	if robot.IsDefault == 1 {
		s.clearDefault()
	}

	err = s.robotRepo.Update(robot)
	return robot, err
}

func (s *RobotService) DeleteRobot(id uint64) error {
	return s.robotRepo.Delete(id)
}

func (s *RobotService) ListRobots(page, pageSize int) ([]model.RobotConfig, int64, error) {
	return s.robotRepo.List(page, pageSize)
}

func (s *RobotService) SendMessage(robotID uint64, message string) error {
	var robot *model.RobotConfig
	var err error

	if robotID > 0 {
		robot, err = s.robotRepo.GetByID(robotID)
	} else {
		robot, err = s.robotRepo.GetDefault()
	}

	if err != nil {
		return err
	}

	return s.sendToRobot(robot, message)
}

func (s *RobotService) sendToRobot(robot *model.RobotConfig, message string) error {
	var payload map[string]interface{}

	switch robot.Type {
	case "dingtalk":
		payload = s.buildDingTalkMessage(robot, message)
	default:
		payload = map[string]interface{}{
			"msgtype": "text",
			"text": map[string]string{
				"content": message,
			},
		}
	}

	webhookURL := robot.WebhookURL
	if robot.Secret != "" && robot.Type == "dingtalk" {
		timestamp := time.Now().UnixMilli()
		sign := s.dingTalkSign(timestamp, robot.Secret)
		webhookURL = fmt.Sprintf("%s&timestamp=%d&sign=%s", webhookURL, timestamp, sign)
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(webhookURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	logger.Info("机器人推送结果", zap.String("response", string(respBody)))

	return nil
}

func (s *RobotService) buildDingTalkMessage(robot *model.RobotConfig, content string) map[string]interface{} {
	at := make(map[string]interface{})
	if robot.AtAll == 1 {
		at["isAtAll"] = true
	}
	if len(robot.AtMobiles) > 0 {
		at["atMobiles"] = robot.AtMobiles
	}

	return map[string]interface{}{
		"msgtype": "text",
		"text": map[string]string{
			"content": content,
		},
		"at": at,
	}
}

func (s *RobotService) dingTalkSign(timestamp int64, secret string) string {
	stringToSign := fmt.Sprintf("%d\n%s", timestamp, secret)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(stringToSign))
	signData := h.Sum(nil)
	return base64.StdEncoding.EncodeToString(signData)
}

type PlanService struct {
	planRepo  *repository.PlanRepository
	auditRepo *repository.AuditRepository
}

func NewPlanService() *PlanService {
	return &PlanService{
		planRepo:  repository.NewPlanRepository(),
		auditRepo: repository.NewAuditRepository(),
	}
}

func (s *PlanService) CreatePlan(req *model.CreatePlanRequest, userID uint64) (*model.Plan, error) {
	plan := &model.Plan{
		Name:           req.Name,
		Description:    req.Description,
		Command:        req.Command,
		Type:           req.Type,
		Config:         req.Config,
		Timeout:        req.Timeout,
		IdempotentKey:  req.IdempotentKey,
		AllowedRoles:   req.AllowedRoles,
		AllowedUsers:   req.AllowedUsers,
		NeedApproval:   req.NeedApproval,
		Status:         req.Status,
		CreatedBy:      userID,
	}

	if plan.Timeout == 0 {
		plan.Timeout = 60
	}

	err := s.planRepo.Create(plan)
	return plan, err
}

func (s *PlanService) GetPlan(id uint64) (*model.Plan, error) {
	return s.planRepo.GetByID(id)
}

func (s *PlanService) UpdatePlan(id uint64, req *model.CreatePlanRequest) (*model.Plan, error) {
	plan, err := s.planRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	plan.Name = req.Name
	plan.Description = req.Description
	plan.Command = req.Command
	plan.Type = req.Type
	plan.Config = req.Config
	plan.Timeout = req.Timeout
	plan.IdempotentKey = req.IdempotentKey
	plan.AllowedRoles = req.AllowedRoles
	plan.AllowedUsers = req.AllowedUsers
	plan.NeedApproval = req.NeedApproval
	plan.Status = req.Status

	err = s.planRepo.Update(plan)
	return plan, err
}

func (s *PlanService) DeletePlan(id uint64) error {
	return s.planRepo.Delete(id)
}

func (s *PlanService) ListPlans(page, pageSize int) ([]model.Plan, int64, error) {
	return s.planRepo.List(page, pageSize)
}

func (s *PlanService) ExecuteCommand(command string, params map[string]interface{}, userID uint64, username, channel, ip, userAgent string) (map[string]interface{}, error) {
	plan, err := s.planRepo.GetByCommand(command)
	if err != nil {
		return nil, fmt.Errorf("预案不存在: %s", command)
	}

	if plan.Status != 1 {
		return nil, fmt.Errorf("预案已禁用")
	}

	audit := &model.CommandAudit{
		Command:       command,
		Params:        params,
		UserID:        userID,
		Username:      username,
		Channel:       channel,
		PlanID:        &plan.ID,
		PlanName:      plan.Name,
		Status:        2,
		IPAddress:     ip,
		UserAgent:     userAgent,
		StartedAt:     time.Now(),
	}
	s.auditRepo.Create(audit)

	if plan.IdempotentKey != "" {
		idempotentKey := s.renderTemplate(plan.IdempotentKey, params)
		lock := redis.NewDistributedLock("idempotent:"+idempotentKey, time.Hour)
		ok, err := lock.TryLock(context.Background(), username)
		if err != nil {
			return nil, err
		}
		if !ok {
			audit.Status = 3
			audit.ErrorMessage = "幂等校验失败，请勿重复执行"
			s.auditRepo.Update(audit)
			return nil, fmt.Errorf("请勿重复执行")
		}
	}

	result, err := s.executePlan(plan, params)
	now := time.Now()
	audit.EndedAt = &now
	audit.Duration = int(now.Sub(audit.StartedAt).Milliseconds())

	if err != nil {
		audit.Status = 0
		audit.ErrorMessage = err.Error()
	} else {
		audit.Status = 1
		audit.ResultData = result
	}

	s.auditRepo.Update(audit)

	return result, err
}

func (s *PlanService) executePlan(plan *model.Plan, params map[string]interface{}) (map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(plan.Timeout)*time.Second)
	defer cancel()

	switch plan.Type {
	case 1:
		return s.executeHTTPPlan(ctx, plan, params)
	case 2:
		return s.executeScriptPlan(ctx, plan, params)
	default:
		return nil, fmt.Errorf("不支持的预案类型")
	}
}

func (s *PlanService) executeHTTPPlan(ctx context.Context, plan *model.Plan, params map[string]interface{}) (map[string]interface{}, error) {
	config := plan.Config
	url := s.renderTemplate(config["url"].(string), params)
	method := "GET"
	if config["method"] != nil {
		method = config["method"].(string)
	}

	var body io.Reader
	if config["body"] != nil {
		bodyStr := s.renderTemplate(config["body"].(string), params)
		body = bytes.NewBufferString(bodyStr)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, body)
	if err != nil {
		return nil, err
	}

	if config["headers"] != nil {
		headers := config["headers"].(map[string]interface{})
		for k, v := range headers {
			req.Header.Set(k, s.renderTemplate(v.(string), params))
		}
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	return map[string]interface{}{
		"status_code": resp.StatusCode,
		"body":        string(respBody),
		"success":     resp.StatusCode >= 200 && resp.StatusCode < 300,
	}, nil
}

func (s *PlanService) executeScriptPlan(ctx context.Context, plan *model.Plan, params map[string]interface{}) (map[string]interface{}, error) {
	config := plan.Config
	scriptPath := s.renderTemplate(config["script_path"].(string), params)

	var args []string
	if config["args"] != nil {
		argTemplates := config["args"].([]interface{})
		for _, argTpl := range argTemplates {
			args = append(args, s.renderTemplate(argTpl.(string), params))
		}
	}

	cmd := exec.CommandContext(ctx, scriptPath, args...)
	output, err := cmd.CombinedOutput()

	result := map[string]interface{}{
		"output": string(output),
	}

	if err != nil {
		result["error"] = err.Error()
		result["success"] = false
	} else {
		result["success"] = true
	}

	return result, nil
}

func (s *PlanService) renderTemplate(tpl string, data map[string]interface{}) string {
	tmpl, err := template.New("tpl").Parse(tpl)
	if err != nil {
		return tpl
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return tpl
	}

	return buf.String()
}

func (s *PlanService) ListAudit(page, pageSize int, userID uint64, status int8) ([]model.CommandAudit, int64, error) {
	return s.auditRepo.List(page, pageSize, userID, status)
}
