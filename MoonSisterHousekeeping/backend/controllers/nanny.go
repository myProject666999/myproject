package controllers

import (
	"net/http"
	"strconv"

	"moonsister/config"
	"moonsister/models"
	"moonsister/utils"

	"github.com/gin-gonic/gin"
)

func GetNannies(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	level := c.Query("level")
	status := c.Query("status")
	keyword := c.Query("keyword")

	var nannies []models.Nanny
	var total int64

	query := config.DB.Model(&models.Nanny{}).Preload("Skills")

	if level != "" {
		query = query.Where("level = ?", level)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("description LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Find(&nannies)

	utils.Page(c, nannies, total)
}

func GetNannyDetail(c *gin.Context) {
	id := c.Param("id")

	var nanny models.Nanny
	if err := config.DB.Preload("Skills").First(&nanny, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "月嫂不存在")
		return
	}

	utils.Success(c, nanny)
}

func CreateNanny(c *gin.Context) {
	var nanny models.Nanny
	if err := c.ShouldBindJSON(&nanny); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	nanny.Status = "available"
	if err := config.DB.Create(&nanny).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "创建失败")
		return
	}

	utils.Success(c, nanny)
}

func UpdateNanny(c *gin.Context) {
	id := c.Param("id")

	var nanny models.Nanny
	if err := config.DB.First(&nanny, id).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "月嫂不存在")
		return
	}

	if err := c.ShouldBindJSON(&nanny); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	config.DB.Save(&nanny)
	utils.Success(c, nanny)
}

func DeleteNanny(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Nanny{}, id).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "删除失败")
		return
	}

	utils.Success(c, gin.H{"message": "删除成功"})
}

func GetSkillTags(c *gin.Context) {
	var tags []models.SkillTag
	config.DB.Find(&tags)
	utils.Success(c, tags)
}

func CreateSkillTag(c *gin.Context) {
	var tag models.SkillTag
	if err := c.ShouldBindJSON(&tag); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	if err := config.DB.Create(&tag).Error; err != nil {
		utils.Error(c, http.StatusInternalServerError, "创建失败")
		return
	}

	utils.Success(c, tag)
}

func AddNannySkill(c *gin.Context) {
	nannyID := c.Param("id")
	var req struct {
		SkillIDs []uint `json:"skill_ids"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "参数错误")
		return
	}

	var nanny models.Nanny
	if err := config.DB.Preload("Skills").First(&nanny, nannyID).Error; err != nil {
		utils.Error(c, http.StatusNotFound, "月嫂不存在")
		return
	}

	var skills []models.SkillTag
	config.DB.Find(&skills, req.SkillIDs)
	config.DB.Model(&nanny).Association("Skills").Replace(skills)

	utils.Success(c, gin.H{"message": "技能添加成功"})
}
