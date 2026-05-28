package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type SaleController struct {
	service *services.SaleService
}

func NewSaleController() *SaleController {
	return &SaleController{
		service: services.NewSaleService(),
	}
}

func (c *SaleController) GetList(ctx *gin.Context) {
	var query models.SaleQuery
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

func (c *SaleController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	sale, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "sale not found")
		return
	}

	utils.Success(ctx, sale)
}

func (c *SaleController) Create(ctx *gin.Context) {
	var data models.SaleCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	sale, err := c.service.Create(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, sale)
}

func (c *SaleController) Refund(ctx *gin.Context) {
	var data models.SaleRefund
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	sale, err := c.service.Refund(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, sale)
}

func (c *SaleController) GetStatistics(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	stats, err := c.service.GetStatistics(startDate, endDate)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, stats)
}

func (c *SaleController) GetContainerStats(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	stats, err := c.service.GetContainerStats(startDate, endDate)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, stats)
}

func (c *SaleController) GetProductStats(ctx *gin.Context) {
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	stats, err := c.service.GetProductStats(startDate, endDate)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, stats)
}
