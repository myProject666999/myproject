package service

import (
	"log"
	"sync"
	"time"

	"websitespeedtest/db"
	"websitespeedtest/model"
)

type Scheduler struct {
	tickers map[uint]*time.Ticker
	mu      sync.Mutex
	done    chan struct{}
}

var GlobalScheduler *Scheduler

func NewScheduler() *Scheduler {
	return &Scheduler{
		tickers: make(map[uint]*time.Ticker),
		done:    make(chan struct{}),
	}
}

func (s *Scheduler) StartAll() {
	var tasks []model.MonitorTask
	db.DB.Where("enabled = ?", true).Find(&tasks)
	for _, task := range tasks {
		s.AddTask(task)
	}
	log.Printf("Scheduler started with %d tasks", len(tasks))
}

func (s *Scheduler) AddTask(task model.MonitorTask) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.tickers[task.ID]; exists {
		s.StopTask(task.ID)
	}

	interval := time.Duration(task.Interval) * time.Minute
	if interval < 1*time.Minute {
		interval = 1 * time.Minute
	}

	ticker := time.NewTicker(interval)
	s.tickers[task.ID] = ticker

	go func() {
		for {
			select {
			case <-ticker.C:
				s.runTest(task)
			case <-s.done:
				return
			}
		}
	}()
}

func (s *Scheduler) StopTask(id uint) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if ticker, ok := s.tickers[id]; ok {
		ticker.Stop()
		delete(s.tickers, id)
	}
}

func (s *Scheduler) StopAll() {
	s.mu.Lock()
	defer s.mu.Unlock()
	close(s.done)
	for id, ticker := range s.tickers {
		ticker.Stop()
		delete(s.tickers, id)
	}
}

func (s *Scheduler) runTest(task model.MonitorTask) {
	region := GetRegionByCode(task.Region)
	regionName := task.Region
	if region != nil {
		regionName = region.Name
	}

	result := PerformSpeedTest(task.URL, task.Region, regionName)
	if err := db.DB.Create(result).Error; err != nil {
		log.Printf("Failed to save scheduled test result: %v", err)
	} else {
		log.Printf("Scheduled test completed for %s from %s", task.URL, regionName)
	}
}
