package controllers

import (
	"strconv"

	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"

	"github.com/gin-gonic/gin"
)

func GetStoreList(c *gin.Context) {
	var pagination models.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		utils.BadRequestResponse(c, "分页参数错误")
		return
	}

	if pagination.Page <= 0 {
		pagination.Page = 1
	}
	if pagination.PageSize <= 0 {
		pagination.PageSize = 10
	}

	keyword := c.Query("keyword")
	status := c.Query("status")

	query := database.DB.Model(&models.Store{})

	if keyword != "" {
		query = query.Where("store_code LIKE ? OR store_name LIKE ? OR address LIKE ? OR manager_name LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		utils.InternalServerErrorResponse(c, "查询门店数量失败")
		return
	}

	var stores []models.Store
	offset := (pagination.Page - 1) * pagination.PageSize
	if err := query.Offset(offset).Limit(pagination.PageSize).Order("id DESC").Find(&stores).Error; err != nil {
		utils.InternalServerErrorResponse(c, "查询门店列表失败")
		return
	}

	pagination.Total = total

	utils.SuccessResponse(c, gin.H{
		"list":  stores,
		"total": total,
		"page":  pagination.Page,
		"pageSize": pagination.PageSize,
	})
}

func GetStoreDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "ID参数错误")
		return
	}

	var store models.Store
	if err := database.DB.First(&store, id).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	utils.SuccessResponse(c, store)
}

func CreateStore(c *gin.Context) {
	var store models.Store
	if err := c.ShouldBindJSON(&store); err != nil {
		utils.BadRequestResponse(c, "请求参数错误")
		return
	}

	var existing models.Store
	if err := database.DB.Where("store_code = ?", store.StoreCode).First(&existing).Error; err == nil {
		utils.BadRequestResponse(c, "门店编码已存在")
		return
	}

	if err := database.DB.Create(&store).Error; err != nil {
		utils.InternalServerErrorResponse(c, "创建门店失败")
		return
	}

	utils.SuccessResponse(c, store)
}

func UpdateStore(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "ID参数错误")
		return
	}

	var store models.Store
	if err := database.DB.First(&store, id).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	var updateData models.Store
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.BadRequestResponse(c, "请求参数错误")
		return
	}

	if updateData.StoreCode != "" && updateData.StoreCode != store.StoreCode {
		var existing models.Store
		if err := database.DB.Where("store_code = ? AND id != ?", updateData.StoreCode, id).First(&existing).Error; err == nil {
			utils.BadRequestResponse(c, "门店编码已存在")
			return
		}
	}

	if err := database.DB.Model(&store).Updates(updateData).Error; err != nil {
		utils.InternalServerErrorResponse(c, "更新门店失败")
		return
	}

	utils.SuccessResponse(c, store)
}

func DeleteStore(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "ID参数错误")
		return
	}

	var store models.Store
	if err := database.DB.First(&store, id).Error; err != nil {
		utils.NotFoundResponse(c, "门店不存在")
		return
	}

	if err := database.DB.Delete(&store).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除门店失败")
		return
	}

	utils.SuccessResponse(c, nil)
}
