package controllers

import (
	"strconv"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func GetIntroList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var intros []models.SchoolIntro
	var total int64

	query := database.DB.Model(&models.SchoolIntro{}).Where("status = ?", 1)

	query.Count(&total)
	query.Order("sort DESC, id DESC").Offset(offset).Limit(pageSize).Find(&intros)

	utils.Success(c, gin.H{
		"list":      intros,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetIntroDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var intro models.SchoolIntro
	if result := database.DB.First(&intro, id); result.Error != nil {
		utils.NotFound(c, "学校简介不存在")
		return
	}

	database.DB.Model(&intro).Update("view_count", intro.ViewCount+1)

	utils.Success(c, intro)
}

func LikeIntro(c *gin.Context) {
	userID := c.GetUint("user_id")
	introID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var existingLike models.IntroLike
	result := database.DB.Where("user_id = ? AND intro_id = ?", userID, introID).First(&existingLike)

	if result.RowsAffected > 0 {
		utils.BadRequest(c, "已经点赞过了")
		return
	}

	var existingDislike models.IntroDislike
	database.DB.Where("user_id = ? AND intro_id = ?", userID, introID).Delete(&existingDislike)

	like := models.IntroLike{
		UserID:  userID,
		IntroID: uint(introID),
	}
	database.DB.Create(&like)

	var intro models.SchoolIntro
	database.DB.First(&intro, introID)
	database.DB.Model(&intro).UpdateColumn("like_count", intro.LikeCount+1)

	utils.SuccessWithMessage(c, "点赞成功", gin.H{
		"like_count":    intro.LikeCount + 1,
		"dislike_count": intro.DislikeCount,
	})
}

func DislikeIntro(c *gin.Context) {
	userID := c.GetUint("user_id")
	introID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var existingDislike models.IntroDislike
	result := database.DB.Where("user_id = ? AND intro_id = ?", userID, introID).First(&existingDislike)

	if result.RowsAffected > 0 {
		utils.BadRequest(c, "已经点踩过了")
		return
	}

	var existingLike models.IntroLike
	database.DB.Where("user_id = ? AND intro_id = ?", userID, introID).Delete(&existingLike)

	dislike := models.IntroDislike{
		UserID:  userID,
		IntroID: uint(introID),
	}
	database.DB.Create(&dislike)

	var intro models.SchoolIntro
	database.DB.First(&intro, introID)
	database.DB.Model(&intro).UpdateColumn("dislike_count", intro.DislikeCount+1)

	utils.SuccessWithMessage(c, "点踩成功", gin.H{
		"like_count":    intro.LikeCount,
		"dislike_count": intro.DislikeCount + 1,
	})
}

func AdminGetIntroList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var intros []models.SchoolIntro
	var total int64

	query := database.DB.Model(&models.SchoolIntro{})
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&intros)

	utils.Success(c, gin.H{
		"list":      intros,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminCreateIntro(c *gin.Context) {
	var intro models.SchoolIntro
	if err := c.ShouldBindJSON(&intro); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if result := database.DB.Create(&intro); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "创建成功", intro)
}

func AdminUpdateIntro(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var intro models.SchoolIntro
	if result := database.DB.First(&intro, id); result.Error != nil {
		utils.NotFound(c, "学校简介不存在")
		return
	}

	if err := c.ShouldBindJSON(&intro); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	database.DB.Save(&intro)
	utils.SuccessWithMessage(c, "更新成功", intro)
}

func AdminDeleteIntro(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.SchoolIntro{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}
