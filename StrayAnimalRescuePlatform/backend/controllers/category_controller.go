package controllers

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func GetPetCategories(c *gin.Context) {
	var categories []models.PetCategory
	db := config.GetDB()
	db.Order("sort_order ASC").Find(&categories)
	utils.Success(c, gin.H{
		"total": len(categories),
		"list":  categories,
	})
}

func GetPetCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var category models.PetCategory
	db := config.GetDB()
	if err := db.First(&category, id).Error; err != nil {
		utils.NotFound(c, "分类不存在")
		return
	}
	utils.Success(c, category)
}

func CreatePetCategory(c *gin.Context) {
	var category models.PetCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&category).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, category)
}

func UpdatePetCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var category models.PetCategory
	db := config.GetDB()
	if err := db.First(&category, id).Error; err != nil {
		utils.NotFound(c, "分类不存在")
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&category)
	utils.Success(c, category)
}

func DeletePetCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.PetCategory{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetProductCategories(c *gin.Context) {
	var categories []models.ProductCategory
	db := config.GetDB()
	db.Order("sort_order ASC").Find(&categories)
	utils.Success(c, gin.H{
		"total": len(categories),
		"list":  categories,
	})
}

func GetProductCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var category models.ProductCategory
	db := config.GetDB()
	if err := db.First(&category, id).Error; err != nil {
		utils.NotFound(c, "分类不存在")
		return
	}
	utils.Success(c, category)
}

func CreateProductCategory(c *gin.Context) {
	var category models.ProductCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&category).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, category)
}

func UpdateProductCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var category models.ProductCategory
	db := config.GetDB()
	if err := db.First(&category, id).Error; err != nil {
		utils.NotFound(c, "分类不存在")
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&category)
	utils.Success(c, category)
}

func DeleteProductCategory(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.ProductCategory{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}
