package api

import (
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

type StakeholderCreateRequest struct {
	TypeCode      string `json:"type_code" binding:"required"`
	Name          string `json:"name" binding:"required"`
	ContactPerson string `json:"contact_person"`
	ContactPhone  string `json:"contact_phone"`
	BankAccount   string `json:"bank_account"`
	BankName      string `json:"bank_name"`
	IDCard        string `json:"id_card"`
}

type StakeholderUpdateRequest struct {
	TypeCode      string `json:"type_code"`
	Name          string `json:"name"`
	ContactPerson string `json:"contact_person"`
	ContactPhone  string `json:"contact_phone"`
	BankAccount   string `json:"bank_account"`
	BankName      string `json:"bank_name"`
	IDCard        string `json:"id_card"`
	Status        int8   `json:"status"`
}

func CreateStakeholder(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req StakeholderCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	stakeholder := &model.Stakeholder{
		StakeholderNo: utils.GenerateNo("SH"),
		TypeCode:      req.TypeCode,
		Name:          req.Name,
		ContactPerson: req.ContactPerson,
		ContactPhone:  req.ContactPhone,
		BankAccount:   req.BankAccount,
		BankName:      req.BankName,
		IDCard:        req.IDCard,
		Status:        1,
		CreatedBy:     userID.(uint64),
	}

	if err := dao.DB.Create(stakeholder).Error; err != nil {
		utils.Error(c, "创建权益方失败: "+err.Error())
		return
	}

	utils.Success(c, stakeholder)
}

func UpdateStakeholder(c *gin.Context) {
	id := c.Param("id")
	var req StakeholderUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var stakeholder model.Stakeholder
	if err := dao.DB.First(&stakeholder, id).Error; err != nil {
		utils.Error(c, "权益方不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.TypeCode != "" {
		updates["type_code"] = req.TypeCode
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.ContactPerson != "" {
		updates["contact_person"] = req.ContactPerson
	}
	if req.ContactPhone != "" {
		updates["contact_phone"] = req.ContactPhone
	}
	if req.BankAccount != "" {
		updates["bank_account"] = req.BankAccount
	}
	if req.BankName != "" {
		updates["bank_name"] = req.BankName
	}
	if req.IDCard != "" {
		updates["id_card"] = req.IDCard
	}
	if req.Status >= 0 {
		updates["status"] = req.Status
	}

	if err := dao.DB.Model(&stakeholder).Updates(updates).Error; err != nil {
		utils.Error(c, "更新权益方失败: "+err.Error())
		return
	}

	utils.Success(c, stakeholder)
}

func GetStakeholder(c *gin.Context) {
	id := c.Param("id")

	var stakeholder model.Stakeholder
	if err := dao.DB.First(&stakeholder, id).Error; err != nil {
		utils.Error(c, "权益方不存在")
		return
	}

	utils.Success(c, stakeholder)
}

func ListStakeholders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	typeCode := c.Query("type_code")
	keyword := c.Query("keyword")

	query := dao.DB.Model(&model.Stakeholder{})

	if typeCode != "" {
		query = query.Where("type_code = ?", typeCode)
	}
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var stakeholders []model.Stakeholder
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&stakeholders)

	utils.Page(c, stakeholders, total, page, pageSize)
}

func DeleteStakeholder(c *gin.Context) {
	id := c.Param("id")

	if err := dao.DB.Delete(&model.Stakeholder{}, id).Error; err != nil {
		utils.Error(c, "删除权益方失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

func ListStakeholderTypes(c *gin.Context) {
	var types []model.StakeholderType
	dao.DB.Order("sort_order ASC").Find(&types)
	utils.Success(c, types)
}

func RegisterStakeholderRoutes(r *gin.Engine) {
	shGroup := r.Group("/api/stakeholders")
	shGroup.Use(middleware.AuthMiddleware())
	{
		shGroup.POST("", middleware.AdminMiddleware(), CreateStakeholder)
		shGroup.GET("", ListStakeholders)
		shGroup.GET("/types", ListStakeholderTypes)

		shGroup.GET("/:id", GetStakeholder)
		shGroup.PUT("/:id", middleware.AdminMiddleware(), UpdateStakeholder)
		shGroup.DELETE("/:id", middleware.AdminMiddleware(), DeleteStakeholder)
	}
}
