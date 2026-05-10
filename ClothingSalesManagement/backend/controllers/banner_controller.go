package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type BannerController struct{}

func NewBannerController() *BannerController {
	return &BannerController{}
}

func (bc *BannerController) GetBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Where("status = 1").Order("sort_order ASC").Find(&banners)
	utils.Success(c, banners)
}

type CreateBannerRequest struct {
	Title     string `json:"title"`
	Image     string `json:"image" binding:"required"`
	Link      string `json:"link"`
	SortOrder int    `json:"sort_order"`
}

func (bc *BannerController) AdminGetBanners(c *gin.Context) {
	var banners []models.Banner
	database.DB.Order("sort_order ASC, id DESC").Find(&banners)
	utils.Success(c, banners)
}

func (bc *BannerController) CreateBanner(c *gin.Context) {
	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	banner := models.Banner{
		Title:     req.Title,
		Image:     req.Image,
		Link:      req.Link,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := database.DB.Create(&banner).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, banner)
}

func (bc *BannerController) UpdateBanner(c *gin.Context) {
	id := c.Param("id")

	var req CreateBannerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	updates := map[string]interface{}{
		"title":      req.Title,
		"link":       req.Link,
		"sort_order": req.SortOrder,
	}
	if req.Image != "" {
		updates["image"] = req.Image
	}

	if err := database.DB.Model(&models.Banner{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		utils.InternalError(c, "更新失败")
		return
	}

	var banner models.Banner
	database.DB.First(&banner, id)
	utils.Success(c, banner)
}

func (bc *BannerController) DeleteBanner(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Banner{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
