package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type ContainerController struct {
	service *services.ContainerService
}

func NewContainerController() *ContainerController {
	return &ContainerController{
		service: services.NewContainerService(),
	}
}

func (c *ContainerController) GetList(ctx *gin.Context) {
	var query models.ContainerQuery
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

func (c *ContainerController) GetAll(ctx *gin.Context) {
	list, err := c.service.GetAll()
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}
	utils.Success(ctx, list)
}

func (c *ContainerController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	container, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "container not found")
		return
	}

	utils.Success(ctx, container)
}

func (c *ContainerController) Create(ctx *gin.Context) {
	var data models.ContainerCreate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	container, err := c.service.Create(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, container)
}

func (c *ContainerController) Update(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	var data models.ContainerUpdate
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	container, err := c.service.Update(id, &data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, container)
}

func (c *ContainerController) Delete(ctx *gin.Context) {
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
