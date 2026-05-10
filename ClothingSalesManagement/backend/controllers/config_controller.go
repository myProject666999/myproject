package controllers

import (
	"clothingsales/database"
	"clothingsales/models"
	"clothingsales/utils"

	"github.com/gin-gonic/gin"
)

type ConfigController struct{}

func NewConfigController() *ConfigController {
	return &ConfigController{}
}

type ProductConfigRequest struct {
	ProductID uint `json:"product_id" binding:"required"`
	SortOrder int  `json:"sort_order"`
}

func (cc *ConfigController) GetHotProducts(c *gin.Context) {
	var hotProducts []models.HotProduct
	database.DB.Where("status = 1").Preload("Product").Order("sort_order ASC").Limit(10).Find(&hotProducts)

	products := make([]models.Product, 0)
	for _, hp := range hotProducts {
		products = append(products, hp.Product)
	}
	utils.Success(c, products)
}

func (cc *ConfigController) AdminGetHotProducts(c *gin.Context) {
	var hotProducts []models.HotProduct
	database.DB.Preload("Product").Order("sort_order ASC, id DESC").Find(&hotProducts)
	utils.Success(c, hotProducts)
}

func (cc *ConfigController) CreateHotProduct(c *gin.Context) {
	var req ProductConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	hotProduct := models.HotProduct{
		ProductID: req.ProductID,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := database.DB.Create(&hotProduct).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, hotProduct)
}

func (cc *ConfigController) DeleteHotProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.HotProduct{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func (cc *ConfigController) GetNewProducts(c *gin.Context) {
	var newProducts []models.NewProduct
	database.DB.Where("status = 1").Preload("Product").Order("sort_order ASC").Limit(10).Find(&newProducts)

	products := make([]models.Product, 0)
	for _, np := range newProducts {
		products = append(products, np.Product)
	}
	utils.Success(c, products)
}

func (cc *ConfigController) AdminGetNewProducts(c *gin.Context) {
	var newProducts []models.NewProduct
	database.DB.Preload("Product").Order("sort_order ASC, id DESC").Find(&newProducts)
	utils.Success(c, newProducts)
}

func (cc *ConfigController) CreateNewProduct(c *gin.Context) {
	var req ProductConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	newProduct := models.NewProduct{
		ProductID: req.ProductID,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := database.DB.Create(&newProduct).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, newProduct)
}

func (cc *ConfigController) DeleteNewProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.NewProduct{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func (cc *ConfigController) GetRecommendProducts(c *gin.Context) {
	var recommendProducts []models.RecommendProduct
	database.DB.Where("status = 1").Preload("Product").Order("sort_order ASC").Limit(10).Find(&recommendProducts)

	products := make([]models.Product, 0)
	for _, rp := range recommendProducts {
		products = append(products, rp.Product)
	}
	utils.Success(c, products)
}

func (cc *ConfigController) AdminGetRecommendProducts(c *gin.Context) {
	var recommendProducts []models.RecommendProduct
	database.DB.Preload("Product").Order("sort_order ASC, id DESC").Find(&recommendProducts)
	utils.Success(c, recommendProducts)
}

func (cc *ConfigController) CreateRecommendProduct(c *gin.Context) {
	var req ProductConfigRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	recommendProduct := models.RecommendProduct{
		ProductID: req.ProductID,
		SortOrder: req.SortOrder,
		Status:    1,
	}

	if err := database.DB.Create(&recommendProduct).Error; err != nil {
		utils.InternalError(c, "创建失败")
		return
	}

	utils.Success(c, recommendProduct)
}

func (cc *ConfigController) DeleteRecommendProduct(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.RecommendProduct{}, id).Error; err != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
