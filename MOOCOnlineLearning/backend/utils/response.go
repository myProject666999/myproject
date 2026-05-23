package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type ResponseBody struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Response(c *gin.Context, httpStatus int, message string, data interface{}) {
	code := httpStatus
	if httpStatus == http.StatusOK {
		code = 0
	}
	c.JSON(httpStatus, ResponseBody{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func Success(c *gin.Context, data interface{}) {
	Response(c, http.StatusOK, "success", data)
}

func SuccessMsg(c *gin.Context, message string) {
	Response(c, http.StatusOK, message, nil)
}

func Fail(c *gin.Context, httpStatus int, code int, message string) {
	c.JSON(httpStatus, ResponseBody{
		Code:    code,
		Message: message,
		Data:    nil,
	})
}
