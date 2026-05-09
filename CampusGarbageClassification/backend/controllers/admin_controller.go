package controllers

import (
	"garbage-classification/models"
	"garbage-classification/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetStudents(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.Student{}).Preload("User")
	if keyword != "" {
		query = query.Joins("LEFT JOIN users ON students.user_id = users.id").Where("students.real_name LIKE ? OR students.student_no LIKE ? OR users.username LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var students []models.Student
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&students)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": students, "total": total}})
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	if role == "student" {
		var student models.Student
		utils.DB.Where("user_id = ?", userID).First(&student)
		if err := c.ShouldBindJSON(&student); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
			return
		}
		utils.DB.Save(&student)
		c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": student})
	} else if role == "admin" {
		var admin models.Admin
		utils.DB.Where("user_id = ?", userID).First(&admin)
		c.ShouldBindJSON(&admin)
		utils.DB.Save(&admin)
		c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": admin})
	}
}

func UpdatePassword(c *gin.Context) {
	userID := c.GetUint("user_id")
	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}
	c.ShouldBindJSON(&req)

	var user models.User
	utils.DB.First(&user, userID)
	if !utils.CheckPassword(req.OldPassword, user.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "旧密码错误"})
		return
	}

	hashedPwd, _ := utils.HashPassword(req.NewPassword)
	utils.DB.Model(&user).Update("password", hashedPwd)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码更新成功"})
}

func GetSiteInfo(c *gin.Context) {
	infoType := c.Query("type")
	var info models.SiteInfo
	utils.DB.Where("type = ?", infoType).First(&info)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": info})
}

func UpdateSiteInfo(c *gin.Context) {
	var info models.SiteInfo
	c.ShouldBindJSON(&info)
	var existing models.SiteInfo
	if utils.DB.Where("type = ?", info.Type).First(&existing).Error == nil {
		existing.Content = info.Content
		utils.DB.Save(&existing)
		c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": existing})
		return
	}
	utils.DB.Create(&info)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": info})
}

func GetBins(c *gin.Context) {
	var bins []models.TrashBin
	utils.DB.Find(&bins)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bins})
}

func CreateBin(c *gin.Context) {
	var bin models.TrashBin
	c.ShouldBindJSON(&bin)
	utils.DB.Create(&bin)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bin})
}

func UpdateBin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var bin models.TrashBin
	utils.DB.First(&bin, id)
	c.ShouldBindJSON(&bin)
	utils.DB.Save(&bin)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": bin})
}

func DeleteBin(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.TrashBin{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func GetThrowRecords(c *gin.Context) {
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	query := utils.DB.Model(&models.ThrowRecord{}).Preload("Student").Preload("Bin")
	if keyword != "" {
		query = query.Where("garbage_type LIKE ? OR remark LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var total int64
	query.Count(&total)

	var records []models.ThrowRecord
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&records)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": records, "total": total}})
}

func GetMyThrowRecords(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.ThrowRecord{}).Where("student_id = ?", student.ID).Count(&total)

	var records []models.ThrowRecord
	utils.DB.Where("student_id = ?", student.ID).Preload("Bin").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&records)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": records, "total": total}})
}

func AddThrowRecord(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	var record models.ThrowRecord
	c.ShouldBindJSON(&record)
	record.StudentID = student.ID
	record.Points = int(record.Weight * 10)

	utils.DB.Create(&record)
	utils.DB.Model(&student).Update("points", student.Points+record.Points)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "记录成功", "data": record})
}

func GetCreativeTypes(c *gin.Context) {
	var types []models.CreativeType
	utils.DB.Order("sort ASC").Find(&types)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": types})
}

func CreateCreativeType(c *gin.Context) {
	var t models.CreativeType
	c.ShouldBindJSON(&t)
	utils.DB.Create(&t)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": t})
}

func UpdateCreativeType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var t models.CreativeType
	utils.DB.First(&t, id)
	c.ShouldBindJSON(&t)
	utils.DB.Save(&t)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": t})
}

func DeleteCreativeType(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.CreativeType{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func GetMyCreatives(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	var creatives []models.CreativeInfo
	utils.DB.Where("student_id = ?", student.ID).Preload("Type").Order("created_at DESC").Find(&creatives)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": creatives})
}

func CreateCreative(c *gin.Context) {
	userID := c.GetUint("user_id")
	var student models.Student
	utils.DB.Where("user_id = ?", userID).First(&student)

	var creative models.CreativeInfo
	c.ShouldBindJSON(&creative)
	creative.StudentID = student.ID
	utils.DB.Create(&creative)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": creative})
}

func UpdateCreative(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var creative models.CreativeInfo
	utils.DB.First(&creative, id)
	c.ShouldBindJSON(&creative)
	utils.DB.Save(&creative)
	c.JSON(http.StatusOK, gin.H{"code": 200, "data": creative})
}

func DeleteCreative(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	utils.DB.Delete(&models.CreativeInfo{}, id)
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AdminGetCreatives(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	var total int64
	utils.DB.Model(&models.CreativeInfo{}).Count(&total)

	var creatives []models.CreativeInfo
	utils.DB.Preload("Student").Preload("Type").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&creatives)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": gin.H{"list": creatives, "total": total}})
}
