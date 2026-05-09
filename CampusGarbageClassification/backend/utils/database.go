package utils

import (
	"garbage-classification/config"
	"garbage-classification/models"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	cfg := config.GetConfig()
	var err error
	DB, err = gorm.Open(mysql.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	log.Println("Database connected successfully")
}

func AutoMigrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Student{},
		&models.Admin{},
		&models.Notice{},
		&models.AdvocateCategory{},
		&models.Advocate{},
		&models.BagType{},
		&models.GarbageBag{},
		&models.BagPurchase{},
		&models.TrashBin{},
		&models.ThrowRecord{},
		&models.Product{},
		&models.ExchangeRecord{},
		&models.CreativeType{},
		&models.CreativeInfo{},
		&models.SiteInfo{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}
	log.Println("Database migrated successfully")
}

func SeedData() {
	cfg := config.GetConfig()
	
	seedAdmin(cfg)
	seedSiteInfo()
	seedNoticeData()
	seedAdvocateData()
	seedBagData()
	seedProductData()
	seedBinData()
}

func seedAdmin(cfg *config.Config) {
	var count int64
	DB.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count > 0 {
		return
	}
	
	password, _ := HashPassword("admin123")
	adminUser := models.User{
		Username: "admin",
		Password: password,
		Role:     "admin",
	}
	DB.Create(&adminUser)
	
	admin := models.Admin{
		UserID:   adminUser.ID,
		RealName: "系统管理员",
		Phone:    "13800000000",
		Email:    "admin@example.com",
	}
	DB.Create(&admin)
	log.Println("Default admin account created: admin/admin123")
}

func seedSiteInfo() {
	var count int64
	DB.Model(&models.SiteInfo{}).Count(&count)
	if count > 0 {
		return
	}
	
	DB.Create(&models.SiteInfo{Type: "about", Content: "校园垃圾分类管理系统是一款帮助学生养成良好垃圾分类习惯的系统，通过积分激励机制，鼓励学生正确分类投放垃圾。"})
	DB.Create(&models.SiteInfo{Type: "contact", Content: "联系电话：400-123-4567\n邮箱：support@example.com\n地址：某某大学后勤处"})
}

func seedNoticeData() {
	var count int64
	DB.Model(&models.Notice{}).Count(&count)
	if count > 0 {
		return
	}
	
	notices := []models.Notice{
		{Title: "关于开展校园垃圾分类知识竞赛的通知", Content: "为进一步提高全校师生的垃圾分类意识，学校决定举办垃圾分类知识竞赛活动，欢迎大家积极参与。", Category: "活动通知"},
		{Title: "校园垃圾分类投放点调整公告", Content: "根据学校统一规划，各区域的垃圾分类投放点进行了调整，请同学们注意查看新的投放点位置。", Category: "公告"},
		{Title: "垃圾分类积分兑换新功能上线", Content: "系统新增商品兑换功能，同学们可以使用垃圾分类获得的积分兑换各类商品。", Category: "系统公告"},
	}
	DB.Create(&notices)
}

func seedAdvocateData() {
	var catCount int64
	DB.Model(&models.AdvocateCategory{}).Count(&catCount)
	if catCount == 0 {
		cats := []models.AdvocateCategory{
			{Name: "分类知识", Sort: 1},
			{Name: "环保活动", Sort: 2},
			{Name: "环保故事", Sort: 3},
		}
		DB.Create(&cats)
	}
	
	var advCount int64
	DB.Model(&models.Advocate{}).Count(&advCount)
	if advCount > 0 {
		return
	}
	
	advocates := []models.Advocate{
		{Title: "生活垃圾四分类指南", Content: "可回收物、有害垃圾、厨余垃圾、其他垃圾的详细分类标准说明。", CategoryID: 1, Status: 1, Views: 100},
		{Title: "校园环保志愿者招募", Content: "欢迎热爱环保的同学们加入我们的志愿者队伍。", CategoryID: 2, Status: 1, Views: 80},
	}
	DB.Create(&advocates)
}

func seedBagData() {
	var typeCount int64
	DB.Model(&models.BagType{}).Count(&typeCount)
	if typeCount == 0 {
		types := []models.BagType{
			{Name: "可回收物袋", Color: "蓝色", Sort: 1},
			{Name: "厨余垃圾袋", Color: "绿色", Sort: 2},
			{Name: "其他垃圾袋", Color: "灰色", Sort: 3},
			{Name: "有害垃圾袋", Color: "红色", Sort: 4},
		}
		DB.Create(&types)
	}
	
	var bagCount int64
	DB.Model(&models.GarbageBag{}).Count(&bagCount)
	if bagCount > 0 {
		return
	}
	
	bags := []models.GarbageBag{
		{Name: "蓝色可回收垃圾袋(10只装)", TypeID: 1, Description: "加厚款，适合装可回收物品", Price: 5.0, Stock: 500, Status: 1},
		{Name: "绿色厨余垃圾袋(10只装)", TypeID: 2, Description: "可降解材料，环保耐用", Price: 6.0, Stock: 500, Status: 1},
		{Name: "灰色其他垃圾袋(10只装)", TypeID: 3, Description: "通用垃圾袋，价格实惠", Price: 4.0, Stock: 500, Status: 1},
	}
	DB.Create(&bags)
}

func seedProductData() {
	var count int64
	DB.Model(&models.Product{}).Count(&count)
	if count > 0 {
		return
	}
	
	products := []models.Product{
		{Name: "精美笔记本", Category: "文具", Description: "环保材料制作的笔记本", PointsPrice: 100, Stock: 100, Status: 1},
		{Name: "签字笔套装", Category: "文具", Description: "环保签字笔3支装", PointsPrice: 80, Stock: 200, Status: 1},
		{Name: "环保帆布袋", Category: "生活", Description: "精美图案，可重复使用", PointsPrice: 150, Stock: 50, Status: 1},
		{Name: "保温杯", Category: "生活", Description: "不锈钢保温杯，保温效果好", PointsPrice: 300, Stock: 30, Status: 1},
	}
	DB.Create(&products)
}

func seedBinData() {
	var count int64
	DB.Model(&models.TrashBin{}).Count(&count)
	if count > 0 {
		return
	}
	
	bins := []models.TrashBin{
		{Name: "教学楼A栋垃圾桶", Location: "教学楼A栋一楼大厅", Status: 1, Capacity: 50.0},
		{Name: "图书馆垃圾桶", Location: "图书馆入口处", Status: 1, Capacity: 50.0},
		{Name: "宿舍1号楼垃圾桶", Location: "1号楼宿舍楼下", Status: 1, Capacity: 50.0},
	}
	DB.Create(&bins)
}
