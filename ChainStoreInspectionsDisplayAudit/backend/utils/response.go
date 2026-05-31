package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func SuccessResponse(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func SuccessResponseWithMessage(c *gin.Context, data interface{}, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: message,
		Data:    data,
	})
}

func ErrorResponse(c *gin.Context, code int, message string) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

func ErrorResponseWithData(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func BadRequestResponse(c *gin.Context, message string) {
	ErrorResponse(c, 400, message)
}

func UnauthorizedResponse(c *gin.Context, message string) {
	ErrorResponse(c, 401, message)
}

func ForbiddenResponse(c *gin.Context, message string) {
	ErrorResponse(c, 403, message)
}

func NotFoundResponse(c *gin.Context, message string) {
	ErrorResponse(c, 404, message)
}

func InternalServerErrorResponse(c *gin.Context, message string) {
	ErrorResponse(c, 500, message)
}
