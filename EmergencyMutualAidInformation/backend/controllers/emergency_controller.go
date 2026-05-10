package controllers

import (
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/models"
	"emergency-mutual-aid/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetEmergencyNotices(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	level := c.Query("level")

	offset := (page - 1) * pageSize

	var notices []models.EmergencyNotice
	query := database.DB.Model(&models.EmergencyNotice{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR summary LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if level != "" {
		query = query.Where("level = ?", level)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&notices).Error; err != nil {
		utils.InternalServerError(c, "获取紧急通知列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  notices,
	})
}

func GetEmergencyNotice(c *gin.Context) {
	id := c.Param("id")

	var notice models.EmergencyNotice
	if err := database.DB.First(&notice, id).Error; err != nil {
		utils.NotFound(c, "通知不存在")
		return
	}

	database.DB.Model(&notice).UpdateColumn("views", notice.Views+1)

	utils.Success(c, notice)
}

func CreateEmergencyNotice(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var notice models.EmergencyNotice
	if err := c.ShouldBindJSON(&notice); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	notice.AuthorID = userID
	notice.AuthorName = username
	notice.Status = 1

	if err := database.DB.Create(&notice).Error; err != nil {
		utils.InternalServerError(c, "创建紧急通知失败")
		return
	}

	utils.Success(c, notice)
}

func UpdateEmergencyNotice(c *gin.Context) {
	id := c.Param("id")

	var notice models.EmergencyNotice
	if err := database.DB.First(&notice, id).Error; err != nil {
		utils.NotFound(c, "通知不存在")
		return
	}

	if err := c.ShouldBindJSON(&notice); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&notice).Error; err != nil {
		utils.InternalServerError(c, "更新紧急通知失败")
		return
	}

	utils.Success(c, notice)
}

func DeleteEmergencyNotice(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.EmergencyNotice{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除紧急通知失败")
		return
	}

	utils.Success(c, nil)
}

func GetMaterials(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")

	offset := (page - 1) * pageSize

	var materials []models.Material
	query := database.DB.Model(&models.Material{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&materials).Error; err != nil {
		utils.InternalServerError(c, "获取物资列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  materials,
	})
}

func GetMaterial(c *gin.Context) {
	id := c.Param("id")

	var material models.Material
	if err := database.DB.First(&material, id).Error; err != nil {
		utils.NotFound(c, "物资不存在")
		return
	}

	utils.Success(c, material)
}

func CreateMaterial(c *gin.Context) {
	var material models.Material
	if err := c.ShouldBindJSON(&material); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	material.Status = 1

	if err := database.DB.Create(&material).Error; err != nil {
		utils.InternalServerError(c, "创建物资失败")
		return
	}

	utils.Success(c, material)
}

func UpdateMaterial(c *gin.Context) {
	id := c.Param("id")

	var material models.Material
	if err := database.DB.First(&material, id).Error; err != nil {
		utils.NotFound(c, "物资不存在")
		return
	}

	if err := c.ShouldBindJSON(&material); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&material).Error; err != nil {
		utils.InternalServerError(c, "更新物资失败")
		return
	}

	utils.Success(c, material)
}

func DeleteMaterial(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Material{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除物资失败")
		return
	}

	utils.Success(c, nil)
}

func ApplyMaterial(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var req struct {
		MaterialID uint   `json:"material_id" binding:"required"`
		Quantity   int    `json:"quantity" binding:"required"`
		Reason     string `json:"reason"`
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

	application := models.Application{
		MaterialID:   req.MaterialID,
		MaterialName: material.Name,
		UserID:       userID,
		UserName:     username,
		Quantity:     req.Quantity,
		Reason:       req.Reason,
		Status:       0,
	}

	if err := database.DB.Create(&application).Error; err != nil {
		utils.InternalServerError(c, "申请失败")
		return
	}

	utils.SuccessWithMessage(c, "申请成功", application)
}

func GetApplications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")

	offset := (page - 1) * pageSize

	var applications []models.Application
	query := database.DB.Model(&models.Application{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&applications).Error; err != nil {
		utils.InternalServerError(c, "获取申请列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  applications,
	})
}

func ApproveApplication(c *gin.Context) {
	adminID := c.GetUint("user_id")
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	var application models.Application
	if err := database.DB.First(&application, id).Error; err != nil {
		utils.NotFound(c, "申请不存在")
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
