package database

import (
	"fmt"
	"log"
	"time"

	"power-team-management/config"
	"power-team-management/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort)

	tempDB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}

	tempDB.Exec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", cfg.DBName))

	dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")

	DB.AutoMigrate(
		&models.Organization{},
		&models.User{},
		&models.RoleModel{},
		&models.Menu{},
		&models.Permission{},
		&models.Customer{},
		&models.Contact{},
		&models.Opportunity{},
		&models.DailyReport{},
	)

	log.Println("Database migrated successfully")

	seedData()
}

func seedData() {
	var adminRole models.RoleModel
	if err := DB.Where("code = ?", "admin").First(&adminRole).Error; err != nil {
		adminRole = models.RoleModel{
			Name:        "管理员",
			Code:        "admin",
			Description: "系统管理员，拥有所有权限",
		}
		DB.Create(&adminRole)
	}

	var salesManagerRole models.RoleModel
	if err := DB.Where("code = ?", "sales_manager").First(&salesManagerRole).Error; err != nil {
		salesManagerRole = models.RoleModel{
			Name:        "销售主管",
			Code:        "sales_manager",
			Description: "销售主管，管理销售团队",
		}
		DB.Create(&salesManagerRole)
	}

	var salesRole models.RoleModel
	if err := DB.Where("code = ?", "salesperson").First(&salesRole).Error; err != nil {
		salesRole = models.RoleModel{
			Name:        "普通销售",
			Code:        "salesperson",
			Description: "普通销售人员",
		}
		DB.Create(&salesRole)
	}

	var org models.Organization
	if err := DB.Where("name = ?", "总公司").First(&org).Error; err != nil {
		org = models.Organization{
			Name: "总公司",
		}
		DB.Create(&org)
	}

	var adminUser models.User
	if err := DB.Where("username = ?", "admin").First(&adminUser).Error; err != nil {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		orgID := org.ID
		adminUser = models.User{
			Username:       "admin",
			Password:       string(hashedPassword),
			RealName:       "系统管理员",
			Email:          "admin@example.com",
			Phone:          "13800138000",
			RoleID:         adminRole.ID,
			OrganizationID: &orgID,
		}
		DB.Create(&adminUser)
		log.Println("Default admin user created: admin / admin123")
	}

	seedMenus()
	seedDemoData(adminRole.ID, salesManagerRole.ID, salesRole.ID, org.ID, adminUser.ID)
	seedPermissions()
}

func seedPermissions() {
	var count int64
	DB.Model(&models.Permission{}).Count(&count)
	if count > 0 {
		return
	}

	permissions := []models.Permission{
		{Name: "查看用户列表", Code: "user:list", Description: "查看用户管理列表"},
		{Name: "新增用户", Code: "user:create", Description: "创建新用户"},
		{Name: "编辑用户", Code: "user:update", Description: "修改用户信息"},
		{Name: "删除用户", Code: "user:delete", Description: "删除用户"},
		{Name: "查看角色列表", Code: "role:list", Description: "查看角色管理列表"},
		{Name: "新增角色", Code: "role:create", Description: "创建新角色"},
		{Name: "编辑角色", Code: "role:update", Description: "修改角色信息"},
		{Name: "删除角色", Code: "role:delete", Description: "删除角色"},
		{Name: "查看菜单列表", Code: "menu:list", Description: "查看菜单管理列表"},
		{Name: "新增菜单", Code: "menu:create", Description: "创建新菜单"},
		{Name: "编辑菜单", Code: "menu:update", Description: "修改菜单信息"},
		{Name: "删除菜单", Code: "menu:delete", Description: "删除菜单"},
		{Name: "查看权限列表", Code: "permission:list", Description: "查看权限管理列表"},
		{Name: "新增权限", Code: "permission:create", Description: "创建新权限"},
		{Name: "编辑权限", Code: "permission:update", Description: "修改权限信息"},
		{Name: "删除权限", Code: "permission:delete", Description: "删除权限"},
		{Name: "查看业务机会", Code: "opportunity:list", Description: "查看业务机会列表"},
		{Name: "新增业务机会", Code: "opportunity:create", Description: "创建业务机会"},
		{Name: "编辑业务机会", Code: "opportunity:update", Description: "修改业务机会"},
		{Name: "删除业务机会", Code: "opportunity:delete", Description: "删除业务机会"},
		{Name: "查看客户", Code: "customer:list", Description: "查看客户列表"},
		{Name: "新增客户", Code: "customer:create", Description: "创建客户"},
		{Name: "编辑客户", Code: "customer:update", Description: "修改客户信息"},
		{Name: "删除客户", Code: "customer:delete", Description: "删除客户"},
		{Name: "查看日报", Code: "report:view", Description: "查看日报"},
		{Name: "提交日报", Code: "report:submit", Description: "提交日报"},
	}
	DB.Create(&permissions)

	log.Println("Permissions seeded successfully")
}

func seedMenus() {
	menus := []models.Menu{
		{Name: "看板", Path: "/dashboard", Icon: "dashboard", Sort: 1},
		{Name: "业务机会", Path: "/opportunities", Icon: "briefcase", Sort: 2},
		{Name: "客户管理", Path: "/customers", Icon: "users", Sort: 3},
		{Name: "联系人", Path: "/contacts", Icon: "contact", Sort: 4},
		{Name: "我的日报", Path: "/daily-report", Icon: "file-text", Sort: 5},
		{Name: "团队日报", Path: "/team-reports", Icon: "team", Sort: 6},
		{Name: "组织架构", Path: "/organization", Icon: "apartment", Sort: 7},
		{Name: "系统管理", Path: "/system", Icon: "settings", Sort: 100},
	}

	for _, menu := range menus {
		var existing models.Menu
		if err := DB.Where("path = ?", menu.Path).First(&existing).Error; err != nil {
			DB.Create(&menu)
		}
	}

	var systemMenu models.Menu
	DB.Where("path = ?", "/system").First(&systemMenu)

	subMenus := []models.Menu{
		{Name: "用户管理", Path: "/system/users", Icon: "user", ParentID: &systemMenu.ID, Sort: 1},
		{Name: "角色管理", Path: "/system/roles", Icon: "shield", ParentID: &systemMenu.ID, Sort: 2},
		{Name: "菜单管理", Path: "/system/menus", Icon: "menu", ParentID: &systemMenu.ID, Sort: 3},
		{Name: "权限管理", Path: "/system/permissions", Icon: "lock", ParentID: &systemMenu.ID, Sort: 4},
	}

	for _, menu := range subMenus {
		var existing models.Menu
		if err := DB.Where("path = ?", menu.Path).First(&existing).Error; err != nil {
			DB.Create(&menu)
		}
	}
}

func seedDemoData(adminRoleID, managerRoleID, salesRoleID, orgID uint, adminUserID uint) {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 2 {
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)

	manager := models.User{
		Username:       "manager",
		Password:       string(hashedPassword),
		RealName:       "张主管",
		Email:          "manager@example.com",
		Phone:          "13800138001",
		RoleID:         managerRoleID,
		OrganizationID: &orgID,
	}
	DB.Create(&manager)

	sales1 := models.User{
		Username:       "sales1",
		Password:       string(hashedPassword),
		RealName:       "李销售",
		Email:          "sales1@example.com",
		Phone:          "13800138002",
		RoleID:         salesRoleID,
		OrganizationID: &orgID,
	}
	DB.Create(&sales1)

	sales2 := models.User{
		Username:       "sales2",
		Password:       string(hashedPassword),
		RealName:       "王销售",
		Email:          "sales2@example.com",
		Phone:          "13800138003",
		RoleID:         salesRoleID,
		OrganizationID: &orgID,
	}
	DB.Create(&sales2)

	customers := []models.Customer{
		{Name: "华为技术有限公司", Company: "华为技术有限公司", Industry: "通信设备", Address: "广东省深圳市", Website: "www.huawei.com", CreatedBy: adminUserID},
		{Name: "阿里巴巴集团", Company: "阿里巴巴集团", Industry: "电子商务", Address: "浙江省杭州市", Website: "www.alibaba.com", CreatedBy: adminUserID},
		{Name: "腾讯科技", Company: "腾讯科技有限公司", Industry: "互联网", Address: "广东省深圳市", Website: "www.tencent.com", CreatedBy: adminUserID},
		{Name: "字节跳动", Company: "字节跳动有限公司", Industry: "互联网", Address: "北京市", Website: "www.bytedance.com", CreatedBy: adminUserID},
	}
	DB.Create(&customers)

	closeDate1 := time.Now().AddDate(0, 0, 5)
	closeDate2 := time.Now().AddDate(0, 0, 10)
	closeDate3 := time.Now().AddDate(0, 0, 15)
	closeDate4 := time.Now().AddDate(0, 0, 20)

	opportunities := []models.Opportunity{
		{Name: "华为企业软件采购项目", CustomerID: 1, Status: models.StatusCommercial, Amount: 5000000, Probability: 80, ExpectedClose: &closeDate1, Description: "企业级管理软件采购", AssignedToID: sales1.ID, CreatedByID: adminUserID},
		{Name: "阿里云计算服务续约", CustomerID: 2, Status: models.StatusNegotiation, Amount: 2000000, Probability: 60, ExpectedClose: &closeDate2, Description: "云计算服务年度续约", AssignedToID: sales2.ID, CreatedByID: adminUserID},
		{Name: "腾讯内部管理系统", CustomerID: 3, Status: models.StatusRequirement, Amount: 8000000, Probability: 40, ExpectedClose: &closeDate3, Description: "企业内部管理系统定制开发", AssignedToID: sales1.ID, CreatedByID: adminUserID},
		{Name: "字节跳动数据分析平台", CustomerID: 4, Status: models.StatusInitial, Amount: 3000000, Probability: 20, ExpectedClose: &closeDate4, Description: "大数据分析平台建设", AssignedToID: sales2.ID, CreatedByID: adminUserID},
		{Name: "华为新业务合作", CustomerID: 1, Status: models.StatusNew, Amount: 10000000, Probability: 10, AssignedToID: manager.ID, CreatedByID: adminUserID},
		{Name: "阿里安全系统升级", CustomerID: 2, Status: models.StatusCompleted, Amount: 1500000, Probability: 100, AssignedToID: sales1.ID, CreatedByID: adminUserID},
	}
	DB.Create(&opportunities)

	contacts := []models.Contact{
		{CustomerID: 1, Name: "张经理", Position: "采购部经理", Phone: "13900000001", Email: "zhang@huawei.com", IsPrimary: true},
		{CustomerID: 1, Name: "李工", Position: "技术工程师", Phone: "13900000002", Email: "li@huawei.com"},
		{CustomerID: 2, Name: "王总", Position: "CTO", Phone: "13900000003", Email: "wang@alibaba.com", IsPrimary: true},
		{CustomerID: 3, Name: "赵总监", Position: "IT总监", Phone: "13900000004", Email: "zhao@tencent.com", IsPrimary: true},
	}
	DB.Create(&contacts)

	today := time.Now()
	yesterday := today.AddDate(0, 0, -1)

	reports := []models.DailyReport{
		{UserID: adminUserID, ReportDate: yesterday, Content: "系统维护和检查", WorkProgress: "系统运行正常", PlanTomorrow: "准备系统升级计划", Problems: "暂无"},
		{UserID: adminUserID, ReportDate: today, Content: "用户权限配置", WorkProgress: "完成角色权限设置", PlanTomorrow: "优化菜单配置", Problems: "需要审核新权限方案"},
		{UserID: sales1.ID, ReportDate: yesterday, Content: "拜访华为客户，讨论项目需求", WorkProgress: "需求收集阶段，进展顺利", PlanTomorrow: "继续跟进需求细节", Problems: "客户对预算有疑虑"},
		{UserID: sales1.ID, ReportDate: today, Content: "准备项目报价方案", WorkProgress: "报价方案已完成80%", PlanTomorrow: "提交报价给客户", Problems: "需要技术部门配合"},
		{UserID: sales2.ID, ReportDate: yesterday, Content: "与阿里客户电话沟通", WorkProgress: "客户对方案表示兴趣", PlanTomorrow: "安排现场演示", Problems: ""},
		{UserID: sales2.ID, ReportDate: today, Content: "准备演示材料", WorkProgress: "PPT已完成", PlanTomorrow: "进行产品演示", Problems: "需要确认演示环境"},
		{UserID: manager.ID, ReportDate: today, Content: "团队周会，制定本周目标", WorkProgress: "团队目标已确定", PlanTomorrow: "检查各项目进展", Problems: "部分项目进度滞后"},
	}
	DB.Create(&reports)

	log.Println("Demo data seeded successfully")
}
