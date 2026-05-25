package services

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"price-monitor/database"
	"price-monitor/models"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type CrawlService struct{}

type CrawlResult struct {
	Price        float64
	OriginalPrice *float64
	Title        string
	ImageURL     string
	StockStatus  string
	Discount     *float64
	Success      bool
	Error        string
}

type PlatformSelector struct {
	Platform      string
	PriceSelector string
	OriginalPriceSelector string
	TitleSelector string
	ImageSelector string
	StockSelector string
}

var platformSelectors = map[string]PlatformSelector{
	"generic": {
		Platform:               "generic",
		PriceSelector:          "[class*='price']",
		OriginalPriceSelector:  "[class*='original-price']",
		TitleSelector:          "h1, [class*='title']",
		ImageSelector:          "img[src*='product']",
		StockSelector:          "[class*='stock']",
	},
}

func NewCrawlService() *CrawlService {
	return &CrawlService{}
}

func (s *CrawlService) CrawlProduct(ctx context.Context, product *models.Product) (*CrawlResult, error) {
	selector := s.getSelector(product.Platform)
	config := s.getAntiCrawlConfig(product.Platform)

	client := &http.Client{
		Timeout: time.Duration(config.Timeout) * time.Second,
	}

	req, err := http.NewRequestWithContext(ctx, "GET", product.ProductURL, nil)
	if err != nil {
		return &CrawlResult{Success: false, Error: err.Error()}, err
	}

	s.setHeaders(req, config)

	resp, err := client.Do(req)
	if err != nil {
		s.logCrawlResult(product.ID, "failed", nil, nil, err.Error())
		return &CrawlResult{Success: false, Error: err.Error()}, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		s.logCrawlResult(product.ID, "failed", &resp.StatusCode, nil, err.Error())
		return &CrawlResult{Success: false, Error: err.Error()}, err
	}

	result := &CrawlResult{Success: true}

	priceText := doc.Find(selector.PriceSelector).First().Text()
	priceText = cleanPriceText(priceText)
	if priceText != "" {
		price, err := parsePrice(priceText)
		if err == nil {
			result.Price = price
		}
	}

	if selector.OriginalPriceSelector != "" {
		origPriceText := doc.Find(selector.OriginalPriceSelector).First().Text()
		origPriceText = cleanPriceText(origPriceText)
		if origPriceText != "" {
			origPrice, err := parsePrice(origPriceText)
			if err == nil {
				result.OriginalPrice = &origPrice
			}
		}
	}

	title := doc.Find(selector.TitleSelector).First().Text()
	title = strings.TrimSpace(title)
	if title != "" {
		result.Title = title
	}

	if img, exists := doc.Find(selector.ImageSelector).First().Attr("src"); exists {
		result.ImageURL = img
	}

	stockText := doc.Find(selector.StockSelector).First().Text()
	stockText = strings.ToLower(strings.TrimSpace(stockText))
	if strings.Contains(stockText, "out") || strings.Contains(stockText, "售罄") {
		result.StockStatus = "out_of_stock"
	} else {
		result.StockStatus = "in_stock"
	}

	if result.Price > 0 && result.OriginalPrice != nil && *result.OriginalPrice > 0 {
		discount := (result.Price / *result.OriginalPrice) * 100
		result.Discount = &discount
	}

	respTime := 0
	s.logCrawlResult(product.ID, "success", &resp.StatusCode, &respTime, "")

	return result, nil
}

func (s *CrawlService) getSelector(platform string) PlatformSelector {
	if selector, ok := platformSelectors[platform]; ok {
		return selector
	}
	return platformSelectors["generic"]
}

func (s *CrawlService) getAntiCrawlConfig(platform string) *models.AntiCrawlConfig {
	var config models.AntiCrawlConfig
	database.DB.Where("platform = ?", platform).First(&config)

	if config.ID == 0 {
		database.DB.Where("platform = ?", "generic").First(&config)
	}

	if config.ID == 0 {
		return &models.AntiCrawlConfig{
			Timeout:    30,
			MinInterval: 3,
			MaxInterval: 60,
			RetryCount: 3,
			RetryDelay: 10,
		}
	}

	return &config
}

func (s *CrawlService) setHeaders(req *http.Request, config *models.AntiCrawlConfig) {
	userAgents := s.getUserAgents(config)
	if len(userAgents) > 0 {
		req.Header.Set("User-Agent", userAgents[rand.Intn(len(userAgents))])
	} else {
		req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
	}

	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")
	req.Header.Set("Accept-Encoding", "gzip, deflate")
	req.Header.Set("Connection", "keep-alive")

	if config.Headers != "" {
		var headers map[string]string
		if err := json.Unmarshal([]byte(config.Headers), &headers); err == nil {
			for key, value := range headers {
				req.Header.Set(key, value)
			}
		}
	}
}

func (s *CrawlService) getUserAgents(config *models.AntiCrawlConfig) []string {
	if config.UserAgents == "" {
		return nil
	}

	var agents []string
	if err := json.Unmarshal([]byte(config.UserAgents), &agents); err != nil {
		return nil
	}
	return agents
}

func (s *CrawlService) logCrawlResult(productID uint64, status string, respCode *int, respTime *int, errMsg string) {
	log := models.CrawlLog{
		ProductID:    productID,
		Status:       status,
		ResponseCode: respCode,
		ResponseTime: respTime,
		ErrorMessage: errMsg,
	}
	database.DB.Create(&log)
}

func cleanPriceText(text string) string {
	text = strings.TrimSpace(text)
	text = strings.ReplaceAll(text, "¥", "")
	text = strings.ReplaceAll(text, "￥", "")
	text = strings.ReplaceAll(text, "元", "")
	text = strings.ReplaceAll(text, ",", "")
	text = strings.ReplaceAll(text, " ", "")
	return text
}

func parsePrice(text string) (float64, error) {
	var price float64
	_, err := fmt.Sscanf(text, "%f", &price)
	return price, err
}

func (s *CrawlService) SaveCrawlResult(product *models.Product, result *CrawlResult) error {
	now := time.Now()

	updates := map[string]interface{}{
		"last_crawl_at": now,
	}

	if result.Price > 0 {
		updates["current_price"] = result.Price

		if product.LowestPrice == nil || result.Price < *product.LowestPrice {
			updates["lowest_price"] = result.Price
		}
		if product.HighestPrice == nil || result.Price > *product.HighestPrice {
			updates["highest_price"] = result.Price
		}
	}

	if result.OriginalPrice != nil {
		updates["original_price"] = *result.OriginalPrice
	}

	if result.Title != "" {
		updates["title"] = result.Title
	}

	if result.ImageURL != "" {
		updates["image_url"] = result.ImageURL
	}

	if err := database.DB.Model(product).Updates(updates).Error; err != nil {
		return err
	}

	if result.Price > 0 {
		history := models.PriceHistory{
			ProductID:    product.ID,
			Price:        result.Price,
			OriginalPrice: result.OriginalPrice,
			Discount:     result.Discount,
			StockStatus:  result.StockStatus,
			CrawledAt:    now,
			Source:       "auto",
		}
		database.DB.Create(&history)
	}

	return nil
}
