package controllers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

func parseDateStr(dateStr string) time.Time {
	layouts := []string{
		"2006-01-02",
		"2006-01-02 15:04:05",
		"2006/01/02",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, dateStr); err == nil {
			return t
		}
	}
	return time.Now()
}

func GetShops(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	db := config.GetDB()
	var total int
	db.Model(&models.Shop{}).Where("status = ?", 1).Count(&total)

	var shops []models.Shop
	db.Where("status = ?", 1).Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&shops)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      shops,
	})
}

func GetShop(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var shop models.Shop
	db := config.GetDB()
	if err := db.First(&shop, id).Error; err != nil {
		utils.NotFound(c, "商店不存在")
		return
	}
	utils.Success(c, shop)
}

func CreateShop(c *gin.Context) {
	var shop models.Shop
	if err := c.ShouldBindJSON(&shop); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db := config.GetDB()
	if err := db.Create(&shop).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}
	utils.Success(c, shop)
}

func UpdateShop(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var shop models.Shop
	db := config.GetDB()
	if err := db.First(&shop, id).Error; err != nil {
		utils.NotFound(c, "商店不存在")
		return
	}

	if err := c.ShouldBindJSON(&shop); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	db.Save(&shop)
	utils.Success(c, shop)
}

func DeleteShop(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	db := config.GetDB()
	if err := db.Delete(&models.Shop{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetBoardings(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	db := config.GetDB()
	query := db.Model(&models.Boarding{}).Where("user_id = ?", userID)

	var total int
	query.Count(&total)

	var boardings []models.Boarding
	query.Preload("Shop").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&boardings)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      boardings,
	})
}

func ApplyBoarding(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		ShopID      uint   `json:"shop_id" binding:"required"`
		PetName     string `json:"pet_name" binding:"required"`
		PetType     string `json:"pet_type" binding:"required"`
		PetAge      string `json:"pet_age"`
		StartDate   string `json:"start_date" binding:"required"`
		EndDate     string `json:"end_date" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	boarding := models.Boarding{
		ShopID:      req.ShopID,
		UserID:      userID,
		PetName:     req.PetName,
		PetType:     req.PetType,
		PetAge:      req.PetAge,
		StartDate:   parseDateStr(req.StartDate),
		EndDate:     parseDateStr(req.EndDate),
		Description: req.Description,
		Status:      "pending",
	}

	db := config.GetDB()
	if err := db.Create(&boarding).Error; err != nil {
		utils.InternalServerError(c, "申请失败")
		return
	}

	utils.Success(c, boarding)
}
