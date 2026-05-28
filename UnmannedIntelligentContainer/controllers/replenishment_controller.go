package controllers

import (
	"unmanned-container/models"
	"unmanned-container/services"
	"unmanned-container/utils"

	"github.com/gin-gonic/gin"
)

type ReplenishmentController struct {
	service *services.ReplenishmentService
}

func NewReplenishmentController() *ReplenishmentController {
	return &ReplenishmentController{
		service: services.NewReplenishmentService(),
	}
}

func (c *ReplenishmentController) GetList(ctx *gin.Context) {
	var query models.ReplenishmentTaskQuery
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

func (c *ReplenishmentController) GetByID(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	task, err := c.service.GetByID(id)
	if err != nil {
		utils.NotFoundError(ctx, "task not found")
		return
	}

	utils.Success(ctx, task)
}

func (c *ReplenishmentController) GenerateTasks(ctx *gin.Context) {
	var req models.GenerateTaskRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	tasks, err := c.service.GenerateTasks(req.Area)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, tasks)
}

func (c *ReplenishmentController) DispatchTask(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	var data models.ReplenishmentTaskDispatch
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	task, err := c.service.DispatchTask(id, &data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, task)
}

func (c *ReplenishmentController) StartTask(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	task, err := c.service.StartTask(id)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, task)
}

func (c *ReplenishmentController) ExecuteTask(ctx *gin.Context) {
	var data models.ReplenishmentTaskExecute
	if err := ctx.ShouldBindJSON(&data); err != nil {
		utils.ParamError(ctx, err.Error())
		return
	}

	task, err := c.service.ExecuteTask(&data)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, task)
}

func (c *ReplenishmentController) CancelTask(ctx *gin.Context) {
	id := utils.ParseUint(ctx.Param("id"))
	if id == 0 {
		utils.ParamError(ctx, "invalid id")
		return
	}

	task, err := c.service.CancelTask(id)
	if err != nil {
		utils.ServerError(ctx, err.Error())
		return
	}

	utils.Success(ctx, task)
}
