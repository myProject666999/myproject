package handlers

import (
	"net/http"
	"strconv"

	"campus-volunteer-system/config"
	"campus-volunteer-system/models"

	"github.com/gin-gonic/gin"
)

func GetVolunteers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	college := c.Query("college")
	isExcellent := c.Query("is_excellent")

	offset := (page - 1) * pageSize

	var volunteers []models.User
	var total int64

	db := config.DB.Model(&models.User{}).Where("role = ?", models.RoleVolunteer)

	if keyword != "" {
		db = db.Where("username LIKE ? OR real_name LIKE ? OR student_id LIKE ?", 
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}
	if college != "" {
		db = db.Where("college = ?", college)
	}
	if isExcellent == "true" {
		db = db.Where("is_excellent = ?", true)
	}

	db.Count(&total)
	db.Order("points desc, created_at desc").Offset(offset).Limit(pageSize).Find(&volunteers)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data": gin.H{
			"list":       volunteers,
			"total":      total,
			"page":       page,
			"page_size":  pageSize,
		},
	})
}

func GetVolunteerDetail(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的用户ID",
		})
		return
	}

	var volunteer models.User
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "志愿者不存在",
		})
		return
	}

	var pointsRecords []models.PointsRecord
	config.DB.Where("user_id = ?", id).Order("created_at desc").Find(&pointsRecords)

	var activityCount int64
	config.DB.Model(&models.Registration{}).Where("user_id = ? AND status IN (?)", 
		id, []string{string(models.RegAttended), string(models.RegCompleted)}).Count(&activityCount)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data": gin.H{
			"volunteer":       volunteer,
			"points_records":  pointsRecords,
			"activity_count":  activityCount,
		},
	})
}

func GetExcellentVolunteers(c *gin.Context) {
	var volunteers []models.User
	config.DB.Where("role = ? AND is_excellent = ? AND status = ?", 
		models.RoleVolunteer, true, "active").
		Order("points desc").
		Limit(10).
		Find(&volunteers)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    volunteers,
	})
}

func ToggleExcellentVolunteer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的用户ID",
		})
		return
	}

	var volunteer models.User
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "志愿者不存在",
		})
		return
	}

	newStatus := !volunteer.IsExcellent
	config.DB.Model(&volunteer).Update("is_excellent", newStatus)

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "更新成功",
		"data": gin.H{
			"is_excellent": newStatus,
		},
	})
}

func DeleteVolunteer(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    400,
			"message": "无效的用户ID",
		})
		return
	}

	var volunteer models.User
	if err := config.DB.First(&volunteer, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"code":    404,
			"message": "志愿者不存在",
		})
		return
	}

	if volunteer.Role == models.RoleAdmin {
		c.JSON(http.StatusForbidden, gin.H{
			"code":    403,
			"message": "不能删除管理员账户",
		})
		return
	}

	if err := config.DB.Delete(&volunteer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    500,
			"message": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"code":    200,
		"message": "删除成功",
	})
}

func GetCollegeList(c *gin.Context) {
	type CollegeItem struct {
		College string `json:"college"`
	}

	var colleges []CollegeItem
	config.DB.Model(&models.User{}).
		Select("DISTINCT college").
		Where("role = ? AND college IS NOT NULL AND college != ''", models.RoleVolunteer).
		Scan(&colleges)

	result := []string{}
	for _, c := range colleges {
		result = append(result, c.College)
	}

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"message": "获取成功",
		"data":    result,
	})
}
