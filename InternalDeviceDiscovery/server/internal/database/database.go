package database

import (
	"internal-device-discovery/internal/model"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func Open(path string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	if err := db.AutoMigrate(&model.Device{}, &model.ScanLog{}, &model.OUI{}); err != nil {
		return nil, err
	}
	return db, nil
}
