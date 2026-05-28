package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type StockCheckController struct {
	service *services.StockCheckService
}

func NewStockCheckController() *StockCheckController {
	return &StockCheckController{
		service: services.NewStockCheckService(),
	}
}

func (c *StockCheckController) GetCheckList(ctx *gin.Context) {
	var query models.StockCheckQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	list, total, err := c.service.GetCheckList(&query)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.SuccessWithPage(ctx, list, total, query.Page, query.PageSize)
}

func (c *StockCheckController) GetCheckByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	check, err := c.service.GetCheckByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "check not found")
		return
	}

	utils.Success(ctx, check)
}

func (c *StockCheckController) CreateCheck(ctx *gin.Context) {
	var data models.StockCheckCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	check, err := c.service.CreateCheck(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, check)
}

func (c *StockCheckController) ProcessCheck(ctx *gin.Context) {
	var data models.StockCheckProcess
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	check, err := c.service.ProcessCheck(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, check)
}

func (c *StockCheckController) GetDamageList(ctx *gin.Context) {
	var query models.DamageRecordQuery
	if err := ctx.ShouldBindQuery(&query); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	list, total, err := c.service.GetDamageList(&query)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.SuccessWithPage(ctx, list, total, query.Page, query.PageSize)
}

func (c *StockCheckController) CreateDamageRecord(ctx *gin.Context) {
	var data models.DamageRecordCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	record, err := c.service.CreateDamageRecord(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, record)
}
