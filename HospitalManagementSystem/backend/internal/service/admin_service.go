package service

import (
	"errors"

	"hospital-management-system/internal/dao"
	"hospital-management-system/internal/model"
	"hospital-management-system/pkg/util"
)

type AdminService struct{}

func NewAdminService() *AdminService {
	return &AdminService{}
}

func (s *AdminService) GetUserList(page, pageSize int, keyword string) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	query := dao.DB.Preload("Role").Preload("Department")
	if keyword != "" {
		query = query.Where("name LIKE ? OR username LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	offset := (page - 1) * pageSize
	query.Model(&model.User{}).Count(&total)
	if err := query.Offset(offset).Limit(pageSize).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (s *AdminService) CreateUser(user *model.User) error {
	var count int64
	dao.DB.Model(&model.User{}).Where("username = ?", user.Username).Count(&count)
	if count > 0 {
		return errors.New("用户名已存在")
	}

	hashedPassword, err := util.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	return dao.DB.Create(user).Error
}

func (s *AdminService) UpdateUser(user *model.User) error {
	if user.Password != "" {
		hashedPassword, err := util.HashPassword(user.Password)
		if err != nil {
			return err
		}
		user.Password = hashedPassword
		return dao.DB.Save(user).Error
	}
	return dao.DB.Omit("password").Save(user).Error
}

func (s *AdminService) DeleteUser(id uint) error {
	return dao.DB.Delete(&model.User{}, id).Error
}

func (s *AdminService) GetDepartmentList() ([]model.Department, error) {
	var departments []model.Department
	if err := dao.DB.Where("status = 1").Find(&departments).Error; err != nil {
		return nil, err
	}
	return departments, nil
}

func (s *AdminService) CreateDepartment(department *model.Department) error {
	return dao.DB.Create(department).Error
}

func (s *AdminService) UpdateDepartment(department *model.Department) error {
	return dao.DB.Save(department).Error
}

func (s *AdminService) DeleteDepartment(id uint) error {
	return dao.DB.Delete(&model.Department{}, id).Error
}

func (s *AdminService) GetRoleList() ([]model.Role, error) {
	var roles []model.Role
	if err := dao.DB.Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (s *AdminService) GetRegistrationLevelList() ([]model.RegistrationLevel, error) {
	var levels []model.RegistrationLevel
	if err := dao.DB.Where("status = 1").Find(&levels).Error; err != nil {
		return nil, err
	}
	return levels, nil
}

func (s *AdminService) CreateRegistrationLevel(level *model.RegistrationLevel) error {
	return dao.DB.Create(level).Error
}

func (s *AdminService) UpdateRegistrationLevel(level *model.RegistrationLevel) error {
	return dao.DB.Save(level).Error
}

func (s *AdminService) DeleteRegistrationLevel(id uint) error {
	return dao.DB.Delete(&model.RegistrationLevel{}, id).Error
}

func (s *AdminService) GetSettlementCategoryList() ([]model.SettlementCategory, error) {
	var categories []model.SettlementCategory
	if err := dao.DB.Where("status = 1").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}

func (s *AdminService) CreateSettlementCategory(category *model.SettlementCategory) error {
	return dao.DB.Create(category).Error
}

func (s *AdminService) UpdateSettlementCategory(category *model.SettlementCategory) error {
	return dao.DB.Save(category).Error
}

func (s *AdminService) DeleteSettlementCategory(id uint) error {
	return dao.DB.Delete(&model.SettlementCategory{}, id).Error
}

func (s *AdminService) GetDiagnosisCatalogList(page, pageSize int, keyword string) ([]model.DiagnosisCatalog, int64, error) {
	var items []model.DiagnosisCatalog
	var total int64

	query := dao.DB.Model(&model.DiagnosisCatalog{}).Where("status = 1")
	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (s *AdminService) CreateDiagnosisCatalog(item *model.DiagnosisCatalog) error {
	return dao.DB.Create(item).Error
}

func (s *AdminService) UpdateDiagnosisCatalog(item *model.DiagnosisCatalog) error {
	return dao.DB.Save(item).Error
}

func (s *AdminService) DeleteDiagnosisCatalog(id uint) error {
	return dao.DB.Delete(&model.DiagnosisCatalog{}, id).Error
}

func (s *AdminService) GetChargeItemList(page, pageSize int, keyword string) ([]model.ChargeItem, int64, error) {
	var items []model.ChargeItem
	var total int64

	query := dao.DB.Model(&model.ChargeItem{}).Where("status = 1")
	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (s *AdminService) CreateChargeItem(item *model.ChargeItem) error {
	return dao.DB.Create(item).Error
}

func (s *AdminService) UpdateChargeItem(item *model.ChargeItem) error {
	return dao.DB.Save(item).Error
}

func (s *AdminService) DeleteChargeItem(id uint) error {
	return dao.DB.Delete(&model.ChargeItem{}, id).Error
}

func (s *AdminService) GetMedicineList(page, pageSize int, keyword string, mType int) ([]model.Medicine, int64, error) {
	var items []model.Medicine
	var total int64

	query := dao.DB.Model(&model.Medicine{}).Where("status = 1")
	if mType > 0 {
		query = query.Where("type = ?", mType)
	}
	if keyword != "" {
		query = query.Where("name LIKE ? OR pinyin_code LIKE ? OR code LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	query.Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Find(&items).Error; err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func (s *AdminService) CreateMedicine(item *model.Medicine) error {
	return dao.DB.Create(item).Error
}

func (s *AdminService) UpdateMedicine(item *model.Medicine) error {
	return dao.DB.Save(item).Error
}

func (s *AdminService) DeleteMedicine(id uint) error {
	return dao.DB.Delete(&model.Medicine{}, id).Error
}

func (s *AdminService) GetExpenseSubjectList() ([]model.ExpenseSubject, error) {
	var items []model.ExpenseSubject
	if err := dao.DB.Where("status = 1").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (s *AdminService) CreateExpenseSubject(item *model.ExpenseSubject) error {
	return dao.DB.Create(item).Error
}

func (s *AdminService) UpdateExpenseSubject(item *model.ExpenseSubject) error {
	return dao.DB.Save(item).Error
}

func (s *AdminService) DeleteExpenseSubject(id uint) error {
	return dao.DB.Delete(&model.ExpenseSubject{}, id).Error
}

func (s *AdminService) GetDoctorScheduleList(page, pageSize int, doctorID uint, date string) ([]model.DoctorSchedule, int64, error) {
	var schedules []model.DoctorSchedule
	var total int64

	query := dao.DB.Preload("Doctor").Preload("Department").Preload("RegistrationLevel")
	if doctorID > 0 {
		query = query.Where("doctor_id = ?", doctorID)
	}
	if date != "" {
		query = query.Where("date = ?", date)
	}

	query.Model(&model.DoctorSchedule{}).Count(&total)
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("date desc").Find(&schedules).Error; err != nil {
		return nil, 0, err
	}

	return schedules, total, nil
}

func (s *AdminService) CreateDoctorSchedule(schedule *model.DoctorSchedule) error {
	return dao.DB.Create(schedule).Error
}

func (s *AdminService) UpdateDoctorSchedule(schedule *model.DoctorSchedule) error {
	return dao.DB.Save(schedule).Error
}

func (s *AdminService) DeleteDoctorSchedule(id uint) error {
	return dao.DB.Delete(&model.DoctorSchedule{}, id).Error
}
