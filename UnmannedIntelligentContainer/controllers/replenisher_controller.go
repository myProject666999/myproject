package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type ReplenisherController struct {
	service *services.ReplenisherService
}

func NewReplenisherController() *ReplenisherController {
	return &ReplenisherController{
		service: services.NewReplenisherService(),
	}
}

func (c *ReplenisherController) GetList(ctx *gin.Context) {
	var query models.ReplenisherQuery
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

func (c *ReplenisherController) GetAll(ctx *gin.Context) {
	list, err := c.service.GetAll()
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}
	utils.Success(ctx, list)
}

func (c *ReplenisherController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	replenisher, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "replenisher not found")
		return
	}

	utils.Success(ctx, replenisher)
}

func (c *ReplenisherController) Create(ctx *gin.Context) {
	var data models.ReplenisherCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	replenisher, err := c.service.Create(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, replenisher)
}

func (c *ReplenisherController) Update(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	var data models.ReplenisherUpdate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	replenisher, err := c.service.Update(id, &data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, replenisher)
}

func (c *ReplenisherController) Delete(ctx *gin.Context) {
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
