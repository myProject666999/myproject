package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetPets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	categoryID := c.Query("category_id")
	keyword := c.Query("keyword")

	db := config.GetDB()
	query := db.Model(&models.Pet{}).Where("status = ? AND adopted = ?", 1, false)

	if categoryID != "" {
		query = query.Where("pet_category_id = ?", categoryID)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR breed LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int
	query.Count(&total)

	var pets []models.Pet
	query.Preload("PetCategory").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&pets)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      pets,
	})
}

func GetPet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var pet models.Pet
	db := config.GetDB()
	if err := db.Preload("PetCategory").First(&pet, id).Error; err != nil {
		utils.NotFound(c, "宠物不存在")
		return
	}
	utils.Success(c, pet)
}

func CreatePet(c *gin.Context) {
	var pet models.Pet
	if err := c.ShouldBindJSON(&pet); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&pet).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, pet)
}

func UpdatePet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var pet models.Pet
	db := config.GetDB()
	if err := db.First(&pet, id).Error; err != nil {
		utils.NotFound(c, "宠物不存在")
		return
	}

	if err := c.ShouldBindJSON(&pet); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&pet)
	utils.Success(c, pet)
}

func DeletePet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.Pet{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetAdoptions(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	db := config.GetDB()
	query := db.Model(&models.Adoption{}).Where("user_id = ?", userID)

	var total int
	query.Count(&total)

	var adoptions []models.Adoption
	query.Preload("Pet").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&adoptions)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      adoptions,
	})
}

func ApplyAdoption(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		PetID   uint   `json:"pet_id" binding:"required"`
		Name    string `json:"name" binding:"required"`
		Phone   string `json:"phone" binding:"required"`
		Address string `json:"address" binding:"required"`
		Reason  string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()

	var pet models.Pet
	if err := db.First(&pet, req.PetID).Error; err != nil {
		utils.NotFound(c, "宠物不存在")
		return
	}

	if pet.Adopted {
		utils.BadRequest(c, "该宠物已被领养")
		return
	}

	adoption := models.Adoption{
		PetID:   req.PetID,
		UserID:  userID,
		Name:    req.Name,
		Phone:   req.Phone,
		Address: req.Address,
		Reason:  req.Reason,
		Status:  "pending",
	}

	if err := db.Create(&adoption).Error; err != nil {
		utils.InternalServerError(c, "申请失败")
		return
	}

	utils.Success(c, adoption)
}
