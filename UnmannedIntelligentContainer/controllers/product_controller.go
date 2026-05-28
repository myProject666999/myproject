package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	service *services.ProductService
}

func NewProductController() *ProductController {
	return &ProductController{
		service: services.NewProductService(),
	}
}

func (c *ProductController) GetList(ctx *gin.Context) {
	var query models.ProductQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	list, total, err := c.service.GetList(&query)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.SuccessWithPage(ctx, list, total, query.Page, query.PageSize)
}

func (c *ProductController) GetAll(ctx *gin.Context) {
	list, err := c.service.GetAll()
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}
	utils.Success(ctx, list)
}

func (c *ProductController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	product, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "product not found")
		return
	}

	utils.Success(ctx, product)
}

func (c *ProductController) Create(ctx *gin.Context) {
	var data models.ProductCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	product, err := c.service.Create(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, product)
}

func (c *ProductController) Update(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	var data models.ProductUpdate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	product, err := c.service.Update(id, &data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, product)
}

func (c *ProductController) Delete(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	if err := c.service.Delete(id); err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, nil)
}

func (c *ProductController) GetCategories(ctx *gin.Context) {
	categories, err := c.service.GetCategories()
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}
	utils.Success(ctx, categories)
}
