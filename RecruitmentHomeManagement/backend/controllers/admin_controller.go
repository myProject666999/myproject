package controllers

import (
	"net/http"
	"recruithub/config"
	"recruithub/models"

	"github.com/gin-gonic/gin"
)

func AdminGetUsers(c *gin.Context) {
	role := c.Query("role")
	keyword := c.Query("keyword")

	query := config.DB

	if role != "" {
		query = query.Where("role = ?", role)
	}
	if keyword != "" {
		query = query.Where("username LIKE ? OR name LIKE ? OR email LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var users []models.User
	query.Find(&users)

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func AdminUpdateUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "user": user})
}

func AdminDeleteUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	config.DB.Delete(&user)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func AdminGetCompanies(c *gin.Context) {
	keyword := c.Query("keyword")

	query := config.DB.Preload("User")
	if keyword != "" {
		query = query.Where("name LIKE ?", "%"+keyword+"%")
	}

	var companies []models.Company
	query.Find(&companies)

	c.JSON(http.StatusOK, gin.H{"companies": companies})
}

func AdminUpdateCompany(c *gin.Context) {
	id := c.Param("id")

	var company models.Company
	if err := config.DB.First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "企业不存在"})
		return
	}

	if err := c.ShouldBindJSON(&company); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&company)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "company": company})
}

func AdminDeleteCompany(c *gin.Context) {
	id := c.Param("id")

	var company models.Company
	if err := config.DB.First(&company, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "企业不存在"})
		return
	}

	config.DB.Delete(&company)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func AdminGetJobs(c *gin.Context) {
	keyword := c.Query("keyword")
	status := c.Query("status")

	query := config.DB.Preload("Company")

	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var jobs []models.Job
	query.Find(&jobs)

	c.JSON(http.StatusOK, gin.H{"jobs": jobs})
}

func AdminUpdateJob(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := config.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	if err := c.ShouldBindJSON(&job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	config.DB.Save(&job)
	c.JSON(http.StatusOK, gin.H{"message": "更新成功", "job": job})
}

func AdminDeleteJob(c *gin.Context) {
	id := c.Param("id")

	var job models.Job
	if err := config.DB.First(&job, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "职位不存在"})
		return
	}

	config.DB.Delete(&job)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func AdminGetBlogs(c *gin.Context) {
	status := c.Query("status")

	query := config.DB.Preload("User")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var blogs []models.Blog
	query.Find(&blogs)

	c.JSON(http.StatusOK, gin.H{"blogs": blogs})
}

func AdminReviewBlog(c *gin.Context) {
	adminID := c.GetUint("user_id")
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	var req struct {
		Status    int    `json:"status"`
		ReviewMsg string `json:"review_msg"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	blog.Status = req.Status
	blog.ReviewerID = adminID
	blog.ReviewMsg = req.ReviewMsg

	config.DB.Save(&blog)

	c.JSON(http.StatusOK, gin.H{"message": "审核完成"})
}

func AdminDeleteBlog(c *gin.Context) {
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	config.DB.Delete(&blog)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func AdminGetSeekers(c *gin.Context) {
	keyword := c.Query("keyword")

	query := config.DB.Preload("User")
	if keyword != "" {
		query = query.Where("title LIKE ? OR expected_position LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}

	var seekers []models.JobSeeker
	query.Find(&seekers)

	c.JSON(http.StatusOK, gin.H{"seekers": seekers})
}

func AdminDeleteSeeker(c *gin.Context) {
	id := c.Param("id")

	var seeker models.JobSeeker
	if err := config.DB.First(&seeker, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "求职信息不存在"})
		return
	}

	config.DB.Delete(&seeker)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func AdminGetStats(c *gin.Context) {
	var userCount int64
	var companyCount int64
	var jobCount int64
	var blogCount int64
	var seekerCount int64
	var pendingBlogCount int64

	config.DB.Model(&models.User{}).Where("role = ?", models.RoleUser).Count(&userCount)
	config.DB.Model(&models.Company{}).Count(&companyCount)
	config.DB.Model(&models.Job{}).Count(&jobCount)
	config.DB.Model(&models.Blog{}).Count(&blogCount)
	config.DB.Model(&models.JobSeeker{}).Count(&seekerCount)
	config.DB.Model(&models.Blog{}).Where("status = ?", 1).Count(&pendingBlogCount)

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"user_count":        userCount,
			"company_count":     companyCount,
			"job_count":         jobCount,
			"blog_count":        blogCount,
			"seeker_count":      seekerCount,
			"pending_blog_count": pendingBlogCount,
		},
	})
}
