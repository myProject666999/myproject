package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetDispatchTaskList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	statusStr := c.Query("status")

	var status *int
	if statusStr != "" {
		s, _ := strconv.Atoi(statusStr)
		status = &s
	}

	list, total, err := dao.GetDispatchTaskList(status, page, pageSize)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, page, pageSize))
}

func GetDispatchTaskDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	vo, err := dao.GetDispatchTaskByID(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	if vo == nil {
		response.Error(c, "调度任务不存在")
		return
	}

	response.Success(c, vo)
}

func CreateDispatchTask(c *gin.Context) {
	var req model.DispatchTaskCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	task, err := dao.CreateDispatchTask(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, task)
}

func AssignDispatchTask(c *gin.Context) {
	var req model.DispatchTaskAssignReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	err := dao.AssignDispatchTask(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func StartDispatchTask(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)

	err := dao.StartDispatchTask(id)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func CompleteDispatchTask(c *gin.Context) {
	var req model.DispatchTaskExecuteReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	err := dao.CompleteDispatchTask(req.TaskID, req.BatteryIDs)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func GetDispatchGaps(c *gin.Context) {
	gaps, err := dao.CalculateGaps()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, gaps)
}

func GenerateDispatchPlan(c *gin.Context) {
	var req model.DispatchPlanReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	plan, err := dao.GenerateDispatchPlan(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, plan)
}

func AutoCreateDispatchTasks(c *gin.Context) {
	err := dao.AutoCreateDispatchTasks()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, nil)
}

func GetOperatorList(c *gin.Context) {
	list, err := dao.GetOperatorList()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}
