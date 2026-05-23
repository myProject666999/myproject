package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"

	"simplehomenas/config"
	"simplehomenas/database"
	"simplehomenas/handlers"
	"simplehomenas/middleware"
)

func main() {
	configPath := flag.String("config", "", "path to config.json")
	port := flag.Int("port", 0, "override port")
	dataRoot := flag.String("data", "", "override data root")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}
	if *port > 0 {
		cfg.Port = *port
	}
	if *dataRoot != "" {
		cfg.DataRoot = *dataRoot
	}
	absRoot, _ := filepath.Abs(cfg.DataRoot)
	cfg.DataRoot = absRoot
	if err := os.MkdirAll(cfg.DataRoot, 0755); err != nil {
		log.Fatalf("create data root: %v", err)
	}
	if err := database.Init(cfg.DBPath); err != nil {
		log.Fatalf("init db: %v", err)
	}
	defer database.DB.Close()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(middleware.CORS())

	fileH := handlers.NewFileHandler(cfg.DataRoot)
	shareH := handlers.NewShareHandler(cfg.DataRoot)
	statusH := handlers.NewStatusHandler(cfg.DataRoot)

	api := r.Group("/api")
	{
		files := api.Group("/files")
		{
			files.GET("/list", fileH.List)
			files.POST("/mkdir", fileH.Mkdir)
			files.POST("/delete", fileH.Delete)
			files.POST("/rename", fileH.Rename)
			files.POST("/upload", fileH.Upload)
			files.GET("/download", fileH.Download)
		}
		shares := api.Group("/shares")
		{
			shares.GET("/list", shareH.List)
			shares.POST("/create", shareH.Create)
			shares.POST("/delete", shareH.Delete)
			shares.GET("/access/:token", shareH.Access)
			shares.GET("/access/:token/zip", shareH.DownloadZip)
		}
		st := api.Group("/status")
		{
			st.GET("/disk", statusH.Disk)
			st.GET("/samba", statusH.Samba)
			st.GET("/system", statusH.System)
			st.GET("/", statusH.Index)
		}
	}

	staticDir := "./static"
	if info, err := os.Stat(staticDir); err == nil && info.IsDir() {
		r.NoRoute(func(c *gin.Context) {
			reqPath := c.Request.URL.Path
			fullPath := filepath.Join(staticDir, filepath.Clean("/"+strings.TrimPrefix(reqPath, "/")))
			if fi, err := os.Stat(fullPath); err == nil && !fi.IsDir() {
				c.File(fullPath)
				return
			}
			c.File(filepath.Join(staticDir, "index.html"))
		})
	} else {
		r.GET("/", func(c *gin.Context) {
			c.String(200, "SimpleHomeNAS server is running. Mount static frontend to /static or serve via reverse proxy.")
		})
	}

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("SimpleHomeNAS running on http://0.0.0.0%s (data=%s)", addr, cfg.DataRoot)
	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
