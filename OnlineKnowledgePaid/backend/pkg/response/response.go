package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    http.StatusOK,
		Message: "success",
		Data:    data,
	})
}

func Fail(c *gin.Context, code int, msg string) {
	c.JSON(code, Response{
		Code:    code,
		Message: msg,
		Data:    nil,
	})
}

func FailWithData(c *gin.Context, code int, msg string, data interface{}) {
	c.JSON(code, Response{
		Code:    code,
		Message: msg,
		Data:    data,
	})
}

func Unauthorized(c *gin.Context, msg string) {
	Fail(c, http.StatusUnauthorized, msg)
}

func Forbidden(c *gin.Context, msg string) {
	Fail(c, http.StatusForbidden, msg)
}

func NotFound(c *gin.Context, msg string) {
	Fail(c, http.StatusNotFound, msg)
}

func ServerError(c *gin.Context, msg string) {
	Fail(c, http.StatusInternalServerError, msg)
}
