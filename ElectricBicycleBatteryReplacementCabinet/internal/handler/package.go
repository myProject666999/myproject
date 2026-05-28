package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPackageList(c *gin.Context) {
	list, err := dao.GetPackageList()
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}

func GetUserPackageList(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)

	list, err := dao.GetUserPackageList(userID)
	if err != nil {
		response.Error(c, err.Error())
		return
	}
	response.Success(c, list)
}

func PurchasePackage(c *gin.Context) {
	var req model.PackagePurchaseReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	resp, err := dao.PurchasePackage(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, resp)
}
