package controllers

import (
	"strconv"
	"urbanrail/database"
	"urbanrail/models"
	"urbanrail/utils"

	"github.com/gin-gonic/gin"
)

func GetPublisherList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	var publishers []models.Publisher
	var total int64

	query := database.DB.Model(&models.Publisher{})
	if keyword != "" {
		query = query.Where("name LIKE ? OR contact LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&publishers)

	utils.Success(c, gin.H{
		"list":      publishers,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetPublisherDetail(c *gin.Context) {
	id := c.Param("id")
	var publisher models.Publisher
	if err := database.DB.First(&publisher, id).Error; err != nil {
		utils.NotFound(c, "发布者不存在")
		return
	}
	utils.Success(c, publisher)
}

type CreatePublisherRequest struct {
	Name        string `json:"name" binding:"required"`
	Contact     string `json:"contact"`
	Phone       string `json:"phone"`
	Email       string `json:"email"`
	Description string `json:"description"`
	Status      int    `json:"status"`
}

func CreatePublisher(c *gin.Context) {
	var req CreatePublisherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	publisher := models.Publisher{
		Name:        req.Name,
		Contact:     req.Contact,
		Phone:       req.Phone,
		Email:       req.Email,
		Description: req.Description,
		Status:      req.Status,
	}

	if err := database.DB.Create(&publisher).Error; err != nil {
		utils.InternalServerError(c, "创建发布者失败")
		return
	}

	utils.SuccessWithMessage(c, "创建成功", publisher)
}

func UpdatePublisher(c *gin.Context) {
	id := c.Param("id")
	var req CreatePublisherRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "请求参数错误")
		return
	}

	var publisher models.Publisher
	if err := database.DB.First(&publisher, id).Error; err != nil {
		utils.NotFound(c, "发布者不存在")
		return
	}

	if err := database.DB.Model(&publisher).Updates(models.Publisher{
		Name:        req.Name,
		Contact:     req.Contact,
		Phone:       req.Phone,
		Email:       req.Email,
		Description: req.Description,
		Status:      req.Status,
	}).Error; err != nil {
		utils.InternalServerError(c, "更新失败")
		return
	}

	utils.SuccessWithMessage(c, "更新成功", publisher)
}

func DeletePublisher(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&models.Publisher{}, id).Error; err != nil {
		utils.InternalServerError(c, "删除失败")
		return
	}
	utils.SuccessWithMessage(c, "删除成功", nil)
}

func GetAllPublishers(c *gin.Context) {
	var publishers []models.Publisher
	database.DB.Where("status = 1").Order("id DESC").Find(&publishers)
	utils.Success(c, publishers)
}
