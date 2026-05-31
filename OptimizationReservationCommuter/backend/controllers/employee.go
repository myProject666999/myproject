package controllers

import (
	"shuttle-booking/database"
	"shuttle-booking/models"
	"shuttle-booking/utils"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var input struct {
		EmployeeNo string `json:"employee_no" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var employee models.Employee
	if err := database.DB.Where("employee_no = ? AND status = 1", input.EmployeeNo).First(&employee).Error; err != nil {
		utils.NotFound(c, "员工不存在或已离职")
		return
	}

	token, err := utils.GenerateToken(employee.ID, employee.EmployeeNo)
	if err != nil {
		utils.InternalError(c, "生成令牌失败")
		return
	}

	utils.Success(c, gin.H{
		"token":    token,
		"employee": employee,
	})
}

func GetEmployees(c *gin.Context) {
	department := c.Query("department")
	status := c.Query("status")

	var employees []models.Employee
	query := database.DB

	if department != "" {
		query = query.Where("department = ?", department)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&employees)
	utils.Success(c, employees)
}

func GetEmployee(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var employee models.Employee
	if err := database.DB.First(&employee, id).Error; err != nil {
		utils.NotFound(c, "员工不存在")
		return
	}
	utils.Success(c, employee)
}

func CreateEmployee(c *gin.Context) {
	var employee models.Employee
	if err := c.ShouldBindJSON(&employee); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	if err := database.DB.Create(&employee).Error; err != nil {
		utils.InternalError(c, "创建员工失败")
		return
	}
	utils.Success(c, employee)
}

func UpdateEmployee(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var employee models.Employee
	if err := database.DB.First(&employee, id).Error; err != nil {
		utils.NotFound(c, "员工不存在")
		return
	}
	if err := c.ShouldBindJSON(&employee); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	database.DB.Save(&employee)
	utils.Success(c, employee)
}

func GetShuttles(c *gin.Context) {
	status := c.Query("status")

	var shuttles []models.Shuttle
	query := database.DB

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Find(&shuttles)
	utils.Success(c, shuttles)
}

func GetShuttle(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var shuttle models.Shuttle
	if err := database.DB.First(&shuttle, id).Error; err != nil {
		utils.NotFound(c, "车辆不存在")
		return
	}
	utils.Success(c, shuttle)
}

func CreateShuttle(c *gin.Context) {
	var shuttle models.Shuttle
	if err := c.ShouldBindJSON(&shuttle); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	if err := database.DB.Create(&shuttle).Error; err != nil {
		utils.InternalError(c, "创建车辆失败")
		return
	}
	utils.Success(c, shuttle)
}

func UpdateShuttle(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	var shuttle models.Shuttle
	if err := database.DB.First(&shuttle, id).Error; err != nil {
		utils.NotFound(c, "车辆不存在")
		return
	}
	if err := c.ShouldBindJSON(&shuttle); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}
	database.DB.Save(&shuttle)
	utils.Success(c, shuttle)
}

func DeleteShuttle(c *gin.Context) {
	id := utils.ParseInt(c.Param("id"), 0)
	if err := database.DB.Delete(&models.Shuttle{}, id).Error; err != nil {
		utils.InternalError(c, "删除车辆失败")
		return
	}
	utils.Success(c, nil)
}
