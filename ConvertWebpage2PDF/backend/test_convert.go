//go:build ignore

package main

import (
	"fmt"
	"log"
	"os"

	"ConvertWebpage2PDF/config"
	"ConvertWebpage2PDF/services"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	
	if err := config.LoadConfig(); err != nil {
		log.Printf("警告: 加载配置失败: %v", err)
	}
	
	outputDir := config.AppConfig.PDFOutputDir
	if outputDir == "" {
		outputDir = "./output"
	}
	
	if err := os.MkdirAll(outputDir, 0755); err != nil {
		log.Fatalf("创建输出目录失败: %v", err)
	}
	
	testURLs := []string{
		"https://www.example.com",
		"https://httpbin.org/html",
	}
	
	chromePath := ""
	log.Println("========================================")
	log.Println("网页转PDF功能测试")
	log.Println("========================================")
	
	for _, url := range testURLs {
		log.Printf("\n测试URL: %s", url)
		log.Println("----------------------------------------")
		
		opts := services.PDFOptions{
			URL:        url,
			Title:      "Test",
			Style:      "default",
			EnableTOC:  true,
			Pagination: "A4",
		}
		
		filename, pageCount, err := services.ConvertWebpageToPDF(opts, outputDir, chromePath)
		
		if err != nil {
			log.Printf("❌ 转换失败: %v", err)
		} else {
			log.Printf("✅ 转换成功: %s, 页数: %d", filename, pageCount)
			filePath := outputDir + "/" + filename
			if info, statErr := os.Stat(filePath); statErr == nil {
				log.Printf("   文件大小: %.2f KB", float64(info.Size())/1024)
			}
		}
	}
	
	log.Println("\n========================================")
	log.Println("测试完成")
	log.Println("========================================")
	
	fmt.Print("\n按回车键退出...")
	fmt.Scanln()
}
