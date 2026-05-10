package controllers

import (
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/models"
	"emergency-mutual-aid/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetRecruitments(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var recruitments []models.Recruitment
	query := database.DB.Model(&models.Recruitment{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR position LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&recruitments).Error; err != nil {
		utils.InternalServerError(c, "获取招募列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  recruitments,
	})
}

func GetRecruitment(c *gin.Context) {
	id := c.Param("id")

	var recruitment models.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		utils.NotFound(c, "招募信息不存在")
		return
	}

	utils.Success(c, recruitment)
}

func CreateRecruitment(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var recruitment models.Recruitment
	if err := c.ShouldBindJSON(&recruitment); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	recruitment.UserID = userID
	recruitment.UserName = username
	recruitment.Status = 1
	if recruitment.Deadline.IsZero() {
		recruitment.Deadline = time.Now().AddDate(0, 1, 0)
	}

	if err := database.DB.Create(&recruitment).Error; err != nil {
		utils.InternalServerError(c, "创建招募信息失败")
		return
	}

	utils.Success(c, recruitment)
}

func UpdateRecruitment(c *gin.Context) {
	id := c.Param("id")

	var recruitment models.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		utils.NotFound(c, "招募信息不存在")
		return
	}

	if err := c.ShouldBindJSON(&recruitment); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&recruitment).Error; err != nil {
		utils.InternalServerError(c, "更新招募信息失败")
		return
	}

	utils.Success(c, recruitment)
}

func DeleteRecruitment(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Recruitment{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除招募信息失败")
		return
	}

	utils.Success(c, nil)
}

func LikeRecruitment(c *gin.Context) {
	id := c.Param("id")

	var recruitment models.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		utils.NotFound(c, "招募信息不存在")
		return
	}

	recruitment.Likes++
	if err := database.DB.Save(&recruitment).Error; err != nil {
		utils.InternalServerError(c, "点赞失败")
		return
	}

	utils.Success(c, gin.H{"likes": recruitment.Likes})
}

func DislikeRecruitment(c *gin.Context) {
	id := c.Param("id")

	var recruitment models.Recruitment
	if err := database.DB.First(&recruitment, id).Error; err != nil {
		utils.NotFound(c, "招募信息不存在")
		return
	}

	recruitment.Dislikes++
	if err := database.DB.Save(&recruitment).Error; err != nil {
		utils.InternalServerError(c, "踩失败")
		return
	}

	utils.Success(c, gin.H{"dislikes": recruitment.Dislikes})
}

func ApplyRecruitment(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var req struct {
		RecruitmentID uint   `json:"recruitment_id" binding:"required"`
		Phone         string `json:"phone"`
		Experience    string `json:"experience"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var recruitment models.Recruitment
	if err := database.DB.First(&recruitment, req.RecruitmentID).Error; err != nil {
		utils.NotFound(c, "招募信息不存在")
		return
	}

	application := models.RecruitmentApplication{
		RecruitmentID:   req.RecruitmentID,
		RecruitmentTitle: recruitment.Title,
		UserID:         userID,
		UserName:       username,
		Phone:          req.Phone,
		Experience:     req.Experience,
		Status:         0,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		utils.InternalServerError(c, "报名失败")
		return
	}

	utils.SuccessWithMessage(c, "报名成功", application)
}

func GetRecruitmentApplications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var applications []models.RecruitmentApplication
	query := database.DB.Model(&models.RecruitmentApplication{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&applications).Error; err != nil {
		utils.InternalServerError(c, "获取报名列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  applications,
	})
}

func ApproveRecruitmentApplication(c *gin.Context) {
	adminID := c.GetUint("user_id")
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var application models.RecruitmentApplication
	if err := database.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "报名不存在")
		return
	}

	application.Status = req.Status
	application.ApprovedBy = adminID

	if err := database.DB.Save(&application).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	utils.Success(c, nil)
}
