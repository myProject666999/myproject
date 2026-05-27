package database

import (
	"portfolio/config"
	"portfolio/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Init() error {
	var err error
	DB, err = gorm.Open(sqlite.Open("portfolio.db"), &gorm.Config{})
	if err != nil {
		return err
	}

	if err := DB.AutoMigrate(
		&models.Category{},
		&models.Project{},
		&models.Skill{},
		&models.About{},
		&models.Contact{},
		&models.Admin{},
	); err != nil {
		return err
	}

	var adminCount int64
	DB.Model(&models.Admin{}).Count(&adminCount)
	if adminCount == 0 {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(config.App.AdminPassword), bcrypt.DefaultCost)
		if err == nil {
			admin := models.Admin{
				Username: config.App.AdminUsername,
				Password: string(hashedPassword),
			}
			DB.Create(&admin)
		}
	}

	return nil
}
