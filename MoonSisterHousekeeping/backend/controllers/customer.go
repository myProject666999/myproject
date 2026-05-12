package controllers

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"moonsister/config"
	"moonsister/models"
	"moonsister/utils"

	"github.com/gin-gonic/gin"
)

func CreateDemand(c *gin.Context) {
	userID := c.GetUint("user_id")

	var customer models.Customer
	if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "请先完善客户信息")
		return
	}

	var req struct {
		ServiceType  string  `json:"service_type" binding:"required"`
		StartDate    string  `json:"start_date" binding:"required"`
		EndDate      string  `json:"end_date" binding:"required"`
		Budget       float64 `json:"budget"`
		Requirements string  `json:"requirements"`
		SpecialNeeds string  `json:"special_needs"`
		SkillIDs     string  `json:"skill_ids"`
		Address      string  `json:"address"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	demand := models.Demand{
		CustomerID:   customer.ID,
		ServiceType:  req.ServiceType,
		StartDate:    startDate,
		EndDate:      endDate,
		Budget:       req.Budget,
		Requirements: req.Requirements,
		SpecialNeeds: req.SpecialNeeds,
		SkillIDs:     req.SkillIDs,
		Status:       "pending",
	}

	config.DB.Create(&demand)
	utils.Success(c, demand)
}

func GetDemands(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	var demands []models.Demand
	var total int64

	query := config.DB.Model(&models.Demand{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at desc").Find(&demands)

	utils.Page(c, demands, total)
}

func GetMyDemands(c *gin.Context) {
	userID := c.GetUint("user_id")

	var customer models.Customer
	if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
		utils.Success(c, []interface{}{})
		return
	}

	var demands []models.Demand
	config.DB.Where("customer_id = ?", customer.ID).Order("created_at desc").Find(&demands)

	utils.Success(c, demands)
}

func RecommendNannies(c *gin.Context) {
	demandID := c.Param("id")

	var demand models.Demand
	if err := config.DB.First(&demand, demandID).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "需求不存在")
		return
	}

	var nannies []models.Nanny
	query := config.DB.Preload("Skills").Where("status = ?", "available")

	if demand.SkillIDs != "" {
		skillIDs := strings.Split(demand.SkillIDs, ",")
		query = query.Joins("JOIN nanny_skills ON nannies.id = nanny_skills.nanny_id").
			Where("nanny_skills.skill_tag_id IN ?", skillIDs)
	}

	query.Order("rating desc, experience desc").Limit(10).Find(&nannies)

	for i := range nannies {
		score := calculateScore(nannies[i], demand)
		nannies[i].Rating = score
	}

	utils.Success(c, nannies)
}

func calculateScore(nanny models.Nanny, demand models.Demand) float64 {
	score := 5.0

	if demand.Budget > 0 {
		score += 0.5
	}

	levelScore := map[string]float64{"高级": 2, "中级": 1.5, "初级": 1}
	score += levelScore[nanny.Level]

	score += float64(nanny.Experience) * 0.1

	return score
}

func UpdateDemandStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	config.DB.Model(&models.Demand{}).Where("id = ?", id).Update("status", req.Status)
	utils.Success(c, gin.H{"message": "状态更新成功"})
}
