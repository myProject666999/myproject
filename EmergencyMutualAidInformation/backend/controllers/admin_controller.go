package controllers

import (
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/models"
	"emergency-mutual-aid/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var user models.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		utils.NotFound(c, "用户不存在")
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		utils.BadRequest(c, "原密码错误")
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		utils.InternalServerError(c, "密码加密失败")
		return
	}

	user.Password = string(hashedPassword)
	if err := database.DB.Save(&user).Error; err != nil {
		utils.InternalServerError(c, "修改密码失败")
		return
	}

	utils.SuccessWithMessage(c, "密码修改成功", nil)
}

func GetVolunteers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var volunteers []models.Volunteer
	query := database.DB.Model(&models.Volunteer{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR skills LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&volunteers).Error; err != nil {
		utils.InternalServerError(c, "获取志愿者列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  volunteers,
	})
}

func GetVolunteer(c *gin.Context) {
	id := c.Param("id")

	var volunteer models.Volunteer
	if err := database.DB.First(&volunteer, id).Error; err != nil {
		utils.NotFound(c, "志愿者不存在")
		return
	}

	utils.Success(c, volunteer)
}

func CreateVolunteer(c *gin.Context) {
	var volunteer models.Volunteer
	if err := c.ShouldBindJSON(&volunteer); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	volunteer.Status = 1

	if err := database.DB.Create(&volunteer).Error; err != nil {
		utils.InternalServerError(c, "创建志愿者失败")
		return
	}

	utils.Success(c, volunteer)
}

func UpdateVolunteer(c *gin.Context) {
	id := c.Param("id")

	var volunteer models.Volunteer
	if err := database.DB.First(&volunteer, id).Error; err != nil {
		utils.NotFound(c, "志愿者不存在")
		return
	}

	if err := c.ShouldBindJSON(&volunteer); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&volunteer).Error; err != nil {
		utils.InternalServerError(c, "更新志愿者失败")
		return
	}

	utils.Success(c, volunteer)
}

func DeleteVolunteer(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Volunteer{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除志愿者失败")
		return
	}

	utils.Success(c, nil)
}

func GetHelpRequests(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var requests []models.HelpRequest
	query := database.DB.Model(&models.HelpRequest{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&requests).Error; err != nil {
		utils.InternalServerError(c, "获取求助信列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  requests,
	})
}

func ApproveHelpRequest(c *gin.Context) {
	adminID := c.GetUint("user_id")
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var request models.HelpRequest
	if err := database.DB.First(&request, id).Error; err != nil {
		utils.NotFound(c, "求助信不存在")
		return
	}

	request.Status = req.Status
	request.ApprovedBy = adminID
	request.ApprovedAt = time.Now()

	if err := database.DB.Save(&request).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	utils.Success(c, nil)
}

func GetHelpRequestStats(c *gin.Context) {
	var total int64
	database.DB.Model(&models.HelpRequest{}).Count(&total)

	var pending int64
	database.DB.Model(&models.HelpRequest{}).Where("status = ?", 0).Count(&pending)

	var approved int64
	database.DB.Model(&models.HelpRequest{}).Where("status = ?", 1).Count(&approved)

	var rejected int64
	database.DB.Model(&models.HelpRequest{}).Where("status = ?", 2).Count(&rejected)

	utils.Success(c, gin.H{
		"total":    total,
		"pending":  pending,
		"approved": approved,
		"rejected": rejected,
	})
}

func GetMedicalAids(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var aids []models.MedicalAid
	query := database.DB.Model(&models.MedicalAid{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&aids).Error; err != nil {
		utils.InternalServerError(c, "获取医疗救助列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  aids,
	})
}

func GetMedicalAid(c *gin.Context) {
	id := c.Param("id")

	var aid models.MedicalAid
	if err := database.DB.First(&aid, id).Error; err != nil {
		utils.NotFound(c, "医疗救助不存在")
		return
	}

	utils.Success(c, aid)
}

func ApproveMedicalAid(c *gin.Context) {
	adminID := c.GetUint("user_id")
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var aid models.MedicalAid
	if err := database.DB.First(&aid, id).Error; err != nil {
		utils.NotFound(c, "医疗救助不存在")
		return
	}

	aid.Status = req.Status
	aid.ApprovedBy = adminID
	aid.ApprovedAt = time.Now()

	if err := database.DB.Save(&aid).Error; err != nil {
		utils.InternalServerError(c, "审核失败")
		return
	}

	utils.Success(c, nil)
}

func DeleteMedicalAid(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.MedicalAid{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除医疗救助失败")
		return
	}

	utils.Success(c, nil)
}

func AllocateMaterial(c *gin.Context) {
	var req struct {
		MaterialID uint `json:"material_id" binding:"required"`
		Quantity   int  `json:"quantity" binding:"required"`
		TargetID   uint `json:"target_id"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var material models.Material
	if err := database.DB.First(&material, req.MaterialID).Error; err != nil {
		utils.NotFound(c, "物资不存在")
		return
	}

	if material.Quantity < req.Quantity {
		utils.BadRequest(c, "物资不足")
		return
	}

	material.Quantity -= req.Quantity
	if err := database.DB.Save(&material).Error; err != nil {
		utils.InternalServerError(c, "分配失败")
		return
	}

	utils.SuccessWithMessage(c, "分配成功", nil)
}

func GetDashboardStats(c *gin.Context) {
	var userCount int64
	database.DB.Model(&models.User{}).Count(&userCount)

	var noticeCount int64
	database.DB.Model(&models.EmergencyNotice{}).Count(&noticeCount)

	var materialCount int64
	database.DB.Model(&models.Material{}).Count(&materialCount)

	var recruitmentCount int64
	database.DB.Model(&models.Recruitment{}).Count(&recruitmentCount)

	var pendingApplications int64
	database.DB.Model(&models.Application{}).Where("status = ?", 0).Count(&pendingApplications)

	var pendingRecruitments int64
	database.DB.Model(&models.RecruitmentApplication{}).Where("status = ?", 0).Count(&pendingRecruitments)

	utils.Success(c, gin.H{
		"user_count":           userCount,
		"notice_count":         noticeCount,
		"material_count":       materialCount,
		"recruitment_count":    recruitmentCount,
		"pending_applications": pendingApplications,
		"pending_recruitments": pendingRecruitments,
	})
}
