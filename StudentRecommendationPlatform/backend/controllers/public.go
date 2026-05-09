package controllers

import (
	"net/http"
	"sort"
	"time"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func ListCarousels(c *gin.Context) {
	config.DB.Lock()
	defer config.DB.Unlock()

	var carousels []models.Carousel
	for _, carousel := range config.DB.Carousels {
		if carousel.Status == 1 {
			carousels = append(carousels, carousel)
		}
	}

	sort.Slice(carousels, func(i, j int) bool {
		return carousels[i].Sort < carousels[j].Sort
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": carousels})
}

func ListNews(c *gin.Context) {
	page, pageSize := parsePageInfo(c)

	config.DB.Lock()
	defer config.DB.Unlock()

	var newsList []models.News
	for _, news := range config.DB.News {
		newsList = append(newsList, news)
	}

	sort.Slice(newsList, func(i, j int) bool {
		return newsList[i].CreatedAt.After(newsList[j].CreatedAt)
	})

	paginated, total := paginate(newsList, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetNews(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	news, exists := config.DB.News[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "新闻不存在"})
		return
	}

	news.Views++
	config.DB.News[id] = news

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": news})
}

func ListNotices(c *gin.Context) {
	page, pageSize := parsePageInfo(c)

	config.DB.Lock()
	defer config.DB.Unlock()

	var notices []models.Notice
	for _, notice := range config.DB.Notices {
		notices = append(notices, notice)
	}

	sort.Slice(notices, func(i, j int) bool {
		return notices[i].CreatedAt.After(notices[j].CreatedAt)
	})

	paginated, total := paginate(notices, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func GetNotice(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	notice, exists := config.DB.Notices[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	notice.Views++
	config.DB.Notices[id] = notice

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": notice})
}

func ListCampusStories(c *gin.Context) {
	page, pageSize := parsePageInfo(c)

	config.DB.Lock()
	defer config.DB.Unlock()

	var stories []models.CampusStory
	for _, story := range config.DB.CampusStories {
		stories = append(stories, story)
	}

	sort.Slice(stories, func(i, j int) bool {
		return stories[i].CreatedAt.After(stories[j].CreatedAt)
	})

	paginated, total := paginate(stories, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ListCategories(c *gin.Context) {
	config.DB.Lock()
	defer config.DB.Unlock()

	var categories []models.Category
	for _, cat := range config.DB.Categories {
		categories = append(categories, cat)
	}

	sort.Slice(categories, func(i, j int) bool {
		return categories[i].ID < categories[j].ID
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": categories})
}

func ListAdminNews(c *gin.Context) {
	ListNews(c)
}

func CreateNews(c *gin.Context) {
	var news models.News
	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.NewsIDCounter++
	news.ID = config.DB.NewsIDCounter
	news.CreatedAt = time.Now()
	news.UpdatedAt = time.Now()
	config.DB.News[news.ID] = news

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": news})
}

func UpdateNews(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	news, exists := config.DB.News[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "新闻不存在"})
		return
	}

	if err := c.ShouldBindJSON(&news); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	news.ID = id
	news.UpdatedAt = time.Now()
	config.DB.News[id] = news

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": news})
}

func DeleteNews(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.News, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminNotices(c *gin.Context) {
	ListNotices(c)
}

func CreateNotice(c *gin.Context) {
	var notice models.Notice
	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.NoticeIDCounter++
	notice.ID = config.DB.NoticeIDCounter
	notice.CreatedAt = time.Now()
	notice.UpdatedAt = time.Now()
	config.DB.Notices[notice.ID] = notice

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": notice})
}

func UpdateNotice(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	notice, exists := config.DB.Notices[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "公告不存在"})
		return
	}

	if err := c.ShouldBindJSON(&notice); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	notice.ID = id
	notice.UpdatedAt = time.Now()
	config.DB.Notices[id] = notice

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": notice})
}

func DeleteNotice(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Notices, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCampusStories(c *gin.Context) {
	ListCampusStories(c)
}

func CreateCampusStory(c *gin.Context) {
	var story models.CampusStory
	if err := c.ShouldBindJSON(&story); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.CampusStoryIDCounter++
	story.ID = config.DB.CampusStoryIDCounter
	story.CreatedAt = time.Now()
	story.UpdatedAt = time.Now()
	config.DB.CampusStories[story.ID] = story

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": story})
}

func UpdateCampusStory(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	story, exists := config.DB.CampusStories[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "趣事不存在"})
		return
	}

	if err := c.ShouldBindJSON(&story); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	story.ID = id
	story.UpdatedAt = time.Now()
	config.DB.CampusStories[id] = story

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": story})
}

func DeleteCampusStory(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.CampusStories, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCarousels(c *gin.Context) {
	config.DB.Lock()
	defer config.DB.Unlock()

	var carousels []models.Carousel
	for _, carousel := range config.DB.Carousels {
		carousels = append(carousels, carousel)
	}

	sort.Slice(carousels, func(i, j int) bool {
		return carousels[i].Sort < carousels[j].Sort
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": carousels})
}

func CreateCarousel(c *gin.Context) {
	var carousel models.Carousel
	if err := c.ShouldBindJSON(&carousel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.CarouselIDCounter++
	carousel.ID = config.DB.CarouselIDCounter
	carousel.CreatedAt = time.Now()
	carousel.UpdatedAt = time.Now()
	config.DB.Carousels[carousel.ID] = carousel

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": carousel})
}

func UpdateCarousel(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	carousel, exists := config.DB.Carousels[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "轮播图不存在"})
		return
	}

	if err := c.ShouldBindJSON(&carousel); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	carousel.ID = id
	carousel.UpdatedAt = time.Now()
	config.DB.Carousels[id] = carousel

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": carousel})
}

func DeleteCarousel(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Carousels, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListAdminCategories(c *gin.Context) {
	ListCategories(c)
}

func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.CategoryIDCounter++
	category.ID = config.DB.CategoryIDCounter
	category.CreatedAt = time.Now()
	category.UpdatedAt = time.Now()
	config.DB.Categories[category.ID] = category

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": category})
}

func UpdateCategory(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	category, exists := config.DB.Categories[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "分类不存在"})
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	category.ID = id
	category.UpdatedAt = time.Now()
	config.DB.Categories[id] = category

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": category})
}

func DeleteCategory(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Categories, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
