package handler

import (
	"encoding/json"

	"github.com/gin-gonic/gin"
	"uav-inspection-server/database"
	"uav-inspection-server/model"
	"uav-inspection-server/utils"
)

type ComparisonReq struct {
	Title          string `json:"title" binding:"required"`
	AreaID         uint64 `json:"area_id" binding:"required"`
	BaseTaskID     uint64 `json:"base_task_id" binding:"required"`
	CompareTaskID  uint64 `json:"compare_task_id" binding:"required"`
	ComparisonType int8   `json:"comparison_type"`
	Description    string `json:"description"`
}

func CreateComparison(c *gin.Context) {
	var req ComparisonReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	if req.BaseTaskID == req.CompareTaskID {
		utils.Fail(c, 400, "base task and compare task cannot be the same")
		return
	}
	userID := c.GetUint64("user_id")
	comparison := model.Comparison{
		Title:          req.Title,
		AreaID:         req.AreaID,
		BaseTaskID:     req.BaseTaskID,
		CompareTaskID:  req.CompareTaskID,
		ComparisonType: req.ComparisonType,
		Description:    req.Description,
		CreatedBy:      userID,
	}
	if err := database.DB.Create(&comparison).Error; err != nil {
		utils.Fail(c, 500, "failed to create comparison")
		return
	}
	utils.Success(c, comparison)
}

func GetComparison(c *gin.Context) {
	id := c.Param("id")
	var comparison model.Comparison
	if err := database.DB.First(&comparison, id).Error; err != nil {
		utils.Fail(c, 404, "comparison not found")
		return
	}
	utils.Success(c, comparison)
}

func UpdateComparison(c *gin.Context) {
	id := c.Param("id")
	var comparison model.Comparison
	if err := database.DB.First(&comparison, id).Error; err != nil {
		utils.Fail(c, 404, "comparison not found")
		return
	}
	var req ComparisonReq
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Fail(c, 400, err.Error())
		return
	}
	database.DB.Model(&comparison).Updates(map[string]interface{}{
		"title":           req.Title,
		"comparison_type": req.ComparisonType,
		"description":     req.Description,
	})
	utils.Success(c, comparison)
}

func DeleteComparison(c *gin.Context) {
	id := c.Param("id")
	if err := database.DB.Delete(&model.Comparison{}, id).Error; err != nil {
		utils.Fail(c, 500, "failed to delete comparison")
		return
	}
	utils.Success(c, nil)
}

func ListComparisons(c *gin.Context) {
	var comparisons []model.Comparison
	query := database.DB.Model(&model.Comparison{})
	if areaID := c.Query("area_id"); areaID != "" {
		query = query.Where("area_id = ?", areaID)
	}
	var total int64
	query.Count(&total)
	page := getPage(c)
	pageSize := getPageSize(c)
	query.Offset((page - 1) * pageSize).Limit(pageSize).Order("created_at DESC").Find(&comparisons)
	utils.Success(c, gin.H{"total": total, "list": comparisons})
}

func ExecuteComparison(c *gin.Context) {
	id := c.Param("id")
	var comparison model.Comparison
	if err := database.DB.First(&comparison, id).Error; err != nil {
		utils.Fail(c, 404, "comparison not found")
		return
	}
	var baseAnnotations []model.Annotation
	database.DB.Where("task_id = ?", comparison.BaseTaskID).Find(&baseAnnotations)
	var compareAnnotations []model.Annotation
	database.DB.Where("task_id = ?", comparison.CompareTaskID).Find(&compareAnnotations)
	baseMap := make(map[uint64]model.Annotation)
	for _, a := range baseAnnotations {
		baseMap[a.ID] = a
	}
	compareMap := make(map[uint64]model.Annotation)
	for _, a := range compareAnnotations {
		compareMap[a.ID] = a
	}
	var newCount, resolvedCount, changedCount int
	for id := range compareMap {
		if _, exists := baseMap[id]; !exists {
			newCount++
		}
	}
	for id := range baseMap {
		if _, exists := compareMap[id]; !exists {
			resolvedCount++
		} else {
			if baseMap[id].Severity != compareMap[id].Severity ||
				baseMap[id].Category != compareMap[id].Category {
				changedCount++
			}
		}
	}
	totalBase := len(baseAnnotations)
	totalCompare := len(compareAnnotations)
	similarityScore := 0.0
	if totalBase > 0 || totalCompare > 0 {
		common := totalBase + totalCompare - newCount - resolvedCount
		similarityScore = float64(common) / float64(totalBase+totalCompare) * 100
	}
	resultData := gin.H{
		"base_task_annotations":     totalBase,
		"compare_task_annotations":  totalCompare,
		"new_annotations":           newCount,
		"resolved_annotations":      resolvedCount,
		"changed_annotations":       changedCount,
		"similarity_score":          similarityScore,
	}
	resultJSON, _ := json.Marshal(resultData)
	resultStr := string(resultJSON)
	database.DB.Model(&comparison).Updates(map[string]interface{}{
		"new_annotations":      newCount,
		"resolved_annotations": resolvedCount,
		"changed_annotations":  changedCount,
		"similarity_score":     similarityScore,
		"result":               resultStr,
	})
	database.DB.First(&comparison, id)
	utils.Success(c, comparison)
}
