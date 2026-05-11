package main

import (
	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"
	"jingang-hotel-backend/routes"
	"jingang-hotel-backend/utils"
)

func main() {
	config.InitDB()

	config.DB.AutoMigrate(
		&models.User{},
		&models.Admin{},
		&models.RoomType{},
		&models.Room{},
		&models.Order{},
		&models.Review{},
		&models.Product{},
		&models.ProductOrder{},
		&models.PointsRecord{},
	)

	var superAdmin models.Admin
	config.DB.Where("username = ?", "admin").First(&superAdmin)
	if superAdmin.ID == 0 {
		config.DB.Create(&models.Admin{
			Username: "admin",
			Password: utils.HashPassword("123456"),
			RealName: "超级管理员",
			IsSuper:  1,
			Status:   1,
		})
	}

	var roomTypes []models.RoomType
	config.DB.Find(&roomTypes)
	if len(roomTypes) == 0 {
		roomTypes = []models.RoomType{
			{Name: "标准单人间", Description: "温馨舒适，配备基本设施", Price: 198, Capacity: 1, Facilities: "空调,电视,独立卫浴,WiFi"},
			{Name: "标准双人间", Description: "双人入住，温馨舒适", Price: 298, Capacity: 2, Facilities: "空调,电视,独立卫浴,WiFi,2张大床"},
			{Name: "豪华大床房", Description: "宽敞明亮，豪华配置", Price: 398, Capacity: 2, Facilities: "空调,电视,独立卫浴,WiFi,浴缸,迷你吧"},
			{Name: "商务套房", Description: "商务出行首选，办公设备齐全", Price: 598, Capacity: 2, Facilities: "空调,电视,独立卫浴,WiFi,浴缸,办公区,会议室"},
			{Name: "总统套房", Description: "顶级享受，奢华配置", Price: 1298, Capacity: 4, Facilities: "空调,电视,独立卫浴,WiFi,浴缸,私人管家,健身房"},
		}
		for _, rt := range roomTypes {
			config.DB.Create(&rt)
		}

		for i := 1; i <= 5; i++ {
			for j := 1; j <= 10; j++ {
				var roomTypeID uint
				if j <= 2 {
					roomTypeID = 1
				} else if j <= 5 {
					roomTypeID = 2
				} else if j <= 7 {
					roomTypeID = 3
				} else if j <= 9 {
					roomTypeID = 4
				} else {
					roomTypeID = 5
				}

				config.DB.Create(&models.Room{
					RoomNumber: string(rune('A' + i - 1)) + "-" + string(rune('0' + j/10)) + string(rune('0' + j%10)),
					RoomTypeID: roomTypeID,
					Floor:      i,
					Status:     1,
				})
			}
		}
	}

	r := routes.SetupRouter()
	r.Run(":8080")
}
