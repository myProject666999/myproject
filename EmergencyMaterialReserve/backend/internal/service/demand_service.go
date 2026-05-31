package service

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"emergency-material/internal/database"
	"emergency-material/internal/models"
	"emergency-material/pkg/idempotent"

	"gorm.io/gorm"
)

type DemandRequestService struct{}

func NewDemandRequestService() *DemandRequestService {
	return &DemandRequestService{}
}

const (
	DemandStatusDraft          = "draft"
	DemandStatusPendingApproval = "pending_approval"
	DemandStatusApproved       = "approved"
	DemandStatusRejected       = "rejected"
	DemandStatusProcessing     = "processing"
	DemandStatusCompleted      = "completed"
	DemandStatusCancelled      = "cancelled"
)

var demandValidTransitions = map[string][]string{
	DemandStatusDraft:          {DemandStatusPendingApproval, DemandStatusCancelled},
	DemandStatusPendingApproval: {DemandStatusApproved, DemandStatusRejected, DemandStatusCancelled},
	DemandStatusApproved:       {DemandStatusProcessing, DemandStatusCancelled},
	DemandStatusProcessing:     {DemandStatusCompleted},
}

func (s *DemandRequestService) canTransition(currentStatus, targetStatus string) bool {
	validTargets, exists := demandValidTransitions[currentStatus]
	if !exists {
		return false
	}
	for _, t := range validTargets {
		if t == targetStatus {
			return true
		}
	}
	return false
}

func (s *DemandRequestService) generateRequestNo() string {
	now := time.Now()
	return fmt.Sprintf("DR%s%06d", now.Format("20060102150405"), now.UnixNano()%1000000)
}

func (s *DemandRequestService) generateIdempotentKey(requestNo, operation string) string {
	key := fmt.Sprintf("demand:%s:%s", requestNo, operation)
	hash := md5.Sum([]byte(key))
	return hex.EncodeToString(hash[:])
}

type CreateDemandRequestRequest struct {
	Title         string                    `json:"title"`
	Department    string                    `json:"department"`
	EmergencyLevel string                   `json:"emergency_level"`
	Reason        *string                   `json:"reason"`
	DemandDate    *time.Time                `json:"demand_date"`
	Remark        *string                   `json:"remark"`
	Items         []DemandItemRequest       `json:"items"`
	ApplicantID   uint64                    `json:"applicant_id"`
	ApplicantName string                    `json:"applicant_name"`
}

type DemandItemRequest struct {
	MaterialID     uint64  `json:"material_id"`
	DemandQuantity int     `json:"demand_quantity"`
	Remark         *string `json:"remark"`
}

func (s *DemandRequestService) CreateDemandRequest(ctx context.Context, req *CreateDemandRequestRequest) (*models.DemandRequest, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("需求明细不能为空")
	}

	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	requestNo := s.generateRequestNo()
	totalQuantity := 0
	for _, item := range req.Items {
		if item.DemandQuantity <= 0 {
			tx.Rollback()
			return nil, errors.New("需求数量必须大于0")
		}
		var material models.Material
		if err := tx.First(&material, item.MaterialID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("物资ID %d 不存在: %w", item.MaterialID, err)
		}
		totalQuantity += item.DemandQuantity
	}

	request := &models.DemandRequest{
		RequestNo:      requestNo,
		Title:          req.Title,
		Department:     req.Department,
		ApplicantID:    &req.ApplicantID,
		EmergencyLevel: req.EmergencyLevel,
		Reason:         req.Reason,
		Status:         DemandStatusDraft,
		TotalQuantity:  totalQuantity,
		DemandDate:     req.DemandDate,
		Remark:         req.Remark,
	}

	if err := tx.Create(request).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建需求申报失败: %w", err)
	}

	items := make([]models.DemandRequestItem, len(req.Items))
	for i, item := range req.Items {
		items[i] = models.DemandRequestItem{
			RequestID:      request.ID,
			MaterialID:     item.MaterialID,
			DemandQuantity: item.DemandQuantity,
			Remark:         item.Remark,
		}
	}
	if err := tx.Create(&items).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("创建需求明细失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApplicantID, req.ApplicantName, "demand", "create", requestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	request.Items = items
	return request, nil
}

type SubmitDemandRequestRequest struct {
	RequestID     uint64 `json:"request_id"`
	ApplicantID   uint64 `json:"applicant_id"`
	ApplicantName string `json:"applicant_name"`
}

func (s *DemandRequestService) SubmitDemandRequest(ctx context.Context, req *SubmitDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "submit")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复提交")
	}

	if !s.canTransition(request.Status, DemandStatusPendingApproval) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusPendingApproval)
	}

	request.Status = DemandStatusPendingApproval
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApplicantID, req.ApplicantName, "demand", "submit", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type ApproveDemandRequestRequest struct {
	RequestID     uint64                    `json:"request_id"`
	ApproverID    uint64                    `json:"approver_id"`
	ApproverName  string                    `json:"approver_name"`
	ApproveRemark *string                   `json:"approve_remark"`
	Items         []DemandApproveItemRequest `json:"items"`
}

type DemandApproveItemRequest struct {
	ItemID           uint64 `json:"item_id"`
	ApprovedQuantity int    `json:"approved_quantity"`
}

func (s *DemandRequestService) ApproveDemandRequest(ctx context.Context, req *ApproveDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.Preload("Items").First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "approve")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复审批")
	}

	if !s.canTransition(request.Status, DemandStatusApproved) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusApproved)
	}

	itemMap := make(map[uint64]*models.DemandRequestItem)
	for i := range request.Items {
		itemMap[request.Items[i].ID] = &request.Items[i]
	}

	totalApproved := 0
	for _, itemReq := range req.Items {
		item, exists := itemMap[itemReq.ItemID]
		if !exists {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("明细ID %d 不存在", itemReq.ItemID)
		}
		if itemReq.ApprovedQuantity < 0 || itemReq.ApprovedQuantity > item.DemandQuantity {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("审批数量必须在0-%d之间", item.DemandQuantity)
		}

		item.ApprovedQuantity = &itemReq.ApprovedQuantity
		if err := tx.Save(item).Error; err != nil {
			tx.Rollback()
			idempotent.Remove(ctx, idempotentKey)
			return nil, fmt.Errorf("更新明细失败: %w", err)
		}
		totalApproved += itemReq.ApprovedQuantity
	}

	now := time.Now()
	request.Status = DemandStatusApproved
	request.ApproverID = &req.ApproverID
	request.ApproveTime = &now
	request.ApproveRemark = req.ApproveRemark
	request.TotalQuantity = totalApproved
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApproverID, req.ApproverName, "demand", "approve", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type RejectDemandRequestRequest struct {
	RequestID     uint64  `json:"request_id"`
	ApproverID    uint64  `json:"approver_id"`
	ApproverName  string  `json:"approver_name"`
	ApproveRemark *string `json:"approve_remark"`
}

func (s *DemandRequestService) RejectDemandRequest(ctx context.Context, req *RejectDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "reject")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复审批")
	}

	if !s.canTransition(request.Status, DemandStatusRejected) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusRejected)
	}

	now := time.Now()
	request.Status = DemandStatusRejected
	request.ApproverID = &req.ApproverID
	request.ApproveTime = &now
	request.ApproveRemark = req.ApproveRemark
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.ApproverID, req.ApproverName, "demand", "reject", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type CancelDemandRequestRequest struct {
	RequestID     uint64 `json:"request_id"`
	OperatorID    uint64 `json:"operator_id"`
	OperatorName  string `json:"operator_name"`
}

func (s *DemandRequestService) CancelDemandRequest(ctx context.Context, req *CancelDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "cancel")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复取消")
	}

	if !s.canTransition(request.Status, DemandStatusCancelled) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusCancelled)
	}

	request.Status = DemandStatusCancelled
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "demand", "cancel", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type ProcessDemandRequestRequest struct {
	RequestID     uint64 `json:"request_id"`
	OperatorID    uint64 `json:"operator_id"`
	OperatorName  string `json:"operator_name"`
}

func (s *DemandRequestService) ProcessDemandRequest(ctx context.Context, req *ProcessDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "process")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复处理")
	}

	if !s.canTransition(request.Status, DemandStatusProcessing) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusProcessing)
	}

	request.Status = DemandStatusProcessing
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "demand", "process", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type CompleteDemandRequestRequest struct {
	RequestID     uint64 `json:"request_id"`
	OperatorID    uint64 `json:"operator_id"`
	OperatorName  string `json:"operator_name"`
}

func (s *DemandRequestService) CompleteDemandRequest(ctx context.Context, req *CompleteDemandRequestRequest) (*models.DemandRequest, error) {
	tx := database.DB.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var request models.DemandRequest
	if err := tx.First(&request, req.RequestID).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}

	idempotentKey := s.generateIdempotentKey(request.RequestNo, "complete")
	ok, err := idempotent.Check(ctx, idempotentKey)
	if err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("幂等检查失败: %w", err)
	}
	if !ok {
		tx.Rollback()
		return nil, errors.New("重复完成")
	}

	if !s.canTransition(request.Status, DemandStatusCompleted) {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("状态转换不合法: %s -> %s", request.Status, DemandStatusCompleted)
	}

	request.Status = DemandStatusCompleted
	if err := tx.Save(&request).Error; err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("更新需求申报失败: %w", err)
	}

	if err := s.logOperation(ctx, tx, req.OperatorID, req.OperatorName, "demand", "complete", request.RequestNo, request.ID, 1, ""); err != nil {
		tx.Rollback()
		idempotent.Remove(ctx, idempotentKey)
		return nil, fmt.Errorf("记录操作日志失败: %w", err)
	}

	if err := tx.Commit().Error; err != nil {
		idempotent.Remove(ctx, idempotentKey)
		return nil, err
	}

	return &request, nil
}

type DemandRequestQuery struct {
	Page           int      `json:"page"`
	PageSize       int      `json:"page_size"`
	RequestNo      string   `json:"request_no"`
	Status         string   `json:"status"`
	Department     string   `json:"department"`
	EmergencyLevel string   `json:"emergency_level"`
	ApplicantID    *uint64  `json:"applicant_id"`
	StartDate      *string  `json:"start_date"`
	EndDate        *string  `json:"end_date"`
}

type DemandRequestListResponse struct {
	Total int64                    `json:"total"`
	List  []models.DemandRequest   `json:"list"`
}

func (s *DemandRequestService) GetDemandRequestList(ctx context.Context, query *DemandRequestQuery) (*DemandRequestListResponse, error) {
	db := database.DB.Model(&models.DemandRequest{}).
		Preload("Applicant").
		Preload("Approver")

	if query.RequestNo != "" {
		db = db.Where("request_no LIKE ?", "%"+query.RequestNo+"%")
	}
	if query.Status != "" {
		db = db.Where("status = ?", query.Status)
	}
	if query.Department != "" {
		db = db.Where("department LIKE ?", "%"+query.Department+"%")
	}
	if query.EmergencyLevel != "" {
		db = db.Where("emergency_level = ?", query.EmergencyLevel)
	}
	if query.ApplicantID != nil {
		db = db.Where("applicant_id = ?", *query.ApplicantID)
	}
	if query.StartDate != nil {
		db = db.Where("created_at >= ?", *query.StartDate)
	}
	if query.EndDate != nil {
		db = db.Where("created_at <= ?", *query.EndDate)
	}

	var total int64
	if err := db.Count(&total).Error; err != nil {
		return nil, err
	}

	page := query.Page
	if page <= 0 {
		page = 1
	}
	pageSize := query.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var list []models.DemandRequest
	if err := db.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&list).Error; err != nil {
		return nil, err
	}

	return &DemandRequestListResponse{
		Total: total,
		List:  list,
	}, nil
}

func (s *DemandRequestService) GetDemandRequestDetail(ctx context.Context, requestID uint64) (*models.DemandRequest, error) {
	var request models.DemandRequest
	if err := database.DB.
		Preload("Applicant").
		Preload("Approver").
		Preload("Items.Material").
		First(&request, requestID).Error; err != nil {
		return nil, fmt.Errorf("需求申报不存在: %w", err)
	}
	return &request, nil
}

func (s *DemandRequestService) logOperation(ctx context.Context, db *gorm.DB, userID uint64, username, module, operation, bizNo string, bizID uint64, status int8, errorMsg string) error {
	log := &models.OperationLog{
		UserID:    &userID,
		Username:  username,
		Module:    module,
		Operation: operation,
		BizID:     &bizID,
		BizNo:     bizNo,
		Status:    status,
		ErrorMsg:  &errorMsg,
	}
	return db.Create(log).Error
}
