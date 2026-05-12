package controllers

import (
	"net/http"
	"time"

	"moonsister/config"
	"moonsister/models"
	"moonsister/utils"

	"github.com/gin-gonic/gin"
)

func CheckIn(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID  uint   `json:"order_id" binding:"required"`
		Location string `json:"location"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var nanny models.Nanny
	if err := config.DB.Where("user_id = ?", userID).First(&nanny).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "月嫂信息不存在")
		return
	}

	today := time.Now().Format("2006-01-02")
	now := time.Now()

	var attendance models.Attendance
	config.DB.Where("order_id = ? AND DATE(date) = ?", req.OrderID, today).First(&attendance)

	if attendance.ID == 0 {
		attendance = models.Attendance{
			OrderID:  req.OrderID,
			NannyID:  nanny.ID,
			Date:     now,
			CheckIn:  &now,
			Location: req.Location,
			Status:   "checked_in",
		}
		config.DB.Create(&attendance)
	} else {
		if attendance.CheckIn != nil {
			utils.Error(c, http.StatusBadRequest, "今日已打卡")
			return
		}
		attendance.CheckIn = &now
		attendance.Status = "checked_in"
		config.DB.Save(&attendance)
	}

	utils.Success(c, attendance)
}

func CheckOut(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID uint `json:"order_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var nanny models.Nanny
	if err := config.DB.Where("user_id = ?", userID).First(&nanny).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "月嫂信息不存在")
		return
	}

	today := time.Now().Format("2006-01-02")
	var attendance models.Attendance
	if err := config.DB.Where("order_id = ? AND DATE(date) = ?", req.OrderID, today).First(&attendance).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "请先签到")
		return
	}

	now := time.Now()
	attendance.CheckOut = &now
	attendance.Status = "checked_out"
	config.DB.Save(&attendance)

	utils.Success(c, attendance)
}

func GetAttendanceList(c *gin.Context) {
	orderID := c.Query("order_id")

	var attendances []models.Attendance
	query := config.DB.Order("date desc")

	if orderID != "" {
		query = query.Where("order_id = ?", orderID)
	}

	query.Find(&attendances)
	utils.Success(c, attendances)
}

func CreateDailyRecord(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID    uint   `json:"order_id" binding:"required"`
		BabyCare   string `json:"baby_care"`
		MotherCare string `json:"mother_care"`
		Housework  string `json:"housework"`
		Meals      string `json:"meals"`
		Notes      string `json:"notes"`
		Photos     string `json:"photos"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var nanny models.Nanny
	if err := config.DB.Where("user_id = ?", userID).First(&nanny).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "月嫂信息不存在")
		return
	}

	record := models.DailyRecord{
		OrderID:    req.OrderID,
		NannyID:    nanny.ID,
		Date:       time.Now(),
		BabyCare:   req.BabyCare,
		MotherCare: req.MotherCare,
		Housework:  req.Housework,
		Meals:      req.Meals,
		Notes:      req.Notes,
		Photos:     req.Photos,
	}

	config.DB.Create(&record)
	utils.Success(c, record)
}

func GetDailyRecords(c *gin.Context) {
	orderID := c.Query("order_id")

	var records []models.DailyRecord
	query := config.DB.Order("date desc")

	if orderID != "" {
		query = query.Where("order_id = ?", orderID)
	}

	query.Find(&records)
	utils.Success(c, records)
}

func ReviewDailyRecord(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Review string `json:"review" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	config.DB.Model(&models.DailyRecord{}).Where("id = ?", id).Update("customer_review", req.Review)
	utils.Success(c, gin.H{"message": "评价成功"})
}

func CreateReview(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID     uint   `json:"order_id" binding:"required"`
		NannyID     uint   `json:"nanny_id" binding:"required"`
		Rating      int    `json:"rating" binding:"required"`
		Content     string `json:"content"`
		Photos      string `json:"photos"`
		Tags        string `json:"tags"`
		IsAnonymous bool   `json:"is_anonymous"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var customer models.Customer
	if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "客户信息不存在")
		return
	}

	review := models.Review{
		OrderID:     req.OrderID,
		CustomerID:  customer.ID,
		NannyID:     req.NannyID,
		Rating:      req.Rating,
		Content:     req.Content,
		Photos:      req.Photos,
		Tags:        req.Tags,
		IsAnonymous: req.IsAnonymous,
	}

	config.DB.Create(&review)

	var reviews []models.Review
	config.DB.Where("nanny_id = ?", req.NannyID).Find(&reviews)
	if len(reviews) > 0 {
		var total int
		for _, r := range reviews {
			total += r.Rating
		}
		avgRating := float64(total) / float64(len(reviews))
		config.DB.Model(&models.Nanny{}).Where("id = ?", req.NannyID).Update("rating", avgRating)
	}

	utils.Success(c, review)
}

func GetReviews(c *gin.Context) {
	nannyID := c.Query("nanny_id")
	orderID := c.Query("order_id")

	var reviews []models.Review
	query := config.DB.Order("created_at desc")

	if nannyID != "" {
		query = query.Where("nanny_id = ?", nannyID)
	}
	if orderID != "" {
		query = query.Where("order_id = ?", orderID)
	}

	query.Find(&reviews)
	utils.Success(c, reviews)
}

func CreateDispute(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OrderID     uint   `json:"order_id" binding:"required"`
		Type        string `json:"type" binding:"required"`
		Title       string `json:"title" binding:"required"`
		Description string `json:"description" binding:"required"`
		Evidence    string `json:"evidence"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var customer models.Customer
	if err := config.DB.Where("user_id = ?", userID).First(&customer).Error; err != nil {
		utils.Error(c, http.StatusBadRequest, "客户信息不存在")
		return
	}

	dispute := models.Dispute{
		OrderID:     req.OrderID,
		CustomerID:  customer.ID,
		Type:        req.Type,
		Title:       req.Title,
		Description: req.Description,
		Evidence:    req.Evidence,
		Status:      "pending",
	}

	config.DB.Create(&dispute)
	utils.Success(c, dispute)
}

func GetDisputes(c *gin.Context) {
	status := c.Query("status")

	var disputes []models.Dispute
	query := config.DB.Order("created_at desc")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&disputes)
	utils.Success(c, disputes)
}

func HandleDispute(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		HandlerID    uint   `json:"handler_id"`
		HandleResult string `json:"handle_result" binding:"required"`
		Status       string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	now := time.Now()
	config.DB.Model(&models.Dispute{}).Where("id = ?", id).Updates(map[string]interface{}{
		"handler_id":    req.HandlerID,
		"handle_result": req.HandleResult,
		"status":        req.Status,
		"handle_at":     &now,
	})

	utils.Success(c, gin.H{"message": "处理成功"})
}
