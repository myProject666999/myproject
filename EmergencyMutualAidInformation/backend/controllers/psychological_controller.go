package controllers

import (
	"emergency-mutual-aid/database"
	"emergency-mutual-aid/models"
	"emergency-mutual-aid/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPsychologicalKnowledge(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	category := c.Query("category")

	offset := (page - 1) * pageSize

	var knowledge []models.PsychologicalKnowledge
	query := database.DB.Model(&models.PsychologicalKnowledge{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ? OR summary LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&knowledge).Error; err != nil {
		utils.InternalServerError(c, "获取心理知识列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  knowledge,
	})
}

func GetPsychologicalKnowledgeDetail(c *gin.Context) {
	id := c.Param("id")

	var knowledge models.PsychologicalKnowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		utils.NotFound(c, "心理知识不存在")
		return
	}

	database.DB.Model(&knowledge).UpdateColumn("views", knowledge.Views+1)

	utils.Success(c, knowledge)
}

func CreatePsychologicalKnowledge(c *gin.Context) {
	userID := c.GetUint("user_id")
	username := c.GetString("username")

	var knowledge models.PsychologicalKnowledge
	if err := c.ShouldBindJSON(&knowledge); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	knowledge.AuthorID = userID
	knowledge.AuthorName = username
	knowledge.Status = 1

	if err := database.DB.Create(&knowledge).Error; err != nil {
		utils.InternalServerError(c, "创建心理知识失败")
		return
	}

	utils.Success(c, knowledge)
}

func UpdatePsychologicalKnowledge(c *gin.Context) {
	id := c.Param("id")

	var knowledge models.PsychologicalKnowledge
	if err := database.DB.First(&knowledge, id).Error; err != nil {
		utils.NotFound(c, "心理知识不存在")
		return
	}

	if err := c.ShouldBindJSON(&knowledge); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&knowledge).Error; err != nil {
		utils.InternalServerError(c, "更新心理知识失败")
		return
	}

	utils.Success(c, knowledge)
}

func DeletePsychologicalKnowledge(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.PsychologicalKnowledge{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除心理知识失败")
		return
	}

	utils.Success(c, nil)
}

func GetRumors(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var rumors []models.Rumor
	query := database.DB.Model(&models.Rumor{}).Where("status = ?", 1)

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&rumors).Error; err != nil {
		utils.InternalServerError(c, "获取辟谣列表失败")
		return
	}

	utils.Success(c, gin.H{
		"total": total,
		"page":  page,
		"list":  rumors,
	})
}

func GetRumor(c *gin.Context) {
	id := c.Param("id")

	var rumor models.Rumor
	if err := database.DB.First(&rumor, id).Error; err != nil {
		utils.NotFound(c, "辟谣信息不存在")
		return
	}

	utils.Success(c, rumor)
}

func CreateRumor(c *gin.Context) {
	var rumor models.Rumor
	if err := c.ShouldBindJSON(&rumor); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	rumor.Status = 1

	if err := database.DB.Create(&rumor).Error; err != nil {
		utils.InternalServerError(c, "创建辟谣信息失败")
		return
	}

	utils.Success(c, rumor)
}

func UpdateRumor(c *gin.Context) {
	id := c.Param("id")

	var rumor models.Rumor
	if err := database.DB.First(&rumor, id).Error; err != nil {
		utils.NotFound(c, "辟谣信息不存在")
		return
	}

	if err := c.ShouldBindJSON(&rumor); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if err := database.DB.Save(&rumor).Error; err != nil {
		utils.InternalServerError(c, "更新辟谣信息失败")
		return
	}

	utils.Success(c, rumor)
}

func DeleteRumor(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Rumor{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除辟谣信息失败")
		return
	}

	utils.Success(c, nil)
}
