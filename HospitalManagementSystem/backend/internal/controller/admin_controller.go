package controller

import (
	"strconv"

	"hospital-management-system/internal/model"
	"hospital-management-system/internal/service"
	"hospital-management-system/pkg/response"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	adminService *service.AdminService
}

func NewAdminController() *AdminController {
	return &AdminController{
		adminService: service.NewAdminService(),
	}
}

func (ctrl *AdminController) GetUserList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	users, total, err := ctrl.adminService.GetUserList(page, pageSize, keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  users,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (ctrl *AdminController) CreateUser(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateUser(&user); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func (ctrl *AdminController) UpdateUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	user.ID = uint(id)
	if err := ctrl.adminService.UpdateUser(&user); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, user)
}

func (ctrl *AdminController) DeleteUser(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteUser(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetDepartmentList(c *gin.Context) {
	departments, err := ctrl.adminService.GetDepartmentList()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, departments)
}

func (ctrl *AdminController) CreateDepartment(c *gin.Context) {
	var department model.Department
	if err := c.ShouldBindJSON(&department); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateDepartment(&department); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, department)
}

func (ctrl *AdminController) UpdateDepartment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var department model.Department
	if err := c.ShouldBindJSON(&department); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	department.ID = uint(id)
	if err := ctrl.adminService.UpdateDepartment(&department); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, department)
}

func (ctrl *AdminController) DeleteDepartment(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteDepartment(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetRoleList(c *gin.Context) {
	roles, err := ctrl.adminService.GetRoleList()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, roles)
}

func (ctrl *AdminController) GetRegistrationLevelList(c *gin.Context) {
	levels, err := ctrl.adminService.GetRegistrationLevelList()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, levels)
}

func (ctrl *AdminController) CreateRegistrationLevel(c *gin.Context) {
	var level model.RegistrationLevel
	if err := c.ShouldBindJSON(&level); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateRegistrationLevel(&level); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, level)
}

func (ctrl *AdminController) UpdateRegistrationLevel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var level model.RegistrationLevel
	if err := c.ShouldBindJSON(&level); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	level.ID = uint(id)
	if err := ctrl.adminService.UpdateRegistrationLevel(&level); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, level)
}

func (ctrl *AdminController) DeleteRegistrationLevel(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteRegistrationLevel(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetSettlementCategoryList(c *gin.Context) {
	categories, err := ctrl.adminService.GetSettlementCategoryList()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, categories)
}

func (ctrl *AdminController) CreateSettlementCategory(c *gin.Context) {
	var category model.SettlementCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateSettlementCategory(&category); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, category)
}

func (ctrl *AdminController) UpdateSettlementCategory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var category model.SettlementCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	category.ID = uint(id)
	if err := ctrl.adminService.UpdateSettlementCategory(&category); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, category)
}

func (ctrl *AdminController) DeleteSettlementCategory(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteSettlementCategory(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetDiagnosisCatalogList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	items, total, err := ctrl.adminService.GetDiagnosisCatalogList(page, pageSize, keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  items,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (ctrl *AdminController) CreateDiagnosisCatalog(c *gin.Context) {
	var item model.DiagnosisCatalog
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateDiagnosisCatalog(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) UpdateDiagnosisCatalog(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var item model.DiagnosisCatalog
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	item.ID = uint(id)
	if err := ctrl.adminService.UpdateDiagnosisCatalog(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) DeleteDiagnosisCatalog(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteDiagnosisCatalog(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetChargeItemList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	items, total, err := ctrl.adminService.GetChargeItemList(page, pageSize, keyword)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  items,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (ctrl *AdminController) CreateChargeItem(c *gin.Context) {
	var item model.ChargeItem
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateChargeItem(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) UpdateChargeItem(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var item model.ChargeItem
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	item.ID = uint(id)
	if err := ctrl.adminService.UpdateChargeItem(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) DeleteChargeItem(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteChargeItem(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetMedicineList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	mType, _ := strconv.Atoi(c.DefaultQuery("type", "0"))

	items, total, err := ctrl.adminService.GetMedicineList(page, pageSize, keyword, mType)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  items,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (ctrl *AdminController) CreateMedicine(c *gin.Context) {
	var item model.Medicine
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateMedicine(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) UpdateMedicine(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var item model.Medicine
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	item.ID = uint(id)
	if err := ctrl.adminService.UpdateMedicine(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) DeleteMedicine(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteMedicine(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetExpenseSubjectList(c *gin.Context) {
	items, err := ctrl.adminService.GetExpenseSubjectList()
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}
	response.Success(c, items)
}

func (ctrl *AdminController) CreateExpenseSubject(c *gin.Context) {
	var item model.ExpenseSubject
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateExpenseSubject(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) UpdateExpenseSubject(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var item model.ExpenseSubject
	if err := c.ShouldBindJSON(&item); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	item.ID = uint(id)
	if err := ctrl.adminService.UpdateExpenseSubject(&item); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, item)
}

func (ctrl *AdminController) DeleteExpenseSubject(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteExpenseSubject(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}

func (ctrl *AdminController) GetDoctorScheduleList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	doctorID, _ := strconv.ParseUint(c.Query("doctor_id"), 10, 32)
	date := c.Query("date")

	schedules, total, err := ctrl.adminService.GetDoctorScheduleList(page, pageSize, uint(doctorID), date)
	if err != nil {
		response.InternalServerError(c, err.Error())
		return
	}

	response.Success(c, gin.H{
		"list":  schedules,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func (ctrl *AdminController) CreateDoctorSchedule(c *gin.Context) {
	var schedule model.DoctorSchedule
	if err := c.ShouldBindJSON(&schedule); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	if err := ctrl.adminService.CreateDoctorSchedule(&schedule); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, schedule)
}

func (ctrl *AdminController) UpdateDoctorSchedule(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var schedule model.DoctorSchedule
	if err := c.ShouldBindJSON(&schedule); err != nil {
		response.BadRequest(c, "参数错误")
		return
	}

	schedule.ID = uint(id)
	if err := ctrl.adminService.UpdateDoctorSchedule(&schedule); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, schedule)
}

func (ctrl *AdminController) DeleteDoctorSchedule(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if err := ctrl.adminService.DeleteDoctorSchedule(uint(id)); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	response.Success(c, nil)
}
