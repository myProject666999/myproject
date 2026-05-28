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

type DramaCreateRequest struct {
	Title         string    `json:"title" binding:"required"`
	Description   string    `json:"description"`
	CoverURL      string    `json:"cover_url"`
	TotalEpisodes int       `json:"total_episodes"`
	Duration      int       `json:"duration"`
	ReleaseDate   time.Time `json:"release_date"`
}

type DramaUpdateRequest struct {
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	CoverURL      string    `json:"cover_url"`
	TotalEpisodes int       `json:"total_episodes"`
	Duration      int       `json:"duration"`
	ReleaseDate   time.Time `json:"release_date"`
	Status        int8      `json:"status"`
}

func CreateDrama(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req DramaCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	drama := &model.Drama{
		DramaNo:       utils.GenerateNo("DR"),
		Title:           req.Title,
		Description:     req.Description,
		CoverURL:        req.CoverURL,
		TotalEpisodes:   req.TotalEpisodes,
		Duration:        req.Duration,
		ReleaseDate:     req.ReleaseDate,
		Status:          0,
		CreatedBy:       userID.(uint64),
	}

	if err := dao.DB.Create(drama).Error; err != nil {
		utils.Error(c, "创建剧集失败: "+err.Error())
		return
	}

	utils.Success(c, drama)
}

func UpdateDrama(c *gin.Context) {
	id := c.Param("id")
	var req DramaUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	var drama model.Drama
	if err := dao.DB.First(&drama, id).Error; err != nil {
		utils.Error(c, "剧集不存在")
		return
	}

	updates := make(map[string]interface{})
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.CoverURL != "" {
		updates["cover_url"] = req.CoverURL
	}
	if req.TotalEpisodes > 0 {
		updates["total_episodes"] = req.TotalEpisodes
	}
	if req.Duration > 0 {
		updates["duration"] = req.Duration
	}
	if !req.ReleaseDate.IsZero() {
		updates["release_date"] = req.ReleaseDate
	}
	if req.Status >= 0 {
		updates["status"] = req.Status
	}

	if err := dao.DB.Model(&drama).Updates(updates).Error; err != nil {
		utils.Error(c, "更新剧集失败: "+err.Error())
		return
	}

	utils.Success(c, drama)
}

func GetDrama(c *gin.Context) {
	id := c.Param("id")

	var drama model.Drama
	if err := dao.DB.First(&drama, id).Error; err != nil {
		utils.Error(c, "剧集不存在")
		return
	}

	utils.Success(c, drama)
}

func ListDramas(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	keyword := c.Query("keyword")

	query := dao.DB.Model(&model.Drama{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var dramas []model.Drama
	offset := (page - 1) * pageSize
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&dramas)

	utils.Page(c, dramas, total, page, pageSize)
}

func DeleteDrama(c *gin.Context) {
	id := c.Param("id")

	if err := dao.DB.Delete(&model.Drama{}, id).Error; err != nil {
		utils.Error(c, "删除剧集失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

type DramaRightCreateRequest struct {
	DramaID       uint64  `json:"drama_id" binding:"required"`
	StakeholderID uint64  `json:"stakeholder_id" binding:"required"`
	RoleName       string  `json:"role_name"`
	BaseRatio      float64 `json:"base_ratio" binding:"required"`
	EffectiveDate  string  `json:"effective_date"`
	ExpireDate     string  `json:"expire_date"`
	Remark         string  `json:"remark"`
}

func AddDramaRight(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req DramaRightCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, "参数错误: "+err.Error())
		return
	}

	right := &model.DramaRight{
		DramaID:       req.DramaID,
		StakeholderID: req.StakeholderID,
		RoleName:        req.RoleName,
		BaseRatio:       req.BaseRatio,
		IsActive:        1,
		CreatedBy:       userID.(uint64),
	}

	if req.EffectiveDate != "" {
		if t, err := time.Parse("2006-01-02", req.EffectiveDate); err == nil {
			right.EffectiveDate = t
		}
	}
	if req.ExpireDate != "" {
		if t, err := time.Parse("2006-01-02", req.ExpireDate); err == nil {
			right.ExpireDate = t
		}
	}
	right.Remark = req.Remark

	if err := dao.DB.Create(right).Error; err != nil {
		utils.Error(c, "添加权益失败: "+err.Error())
		return
	}

	utils.Success(c, right)
}

func GetDramaRights(c *gin.Context) {
	dramaID := c.Param("drama_id")

	var rights []model.DramaRight
	dao.DB.Where("drama_id = ?", dramaID).Find(&rights)

	utils.Success(c, rights)
}

func RemoveDramaRight(c *gin.Context) {
	id := c.Param("id")

	if err := dao.DB.Delete(&model.DramaRight{}, id).Error; err != nil {
		utils.Error(c, "删除权益失败: "+err.Error())
		return
	}

	utils.Success(c, nil)
}

func RegisterDramaRoutes(r *gin.Engine) {
	dramaGroup := r.Group("/api/dramas")
	dramaGroup.Use(middleware.AuthMiddleware())
	{
		dramaGroup.POST("", middleware.AdminMiddleware(), CreateDrama)
		dramaGroup.PUT("/:id", middleware.AdminMiddleware(), UpdateDrama)
		dramaGroup.GET("/:id", GetDrama)
		dramaGroup.GET("", ListDramas)
		dramaGroup.DELETE("/:id", middleware.AdminMiddleware(), DeleteDrama)

		dramaGroup.POST("/rights", middleware.AdminMiddleware(), AddDramaRight)
		dramaGroup.GET("/:drama_id/rights", GetDramaRights)
		dramaGroup.DELETE("/rights/:id", middleware.AdminMiddleware(), RemoveDramaRight)
	}
}
