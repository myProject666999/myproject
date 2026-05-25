package services

import (
	"context"
	"fmt"
	"log"
	"price-monitor/config"
	"price-monitor/database"
	"price-monitor/models"
	redisclient "price-monitor/redis"
	"time"

	"github.com/go-redis/redis/v8"
)

type SchedulerService struct {
	crawlService *CrawlService
	alertService *AlertService
	ticker       *time.Ticker
	done         chan bool
}

func NewSchedulerService() *SchedulerService {
	return &SchedulerService{
		crawlService: NewCrawlService(),
		alertService: NewAlertService(),
		done:         make(chan bool),
	}
}

func (s *SchedulerService) Start() {
	log.Println("Starting scheduler service...")

	s.processDueTasks()

	s.ticker = time.NewTicker(30 * time.Second)

	go func() {
		for {
			select {
			case <-s.ticker.C:
				s.processDueTasks()
			case <-s.done:
				s.ticker.Stop()
				return
			}
		}
	}()

	log.Println("Scheduler service started")
}

func (s *SchedulerService) Stop() {
	log.Println("Stopping scheduler service...")
	s.done <- true
	log.Println("Scheduler service stopped")
}

func (s *SchedulerService) processDueTasks() {
	now := time.Now()

	var products []models.Product
	database.DB.Where("status = ? AND next_crawl_at <= ?", 1, now).Find(&products)

	if len(products) == 0 {
		return
	}

	log.Printf("Found %d products to crawl", len(products))

	sem := make(chan bool, config.Cfg.Crawl.Concurrency)
	done := make(chan bool, len(products))

	for _, product := range products {
		sem <- true
		go func(p models.Product) {
			defer func() {
				<-sem
				done <- true
			}()
			s.crawlProduct(p)
		}(product)
	}

	for i := 0; i < len(products); i++ {
		<-done
	}
}

func (s *SchedulerService) crawlProduct(product models.Product) {
	ctx := context.Background()

	result, err := s.crawlService.CrawlProduct(ctx, &product)
	if err != nil {
		log.Printf("Failed to crawl product %d: %v", product.ID, err)
		s.updateNextCrawlTime(&product)
		return
	}

	if result.Success && result.Price > 0 {
		oldPrice := product.CurrentPrice
		err := s.crawlService.SaveCrawlResult(&product, result)
		if err != nil {
			log.Printf("Failed to save crawl result for product %d: %v", product.ID, err)
		}

		if oldPrice != nil && *oldPrice != result.Price {
			s.alertService.CheckAndSendAlerts(&product, oldPrice, &result.Price)
		}
	}

	s.updateNextCrawlTime(&product)
}

func (s *SchedulerService) updateNextCrawlTime(product *models.Product) {
	interval := product.CrawlInterval
	if interval <= 0 {
		interval = 3600
	}

	nextCrawl := time.Now().Add(time.Duration(interval) * time.Second)
	database.DB.Model(product).Update("next_crawl_at", nextCrawl)
}

func (s *SchedulerService) ScheduleProduct(product *models.Product) {
	interval := product.CrawlInterval
	if interval <= 0 {
		interval = 3600
	}

	nextCrawl := time.Now().Add(time.Duration(interval) * time.Second)
	product.NextCrawlAt = &nextCrawl
	database.DB.Model(product).Update("next_crawl_at", nextCrawl)
}

func (s *SchedulerService) TriggerCrawl(productID uint64) error {
	var product models.Product
	if err := database.DB.First(&product, productID).Error; err != nil {
		return err
	}

	now := time.Now()
	product.LastCrawlAt = &now
	s.crawlProduct(product)

	return nil
}

func (s *SchedulerService) GetQueueStatus() (map[string]interface{}, error) {
	ctx := context.Background()

	var total int64
	database.DB.Model(&models.Product{}).Where("status = ?", 1).Count(&total)

	var dueNow int64
	database.DB.Model(&models.Product{}).Where("status = ? AND next_crawl_at <= ?", 1, time.Now()).Count(&dueNow)

	var inProgress int64
	queueLen, _ := redisclient.RDB.LLen(ctx, "crawl:queue").Result()
	inProgress = int64(queueLen)

	recentResults, _ := redisclient.RDB.LRange(ctx, "crawl:results", 0, 9).Result()

	return map[string]interface{}{
		"total_monitoring": total,
		"due_now":          dueNow,
		"in_progress":      inProgress,
		"recent_results":   recentResults,
	}, nil
}

func (s *SchedulerService) PushToQueue(productIDs []uint64) {
	ctx := context.Background()

	for _, id := range productIDs {
		redisclient.RDB.LPush(ctx, "crawl:queue", id)
	}
}

func (s *SchedulerService) ProcessQueue() {
	ctx := context.Background()

	for {
		result, err := redisclient.RDB.BRPop(ctx, 0, "crawl:queue").Result()
		if err != nil {
			if err == redis.Nil {
				continue
			}
			log.Printf("Queue read error: %v", err)
			continue
		}

		if len(result) < 2 {
			continue
		}

		var productID uint64
		if _, err := fmt.Sscanf(result[1], "%d", &productID); err != nil {
			continue
		}

		var product models.Product
		if err := database.DB.First(&product, productID).Error; err != nil {
			continue
		}

		go s.crawlProduct(product)
	}
}
