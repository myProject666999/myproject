package handler

import (
	"battery-cabinet/internal/dao"
	"battery-cabinet/internal/model"
	"battery-cabinet/internal/pkg/response"
	"fmt"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetWallet(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)

	wallet, err := dao.GetOrCreateWallet(userID)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, wallet)
}

func RechargeWallet(c *gin.Context) {
	var req model.WalletRechargeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	idempotentKey := fmt.Sprintf("recharge_%d_%f_%d", req.UserID, req.Amount, time.Now().Unix())

	resp, err := dao.RechargeWallet(&req, idempotentKey)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, resp)
}

func ConsumeWallet(c *gin.Context) {
	var req model.WalletConsumeReq
	if err := c.ShouldBindJSON(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	trans, err := dao.ConsumeWallet(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, trans)
}

func GetTransactionList(c *gin.Context) {
	var req model.TransactionListReq
	if err := c.ShouldBindQuery(&req); err != nil {
		response.Error(c, err.Error())
		return
	}

	list, total, err := dao.GetTransactionList(&req)
	if err != nil {
		response.Error(c, err.Error())
		return
	}

	response.Success(c, response.PageResult(list, total, req.Page, req.PageSize))
}
