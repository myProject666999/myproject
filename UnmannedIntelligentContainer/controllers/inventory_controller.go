package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type InventoryController struct {
	service *services.InventoryService
}

func NewInventoryController() *InventoryController {
	return &InventoryController{
		service: services.NewInventoryService(),
	}
}

func (c *InventoryController) GetList(ctx *gin.Context) {
	var query models.InventoryQuery
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

func (c *InventoryController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	inventory, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "inventory not found")
		return
	}

	utils.Success(ctx, inventory)
}

func (c *InventoryController) Create(ctx *gin.Context) {
	var data models.InventoryCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	inventory, err := c.service.Create(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, inventory)
}

func (c *InventoryController) Update(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	var data models.InventoryUpdate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	inventory, err := c.service.Update(id, &data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, inventory)
}

func (c *InventoryController) Delete(ctx *gin.Context) {
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

func (c *InventoryController) GetLowStockItems(ctx *gin.Context) {
	area := ctx.Query("area")
	items, err := c.service.GetLowStockItems(area)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}
	utils.Success(ctx, items)
}
