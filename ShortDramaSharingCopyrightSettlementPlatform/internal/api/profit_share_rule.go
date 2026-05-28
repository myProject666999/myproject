package api

import (
	"encoding/json"
	"fmt"
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type ProfitShareRuleDSL struct {
	BaseRatio        float64            `json:"base_ratio"`
	PlatformRatio    float64            `json:"platform_ratio,omitempty"`
	TieredRules      []TieredRule       `json:"tiered_rules,omitempty"`
	StakeholderRatio map[string]float64 `json:"stakeholder_ratio,omitempty"`
	MinPayout        float64            `json:"min_payout,omitempty"`
	MaxPayout        float64            `json:"max_payout,omitempty"`
}

type TieredRule struct {
	Threshold     float64 `json:"threshold"`
	Ratio         float64 `json:"ratio"`
	ThresholdType string  `json:"threshold_type"`
}

type RuleCreateRequest struct {
	RuleName      string          `json:"rule_name" binding:"required"`
	RuleType      int8            `json:"rule_type" binding:"required"`
	Description   string          `json:"description"`
	DSLContent    json.RawMessage `json:"dsl_content" binding:"required"`
	Priority      int             `json:"priority"`
	EffectiveDate string          `json:"effective_date"`
	ExpireDate    string          `json:"expire_date"`
}

type RuleUpdateRequest struct {
	RuleName      string          `json:"rule_name"`
	RuleType      int8            `json:"rule_type"`
	Description   string          `json:"description"`
	DSLContent    json.RawMessage `json:"dsl_content"`
	Priority      int             `json:"priority"`
	Status        int8            `json:"status"`
	EffectiveDate string          `json:"effective_date"`
	ExpireDate    string          `json:"expire_date"`
}

func ValidateDSL(dslContent json.RawMessage) error {
	var dsl ProfitShareRuleDSL
	if err := json.Unmarshal(dslContent, &dsl); err != nil {
		return fmt.Errorf("DSL格式错误: %w", err)
	}

	if dsl.BaseRatio <= 0 || dsl.BaseRatio > 100 {
		return fmt.Errorf("基础比例必须在0-100之间")
	}

	totalRatio := dsl.BaseRatio
	if dsl.PlatformRatio > 0 {
		totalRatio += dsl.PlatformRatio
	}

	for _, rule := range dsl.TieredRules {
		if rule.Threshold < 0 {
			return fmt.Errorf("阶梯阈值不能为负数")
		}
		if rule.Ratio <= 0 || rule.Ratio > 100 {
			return fmt.Errorf("阶梯比例必须在0-100之间")
		}
	}

	return nil
}

func CreateProfitShareRule(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req RuleCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	if err := ValidateDSL(req.DSLContent); err != nil {
		utils.Error(c, err.Error())
		return
	}

	rule := &model.ProfitShareRule{
		RuleNo:      utils.GenerateNo("RULE"),
		RuleName:    req.RuleName,
		RuleType:    req.RuleType,
		Description: req.Description,
		DSLContent:  string(req.DSLContent),
		Priority:    req.Priority,
		Status:      0,
		CreatedBy:   userID.(uint64),
	}

	if req.EffectiveDate != "" {
		if t, err := time.Parse("2006-01-02", req.EffectiveDate); err == nil {
			rule.EffectiveDate = t
		}
	}
	if req.ExpireDate != "" {
		if t, err := time.Parse("2006-01-02", req.ExpireDate); err == nil {
			rule.ExpireDate = t
		}
	}

	if err := dao.DB.Create(rule).Error; err != nil {
		utils.Error(c, "创建分账规则失败: "+err.Error())
		return
	}

	utils.Success(c, rule)
}

func UpdateProfitShareRule(c *gin.Context) {
	id := c.Param("id")
	var req RuleUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var rule model.ProfitShareRule
	if err := dao.DB.First(&rule, id).Error; err != nil {
		utils.Error(c, "分账规则不存在")
		return
	}

	if req.DSLContent != nil {
		if err := ValidateDSL(req.DSLContent); err != nil {
			utils.Error(c, err.Error())
			return
		}
	}

	updates := make(map[string]interface{})
	if req.RuleName != "" {
		updates["rule_name"] = req.RuleName
	}
	if req.RuleType > 0 {
		updates["rule_type"] = req.RuleType
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.DSLContent != nil {
		updates["dsl_content"] = string(req.DSLContent)
	}
	if req.Priority >= 0 {
		updates["priority"] = req.Priority
	}
	if req.Status >= 0 {
		updates["status"] = req.Status
	}

	if err := dao.DB.Model(&rule).Updates(updates).Error; err != nil {
		utils.Error(c, "更新分账规则失败: "+err.Error())
		return
	}

	utils.Success(c, rule)
}

func GetProfitShareRule(c *gin.Context) {
	id := c.Param("id")

	var rule model.ProfitShareRule
	if err := dao.DB.First(&rule, id).Error; err != nil {
		utils.Error(c, "分账规则不存在")
		return
	}

	utils.Success(c, rule)
}

func ListProfitShareRules(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	ruleType := c.Query("rule_type")

	query := dao.DB.Model(&model.ProfitShareRule{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if ruleType != "" {
		query = query.Where("rule_type = ?", ruleType)
	}

	var total int64
	query.Count(&total)

	var rules []model.ProfitShareRule
	offset := (page - 1) * pageSize
	query.Order("priority DESC, id DESC").Offset(offset).Limit(pageSize).Find(&rules)

	utils.Page(c, rules, total, page, pageSize)
}

func DeleteProfitShareRule(c *gin.Context) {
	id := c.Param("id")

	if err := dao.DB.Delete(&model.ProfitShareRule{}, id).Error; err != nil {
		utils.Error(c, "删除分账规则失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

type BindRuleRequest struct {
	DramaID uint64 `json:"drama_id" binding:"required"`
	RuleID  uint64 `json:"rule_id" binding:"required"`
}

func BindRuleToDrama(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req BindRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	relation := &model.DramaRuleRelation{
		DramaID:   req.DramaID,
		RuleID:    req.RuleID,
		CreatedBy: userID.(uint64),
	}

	if err := dao.DB.Create(relation).Error; err != nil {
		utils.Error(c, "绑定规则失败: "+err.Error())
		return
	}

	utils.Success(c, relation)
}

func GetDramaRules(c *gin.Context) {
	dramaID := c.Param("drama_id")

	var relations []model.DramaRuleRelation
	dao.DB.Where("drama_id = ?", dramaID).Find(&relations)

	var ruleIDs []uint64
	for _, r := range relations {
		ruleIDs = append(ruleIDs, r.RuleID)
	}

	var rules []model.ProfitShareRule
	if len(ruleIDs) > 0 {
		dao.DB.Where("id IN ?", ruleIDs).Find(&rules)
	}

	utils.Success(c, rules)
}

func UnbindRuleFromDrama(c *gin.Context) {
	dramaID := c.Param("drama_id")
	ruleID := c.Param("rule_id")

	if err := dao.DB.Where("drama_id = ? AND rule_id = ?", dramaID, ruleID).Delete(&model.DramaRuleRelation{}).Error; err != nil {
		utils.Error(c, "解绑规则失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

func RegisterProfitShareRuleRoutes(r *gin.Engine) {
	ruleGroup := r.Group("/api/rules")
	ruleGroup.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		ruleGroup.POST("", CreateProfitShareRule)
		ruleGroup.PUT("/:id", UpdateProfitShareRule)
		ruleGroup.GET("/:id", GetProfitShareRule)
		ruleGroup.GET("", ListProfitShareRules)
		ruleGroup.DELETE("/:id", DeleteProfitShareRule)

		ruleGroup.POST("/bind", BindRuleToDrama)
		ruleGroup.GET("/drama/:drama_id", GetDramaRules)
		ruleGroup.DELETE("/drama/:drama_id/:rule_id", UnbindRuleFromDrama)
	}
}
