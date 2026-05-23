package service

import (
	"errors"
	"internal-device-discovery/internal/model"
	"internal-device-discovery/internal/oui"
	"time"

	"gorm.io/gorm"
)

type DeviceService struct {
	db *gorm.DB
}

func NewDeviceService(db *gorm.DB) *DeviceService {
	return &DeviceService{db: db}
}

type ListOptions struct {
	Keyword  string
	Status   string
	Vendor   string
	Page     int
	PageSize int
}

func (s *DeviceService) List(opts ListOptions) ([]model.Device, int64, error) {
	if opts.Page <= 0 {
		opts.Page = 1
	}
	if opts.PageSize <= 0 {
		opts.PageSize = 50
	}
	q := s.db.Model(&model.Device{})
	if opts.Keyword != "" {
		k := "%" + opts.Keyword + "%"
		q = q.Where("ip LIKE ? OR mac LIKE ? OR name LIKE ? OR vendor LIKE ? OR hostname LIKE ?", k, k, k, k, k)
	}
	if opts.Status != "" {
		q = q.Where("status = ?", opts.Status)
	}
	if opts.Vendor != "" {
		q = q.Where("vendor = ?", opts.Vendor)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var items []model.Device
	err := q.Order("last_seen_at DESC").
		Offset((opts.Page - 1) * opts.PageSize).
		Limit(opts.PageSize).
		Find(&items).Error
	return items, total, err
}

func (s *DeviceService) Get(id uint) (*model.Device, error) {
	var d model.Device
	if err := s.db.First(&d, id).Error; err != nil {
		return nil, err
	}
	return &d, nil
}

func (s *DeviceService) Update(id uint, name, note *string) (*model.Device, error) {
	d, err := s.Get(id)
	if err != nil {
		return nil, err
	}
	if name != nil {
		d.Name = *name
	}
	if note != nil {
		d.Note = *note
	}
	if err := s.db.Save(d).Error; err != nil {
		return nil, err
	}
	return d, nil
}

func (s *DeviceService) Delete(id uint) error {
	return s.db.Delete(&model.Device{}, id).Error
}

func (s *DeviceService) BatchDelete(ids []uint) error {
	return s.db.Where("id IN ?", ids).Delete(&model.Device{}).Error
}

func (s *DeviceService) Vendors() ([]string, error) {
	var v []string
	err := s.db.Model(&model.Device{}).Distinct("vendor").
		Where("vendor IS NOT NULL AND vendor <> ''").
		Pluck("vendor", &v).Error
	return v, err
}

// UpsertScanResult creates or updates a device from a scan result.
func (s *DeviceService) UpsertScanResult(ip, mac, vendor, hostname, cidr string) (*model.Device, error) {
	if ip == "" {
		return nil, errors.New("ip is required")
	}
	if vendor == "" && mac != "" {
		vendor = oui.Lookup(mac)
	}
	var existing model.Device
	err := s.db.Where("ip = ? AND mac = ?", ip, mac).First(&existing).Error
	now := time.Now()
	if err == nil {
		existing.LastSeenAt = now
		existing.Status = "online"
		if vendor != "" && existing.Vendor == "" {
			existing.Vendor = vendor
		}
		if hostname != "" {
			existing.Hostname = hostname
		}
		if err := s.db.Save(&existing).Error; err != nil {
			return nil, err
		}
		s.db.Create(&model.ScanLog{DeviceID: existing.ID, ScannedAt: now, CIDR: cidr})
		return &existing, nil
	}
	d := model.Device{
		IP:          ip,
		MAC:         mac,
		Vendor:      vendor,
		Hostname:    hostname,
		Status:      "online",
		FirstSeenAt: now,
		LastSeenAt:  now,
	}
	if err := s.db.Create(&d).Error; err != nil {
		return nil, err
	}
	s.db.Create(&model.ScanLog{DeviceID: d.ID, ScannedAt: now, CIDR: cidr})
	return &d, nil
}

// MarkAllOffline sets status=offline for devices not seen in the given cidr scan (used after scan).
func (s *DeviceService) MarkAllOffline() error {
	return s.db.Model(&model.Device{}).Where("1 = 1").Update("status", "offline").Error
}
