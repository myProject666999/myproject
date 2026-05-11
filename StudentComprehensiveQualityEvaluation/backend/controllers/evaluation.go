package controllers

import (
	"net/http"
	"strconv"

	"student_quality_system/config"
	"student_quality_system/models"

	"github.com/gin-gonic/gin"
)

func GetEvaluations(c *gin.Context) {
	var pageInfo PageInfo
	if err := c.ShouldBindQuery(&pageInfo); err != nil {
		pageInfo.Page = 1
		pageInfo.PageSize = 10
	}
	
	if pageInfo.Page <= 0 {
		pageInfo.Page = 1
	}
	if pageInfo.PageSize <= 0 {
		pageInfo.PageSize = 10
	}
	
	query := config.DB.Model(&models.Evaluation{})
	
	if studentNo := c.Query("student_no"); studentNo != "" {
		query = query.Where("student_no LIKE ?", "%"+studentNo+"%")
	}
	if studentName := c.Query("student_name"); studentName != "" {
		query = query.Where("student_name LIKE ?", "%"+studentName+"%")
	}
	if semester := c.Query("semester"); semester != "" {
		query = query.Where("semester = ?", semester)
	}
	if level := c.Query("level"); level != "" {
		query = query.Where("level = ?", level)
	}
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	
	var total int64
	query.Count(&total)
	
	var evaluations []models.Evaluation
	query.Offset((pageInfo.Page - 1) * pageInfo.PageSize).Limit(pageInfo.PageSize).Find(&evaluations)
	
	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "success",
		"data": gin.H{
			"list": evaluations,
			"total": total,
			"page": pageInfo.Page,
			"pageSize": pageInfo.PageSize,
		},
	})
}

func GetEvaluation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var evaluation models.Evaluation
	if err := config.DB.First(&evaluation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "测评记录不存在"})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "success", "data": evaluation})
}

func CreateEvaluation(c *gin.Context) {
	var evaluation models.Evaluation
	if err := c.ShouldBindJSON(&evaluation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if evaluation.TotalScore == 0 {
		evaluation.TotalScore = evaluation.AcademicScore + evaluation.MoralScore + evaluation.AbilityScore
	}
	
	if err := config.DB.Create(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": evaluation})
}

func UpdateEvaluation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	var evaluation models.Evaluation
	if err := config.DB.First(&evaluation, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "测评记录不存在"})
		return
	}
	
	if err := c.ShouldBindJSON(&evaluation); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误", "error": err.Error()})
		return
	}
	
	if evaluation.TotalScore == 0 {
		evaluation.TotalScore = evaluation.AcademicScore + evaluation.MoralScore + evaluation.AbilityScore
	}
	
	if err := config.DB.Save(&evaluation).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "更新失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": evaluation})
}

func DeleteEvaluation(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	
	if err := config.DB.Delete(&models.Evaluation{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败", "error": err.Error()})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
