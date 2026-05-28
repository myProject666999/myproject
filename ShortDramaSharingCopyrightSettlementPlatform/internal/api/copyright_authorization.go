package api

import (
	"short-drama-platform/internal/api/middleware"
	"short-drama-platform/internal/dao"
	"short-drama-platform/internal/model"
	"short-drama-platform/pkg/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CreateAuthorizationRequest struct {
	DramaID           uint64 `json:"drama_id" binding:"required"`
	AuthorizerID      uint64 `json:"authorizer_id" binding:"required"`
	LicenseeID        uint64 `json:"licensee_id" binding:"required"`
	AuthorizationType int8   `json:"authorization_type" binding:"required"`
	AuthorizationScope string `json:"authorization_scope" binding:"required"`
	RightsType        string `json:"rights_type" binding:"required"`
	EffectiveDate     string `json:"effective_date" binding:"required"`
	ExpireDate        string `json:"expire_date" binding:"required"`
	AuthorizationFee  float64 `json:"authorization_fee"`
	ContractNo        string `json:"contract_no"`
	Remark            string `json:"remark"`
}

func CreateCopyrightAuthorization(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateAuthorizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	effectiveDate, err := time.Parse("2006-01-02", req.EffectiveDate)
	if err != nil {
		utils.Error(c, "生效日期格式错误，请使用 YYYY-MM-DD")
		return
	}

	expireDate, err := time.Parse("2006-01-02", req.ExpireDate)
	if err != nil {
		utils.Error(c, "失效日期格式错误，请使用 YYYY-MM-DD")
		return
	}

	if expireDate.Before(effectiveDate) {
		utils.Error(c, "失效日期不能早于生效日期")
		return
	}

	conflict, err := checkAuthorizationConflict(req.DramaID, req.LicenseeID, effectiveDate, expireDate)
	if err != nil {
		utils.Error(c, "检查授权冲突失败: "+err.Error())
		return
	}
	if conflict {
		utils.Error(c, "存在冲突的授权记录")
		return
	}

	status := int8(0)
	now := time.Now()
	if now.After(effectiveDate) && now.Before(expireDate) {
		status = 1
	} else if now.After(expireDate) {
		status = 2
	}

	authorization := &model.CopyrightAuthorization{
		AuthorizationNo:   utils.GenerateNo("AUTH"),
		DramaID:           req.DramaID,
		AuthorizerID:      req.AuthorizerID,
		LicenseeID:        req.LicenseeID,
		AuthorizationType: req.AuthorizationType,
		AuthorizationScope: req.AuthorizationScope,
		RightsType:        req.RightsType,
		EffectiveDate:     effectiveDate,
		ExpireDate:        expireDate,
		AuthorizationFee:  req.AuthorizationFee,
		ContractNo:        req.ContractNo,
		Status:            status,
		Remark:            req.Remark,
		CreatedBy:         userID.(uint64),
	}

	if err := dao.DB.Create(authorization).Error; err != nil {
		utils.Error(c, "创建授权记录失败: "+err.Error())
		return
	}

	utils.Success(c, authorization)
}

func checkAuthorizationConflict(dramaID, licenseeID uint64, effectiveDate, expireDate time.Time) (bool, error) {
	var count int64
	err := dao.DB.Model(&model.CopyrightAuthorization{}).
		Where("drama_id = ? AND licensee_id = ? AND status IN (0, 1)", dramaID, licenseeID).
		Where("(effective_date <= ? AND expire_date >= ?) OR (effective_date <= ? AND expire_date >= ?)",
			expireDate, effectiveDate, effectiveDate, effectiveDate).
		Count(&count).Error
	return count > 0, err
}

func GetCopyrightAuthorization(c *gin.Context) {
	id := c.Param("id")

	var authorization model.CopyrightAuthorization
	if err := dao.DB.First(&authorization, id).Error; err != nil {
		utils.Error(c, "授权记录不存在")
		return
	}

	utils.Success(c, authorization)
}

func ListCopyrightAuthorizations(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	dramaID := c.Query("drama_id")
	authorizerID := c.Query("authorizer_id")
	licenseeID := c.Query("licensee_id")
	status := c.Query("status")

	query := dao.DB.Model(&model.CopyrightAuthorization{})

	if dramaID != "" {
		query = query.Where("drama_id = ?", dramaID)
	}
	if authorizerID != "" {
		query = query.Where("authorizer_id = ?", authorizerID)
	}
	if licenseeID != "" {
		query = query.Where("licensee_id = ?", licenseeID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var authorizations []model.CopyrightAuthorization
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&authorizations)

	utils.Page(c, authorizations, total, page, pageSize)
}

func RevokeCopyrightAuthorization(c *gin.Context) {
	userID, _ := c.Get("user_id")
	id := c.Param("id")

	var req struct {
		Remark string `json:"remark"`
	}
	c.ShouldBindJSON(&req)

	var authorization model.CopyrightAuthorization
	if err := dao.DB.First(&authorization, id).Error; err != nil {
		utils.Error(c, "授权记录不存在")
		return
	}

	if authorization.Status == 3 {
		utils.Error(c, "授权记录已撤销")
		return
	}

	authorization.Status = 3
	authorization.RevokedAt = time.Now()
	authorization.RevokedBy = userID.(uint64)
	if req.Remark != "" {
		authorization.Remark = authorization.Remark + " | 撤销备注: " + req.Remark
	}

	if err := dao.DB.Save(&authorization).Error; err != nil {
		utils.Error(c, "撤销授权失败: "+err.Error())
		return
	}

	utils.Success(c, authorization)
}

func CheckAuthorizationConflict(c *gin.Context) {
	dramaID, _ := strconv.ParseUint(c.Query("drama_id"), 10, 64)
	licenseeID, _ := strconv.ParseUint(c.Query("licensee_id"), 10, 64)
	effectiveDate, _ := time.Parse("2006-01-02", c.Query("effective_date"))
	expireDate, _ := time.Parse("2006-01-02", c.Query("expire_date"))

	if dramaID == 0 || licenseeID == 0 || effectiveDate.IsZero() || expireDate.IsZero() {
		utils.Error(c, "参数不完整")
		return
	}

	conflict, err := checkAuthorizationConflict(dramaID, licenseeID, effectiveDate, expireDate)
	if err != nil {
		utils.Error(c, "检查冲突失败: "+err.Error())
		return
	}

	utils.Success(c, gin.H{"has_conflict": conflict})
}

func RegisterCopyrightAuthorizationRoutes(r *gin.Engine) {
	authGroup := r.Group("/api/copyright-authorizations")
	authGroup.Use(middleware.AuthMiddleware())
	{
		authGroup.POST("", middleware.AdminMiddleware(), CreateCopyrightAuthorization)
		authGroup.GET("/:id", GetCopyrightAuthorization)
		authGroup.GET("", ListCopyrightAuthorizations)
		authGroup.POST("/:id/revoke", middleware.AdminMiddleware(), RevokeCopyrightAuthorization)
		authGroup.GET("/check/conflict", CheckAuthorizationConflict)
	}
}
