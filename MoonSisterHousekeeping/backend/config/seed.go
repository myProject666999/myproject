package config

import (
	"golang.org/x/crypto/bcrypt"
	"moonsister/models"
)

func SeedData() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count > 0 {
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)

	users := []models.User{
		{Username: "admin", Password: string(hashedPassword), Role: "admin", Name: "系统管理员"},
		{Username: "customer1", Password: string(hashedPassword), Role: "customer", Name: "张女士"},
		{Username: "nanny1", Password: string(hashedPassword), Role: "nanny", Name: "李阿姨"},
	}
	DB.Create(&users)

	skillTags := []models.SkillTag{
		{Name: "新生儿护理", Description: "专业新生儿护理技能"},
		{Name: "产妇护理", Description: "产后恢复与护理"},
		{Name: "早教启蒙", Description: "婴幼儿早期教育"},
		{Name: "催乳按摩", Description: "专业催乳服务"},
		{Name: "营养配餐", Description: "月子餐制作"},
		{Name: "心理疏导", Description: "产后心理辅导"},
	}
	DB.Create(&skillTags)

	nannies := []models.Nanny{
		{
			UserID: 3, Level: "高级", Experience: 5, Age: 35, Status: "available",
			Description: "从业5年，经验丰富，擅长新生儿护理和产妇护理",
			VideoResume: "https://example.com/video1.mp4",
			Rating: 4.8,
		},
	}
	DB.Create(&nannies)

	var nanny2User models.User
	DB.Where("username = ?", "nanny2").First(&nanny2User)
	if nanny2User.ID == 0 {
		hashedPassword2, _ := bcrypt.GenerateFromPassword([]byte("123456"), bcrypt.DefaultCost)
		nanny2User = models.User{
			Username: "nanny2", Password: string(hashedPassword2),
			Role: "nanny", Name: "王阿姨",
		}
		DB.Create(&nanny2User)
	}

	nanny2 := models.Nanny{
		UserID: nanny2User.ID, Level: "中级", Experience: 3, Age: 42,
		Status: "available",
		Description: "专业月嫂，擅长早教启蒙和营养配餐",
		VideoResume: "https://example.com/video2.mp4",
		Rating: 4.5,
	}
	DB.Create(&nanny2)

	customers := []models.Customer{
		{UserID: 2, Phone: "13800138000", Address: "北京市朝阳区"},
	}
	DB.Create(&customers)

	courses := []models.Course{
		{Title: "新生儿护理基础", Description: "学习新生儿日常护理技能", Duration: 120, Price: 299},
		{Title: "产妇产后恢复", Description: "产后身体恢复与护理", Duration: 90, Price: 199},
		{Title: "月子餐制作", Description: "科学营养月子餐", Duration: 60, Price: 149},
		{Title: "婴幼儿早教", Description: "0-1岁早教启蒙", Duration: 150, Price: 399},
	}
	DB.Create(&courses)
}
