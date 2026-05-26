package routes

import (
	"excel-viewer/controllers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.POST("/upload", controllers.UploadExcel)
		api.GET("/excel/:id", controllers.GetExcelInfo)
		api.GET("/excel/:id/sheet", controllers.GetSheetData)
		api.GET("/excel/:id/export", controllers.ExportCSV)
		api.POST("/excel/:id/share", controllers.CreateShareLink)
		api.GET("/share/:token", controllers.GetSharedSheetData)
	}

	r.Static("/uploads", "./uploads")

	return r
}
