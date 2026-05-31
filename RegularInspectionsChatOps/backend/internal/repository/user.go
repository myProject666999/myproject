package repository

import (
	"inspection-chatops/internal/model"
	"inspection-chatops/pkg/mysql"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (r *UserRepository) GetByUsername(username string) (*model.User, error) {
	var user model.User
	err := mysql.DB.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *UserRepository) GetByID(id uint64) (*model.User, error) {
	var user model.User
	err := mysql.DB.First(&user, id).Error
	return &user, err
}

func (r *UserRepository) Create(user *model.User) error {
	return mysql.DB.Create(user).Error
}

func (r *UserRepository) Update(user *model.User) error {
	return mysql.DB.Save(user).Error
}

func (r *UserRepository) List(page, pageSize int) ([]model.User, int64, error) {
	var users []model.User
	var total int64

	err := mysql.DB.Model(&model.User{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = mysql.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&users).Error
	return users, total, err
}

type RobotRepository struct{}

func NewRobotRepository() *RobotRepository {
	return &RobotRepository{}
}

func (r *RobotRepository) Create(robot *model.RobotConfig) error {
	return mysql.DB.Create(robot).Error
}

func (r *RobotRepository) GetByID(id uint64) (*model.RobotConfig, error) {
	var robot model.RobotConfig
	err := mysql.DB.First(&robot, id).Error
	return &robot, err
}

func (r *RobotRepository) Update(robot *model.RobotConfig) error {
	return mysql.DB.Save(robot).Error
}

func (r *RobotRepository) Delete(id uint64) error {
	return mysql.DB.Delete(&model.RobotConfig{}, id).Error
}

func (r *RobotRepository) List(page, pageSize int) ([]model.RobotConfig, int64, error) {
	var robots []model.RobotConfig
	var total int64

	err := mysql.DB.Model(&model.RobotConfig{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = mysql.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&robots).Error
	return robots, total, err
}

func (r *RobotRepository) GetDefault() (*model.RobotConfig, error) {
	var robot model.RobotConfig
	err := mysql.DB.Where("is_default = ? AND status = ?", 1, 1).First(&robot).Error
	return &robot, err
}

func (r *RobotRepository) GetAllEnabled() ([]model.RobotConfig, error) {
	var robots []model.RobotConfig
	err := mysql.DB.Where("status = ?", 1).Find(&robots).Error
	return robots, err
}

type PlanRepository struct{}

func NewPlanRepository() *PlanRepository {
	return &PlanRepository{}
}

func (r *PlanRepository) Create(plan *model.Plan) error {
	return mysql.DB.Create(plan).Error
}

func (r *PlanRepository) GetByID(id uint64) (*model.Plan, error) {
	var plan model.Plan
	err := mysql.DB.First(&plan, id).Error
	return &plan, err
}

func (r *PlanRepository) GetByCommand(command string) (*model.Plan, error) {
	var plan model.Plan
	err := mysql.DB.Where("command = ? AND status = ?", command, 1).First(&plan).Error
	return &plan, err
}

func (r *PlanRepository) Update(plan *model.Plan) error {
	return mysql.DB.Save(plan).Error
}

func (r *PlanRepository) Delete(id uint64) error {
	return mysql.DB.Delete(&model.Plan{}, id).Error
}

func (r *PlanRepository) List(page, pageSize int) ([]model.Plan, int64, error) {
	var plans []model.Plan
	var total int64

	err := mysql.DB.Model(&model.Plan{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = mysql.DB.Offset(offset).Limit(pageSize).Order("id DESC").Find(&plans).Error
	return plans, total, err
}

type AuditRepository struct{}

func NewAuditRepository() *AuditRepository {
	return &AuditRepository{}
}

func (r *AuditRepository) Create(audit *model.CommandAudit) error {
	return mysql.DB.Create(audit).Error
}

func (r *AuditRepository) Update(audit *model.CommandAudit) error {
	return mysql.DB.Save(audit).Error
}

func (r *AuditRepository) List(page, pageSize int, userID uint64, status int8) ([]model.CommandAudit, int64, error) {
	var audits []model.CommandAudit
	var total int64

	query := mysql.DB.Model(&model.CommandAudit{})

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}

	if status >= 0 {
		query = query.Where("status = ?", status)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err = query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&audits).Error
	return audits, total, err
}
