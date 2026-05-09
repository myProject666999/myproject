package controllers

import (
	"college-academic/database"
	"college-academic/models"
	"college-academic/utils"
	"strconv"

	"github.com/gin-gonic/gin"
)

func StudentRegister(c *gin.Context) {
	var req struct {
		StudentNo string `json:"student_no" binding:"required"`
		Password  string `json:"password" binding:"required"`
		RealName  string `json:"real_name" binding:"required"`
		College   string `json:"college"`
		Major     string `json:"major"`
		Grade     string `json:"grade"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var existing models.Student
	if database.DB.Where("student_no = ?", req.StudentNo).First(&existing).Error == nil {
		utils.Error(c, 400, "学号已存在")
		return
	}

	hashed, _ := utils.HashPassword(req.Password)
	student := models.Student{
		StudentNo: req.StudentNo,
		Password:  hashed,
		RealName:  req.RealName,
		College:   req.College,
		Major:     req.Major,
		Grade:     req.Grade,
		Status:    0,
	}

	if err := database.DB.Create(&student).Error; err != nil {
		utils.Error(c, 500, "注册失败")
		return
	}

	utils.Success(c, student)
}

func StudentLogin(c *gin.Context) {
	var req struct {
		StudentNo string `json:"student_no" binding:"required"`
		Password  string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var student models.Student
	if err := database.DB.Where("student_no = ?", req.StudentNo).First(&student).Error; err != nil {
		utils.Error(c, 401, "学号或密码错误")
		return
	}

	if !utils.CheckPassword(req.Password, student.Password) {
		utils.Error(c, 401, "学号或密码错误")
		return
	}

	if student.Status == 0 {
		utils.Error(c, 403, "账号待审核，请等待管理员审核")
		return
	}
	if student.Status == 2 {
		utils.Error(c, 403, "账号已被拒绝")
		return
	}

	token, err := utils.GenerateToken(student.ID, student.StudentNo, "student")
	if err != nil {
		utils.Error(c, 500, "生成令牌失败")
		return
	}

	utils.Success(c, gin.H{
		"token": token,
		"user": gin.H{
			"id":         student.ID,
			"student_no": student.StudentNo,
			"real_name":  student.RealName,
			"status":     student.Status,
			"role":       "student",
		},
	})
}

func GetStudentProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var student models.Student
	if err := database.DB.First(&student, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	utils.Success(c, student)
}

func UpdateStudentProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var student models.Student
	if err := database.DB.First(&student, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	var req struct {
		RealName string `json:"real_name"`
		Gender   string `json:"gender"`
		Birthday string `json:"birthday"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		College  string `json:"college"`
		Major    string `json:"major"`
		Class    string `json:"class"`
		Grade    string `json:"grade"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	if req.RealName != "" {
		student.RealName = req.RealName
	}
	student.Gender = req.Gender
	student.Birthday = req.Birthday
	student.Phone = req.Phone
	student.Email = req.Email
	student.College = req.College
	student.Major = req.Major
	student.Class = req.Class
	student.Grade = req.Grade

	database.DB.Save(&student)
	utils.Success(c, student)
}

func ChangeStudentPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var student models.Student
	if err := database.DB.First(&student, userID).Error; err != nil {
		utils.Error(c, 404, "用户不存在")
		return
	}

	if !utils.CheckPassword(req.OldPassword, student.Password) {
		utils.Error(c, 400, "原密码错误")
		return
	}

	hashed, _ := utils.HashPassword(req.NewPassword)
	student.Password = hashed
	database.DB.Save(&student)

	utils.Success(c, nil)
}

func GetStudentList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	status := c.Query("status")

	var students []models.Student
	var total int64

	query := database.DB.Model(&models.Student{})
	if keyword != "" {
		query = query.Where("student_no LIKE ? OR real_name LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&students)

	utils.SuccessPage(c, students, total, page, pageSize)
}

func GetStudentDetail(c *gin.Context) {
	id := c.Param("id")

	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		utils.Error(c, 404, "学生不存在")
		return
	}

	utils.Success(c, student)
}

func UpdateStudent(c *gin.Context) {
	id := c.Param("id")

	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		utils.Error(c, 404, "学生不存在")
		return
	}

	var req struct {
		RealName string `json:"real_name"`
		Gender   string `json:"gender"`
		Phone    string `json:"phone"`
		Email    string `json:"email"`
		College  string `json:"college"`
		Major    string `json:"major"`
		Grade    string `json:"grade"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	if req.RealName != "" {
		student.RealName = req.RealName
	}
	student.Gender = req.Gender
	student.Phone = req.Phone
	student.Email = req.Email
	student.College = req.College
	student.Major = req.Major
	student.Grade = req.Grade

	database.DB.Save(&student)
	utils.Success(c, student)
}

func DeleteStudent(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Student{}, id).Error; err != nil {
		utils.Error(c, 500, "删除失败")
		return
	}

	utils.Success(c, nil)
}

func AuditStudent(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Status int `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, 400, "参数错误")
		return
	}

	var student models.Student
	if err := database.DB.First(&student, id).Error; err != nil {
		utils.Error(c, 404, "学生不存在")
		return
	}

	student.Status = req.Status
	database.DB.Save(&student)
	utils.Success(c, student)
}
