package data

import (
	"campus-trading/config"
	"campus-trading/models"
	"campus-trading/utils"
	"log"
	"time"
)

func InitSeedData() error {
	if err := createAdminUser(); err != nil {
		return err
	}
	if err := createCategories(); err != nil {
		return err
	}
	if err := createBanners(); err != nil {
		return err
	}
	if err := createNews(); err != nil {
		return err
	}
	if err := createProducts(); err != nil {
		return err
	}
	return nil
}

func createAdminUser() error {
	var count int64
	config.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count > 0 {
		log.Println("Admin user already exists, skipping...")
		return nil
	}

	hashedPassword, err := utils.HashPassword("admin123")
	if err != nil {
		return err
	}

	admin := models.User{
		Username: "admin",
		Password: hashedPassword,
		Email:    "admin@campus.com",
		Nickname: "超级管理员",
		Role:     "admin",
		Status:   1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := config.DB.Create(&admin).Error; err != nil {
		return err
	}

	log.Println("Admin user created successfully: admin / admin123")
	return nil
}

func createCategories() error {
	var count int64
	config.DB.Model(&models.Category{}).Count(&count)
	if count > 0 {
		log.Println("Categories already exist, skipping...")
		return nil
	}

	categories := []models.Category{
		{Name: "电子产品", Description: "手机、电脑、耳机等电子产品", Sort: 1, Status: 1},
		{Name: "书籍资料", Description: "教材、参考书、考研资料等", Sort: 2, Status: 1},
		{Name: "生活用品", Description: "日常用品、小家电等", Sort: 3, Status: 1},
		{Name: "运动器材", Description: "篮球、羽毛球拍、瑜伽垫等", Sort: 4, Status: 1},
		{Name: "服装配饰", Description: "衣服、鞋子、包包等", Sort: 5, Status: 1},
		{Name: "其他", Description: "其他闲置物品", Sort: 6, Status: 1},
	}

	for _, cat := range categories {
		cat.CreatedAt = time.Now()
		cat.UpdatedAt = time.Now()
		if err := config.DB.Create(&cat).Error; err != nil {
			return err
		}
	}

	log.Println("Categories created successfully")
	return nil
}

func createBanners() error {
	var count int64
	config.DB.Model(&models.Banner{}).Count(&count)
	if count > 0 {
		log.Println("Banners already exist, skipping...")
		return nil
	}

	banners := []models.Banner{
		{Title: "校园闲置交易平台", Image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200", Link: "/products", Sort: 1, Status: 1},
		{Title: "新学期特惠", Image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200", Link: "/products", Sort: 2, Status: 1},
		{Title: "限时抢购", Image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200", Link: "/products", Sort: 3, Status: 1},
	}

	for _, banner := range banners {
		banner.CreatedAt = time.Now()
		banner.UpdatedAt = time.Now()
		if err := config.DB.Create(&banner).Error; err != nil {
			return err
		}
	}

	log.Println("Banners created successfully")
	return nil
}

func createNews() error {
	var count int64
	config.DB.Model(&models.News{}).Count(&count)
	if count > 0 {
		log.Println("News already exist, skipping...")
		return nil
	}

	newsList := []models.News{
		{Title: "校园闲置物品交易平台正式上线！", Content: "欢迎使用校园闲置物品交易平台！在这里，您可以买卖各种闲置物品，让资源得到更好的利用。", Author: "管理员", Status: 1, Views: 100},
		{Title: "新学期开学季，闲置物品大促销！", Content: "新学期来了，同学们可以在这里找到各种学习用品和生活用品，价格实惠，品质保证！", Author: "管理员", Status: 1, Views: 85},
		{Title: "如何安全交易的小贴士", Content: "为了确保您的交易安全，我们建议您：1. 使用平台进行交易 2. 当面验货 3. 确认商品无误后再付款。", Author: "管理员", Status: 1, Views: 120},
	}

	for _, news := range newsList {
		news.CreatedAt = time.Now()
		news.UpdatedAt = time.Now()
		if err := config.DB.Create(&news).Error; err != nil {
			return err
		}
	}

	log.Println("News created successfully")
	return nil
}

func createProducts() error {
	var count int64
	config.DB.Model(&models.Product{}).Count(&count)
	if count > 0 {
		log.Println("Products already exist, skipping...")
		return nil
	}

	products := []models.Product{
		{Name: "iPhone 13 Pro", Description: "95新 iPhone 13 Pro 256GB 黑色，无划痕，配件齐全", Price: 5999.00, OriginalPrice: 8999.00, Stock: 10, Image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400", CategoryID: 1, Status: 1, Sales: 25},
		{Name: "高等数学教材", Description: "第七版高等数学上下册，有少量笔记", Price: 30.00, OriginalPrice: 89.00, Stock: 50, Image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", CategoryID: 2, Status: 1, Sales: 100},
		{Name: "小米电热水壶", Description: "99新小米电热水壶，1.5L容量，使用次数少", Price: 59.00, OriginalPrice: 129.00, Stock: 20, Image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400", CategoryID: 3, Status: 1, Sales: 35},
		{Name: "篮球", Description: "斯伯丁篮球，使用过几次，状态良好", Price: 89.00, OriginalPrice: 199.00, Stock: 15, Image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400", CategoryID: 4, Status: 1, Sales: 20},
		{Name: "运动T恤", Description: "全新运动T恤，L码，透气速干", Price: 49.00, OriginalPrice: 99.00, Stock: 30, Image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", CategoryID: 5, Status: 1, Sales: 50},
		{Name: "机械键盘", Description: "樱桃红轴机械键盘，9成新，手感极佳", Price: 199.00, OriginalPrice: 499.00, Stock: 8, Image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", CategoryID: 1, Status: 1, Sales: 15},
		{Name: "考研英语真题", Description: "2024考研英语真题解析，黄皮书", Price: 45.00, OriginalPrice: 88.00, Stock: 25, Image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", CategoryID: 2, Status: 1, Sales: 60},
		{Name: "瑜伽垫", Description: "TPE材质瑜伽垫，防滑加厚，183x61cm", Price: 39.00, OriginalPrice: 99.00, Stock: 40, Image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400", CategoryID: 4, Status: 1, Sales: 45},
	}

	for _, product := range products {
		product.CreatedAt = time.Now()
		product.UpdatedAt = time.Now()
		if err := config.DB.Create(&product).Error; err != nil {
			return err
		}
	}

	log.Println("Products created successfully")
	return nil
}
