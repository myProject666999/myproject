package controllers

import (
	"net/http"
	"recruithub/config"
	"recruithub/models"

	"github.com/gin-gonic/gin"
)

func GetBlogs(c *gin.Context) {
	keyword := c.Query("keyword")

	query := config.DB.Preload("User").Where("status = ?", 2)

	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ? OR tags LIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	var blogs []models.Blog
	query.Order("created_at DESC").Find(&blogs)

	c.JSON(http.StatusOK, gin.H{"blogs": blogs})
}

func GetBlogDetail(c *gin.Context) {
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.Preload("User").First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	config.DB.Model(&blog).Update("views", blog.Views+1)

	c.JSON(http.StatusOK, gin.H{"blog": blog})
}

func CreateBlog(c *gin.Context) {
	userID := c.GetUint("user_id")

	var blog models.Blog
	if err := c.ShouldBindJSON(&blog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	blog.UserID = userID
	blog.Status = 1

	if err := config.DB.Create(&blog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "发布成功，等待审核", "blog": blog})
}

func UpdateBlog(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	if blog.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改"})
		return
	}

	if err := c.ShouldBindJSON(&blog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	blog.Status = 1
	config.DB.Save(&blog)

	c.JSON(http.StatusOK, gin.H{"message": "更新成功，等待审核"})
}

func DeleteBlog(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	if blog.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限删除"})
		return
	}

	config.DB.Delete(&blog)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func GetMyBlogs(c *gin.Context) {
	userID := c.GetUint("user_id")

	var blogs []models.Blog
	config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&blogs)

	c.JSON(http.StatusOK, gin.H{"blogs": blogs})
}

func LikeBlog(c *gin.Context) {
	id := c.Param("id")

	var blog models.Blog
	if err := config.DB.First(&blog, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "博客不存在"})
		return
	}

	blog.Likes++
	config.DB.Save(&blog)

	c.JSON(http.StatusOK, gin.H{"message": "点赞成功", "likes": blog.Likes})
}
