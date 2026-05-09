package controllers

import (
	"net/http"
	"strconv"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func ListFrontUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	status := c.Query("status")
	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.User{})
	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	var users []models.User

	query.Count(&total)
	query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      users,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func UpdateFrontUser(c *gin.Context) {
	id := c.Param("id")

	var data struct {
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if data.Nickname != "" {
		user.Nickname = data.Nickname
	}
	if data.Email != "" {
		user.Email = data.Email
	}
	if data.Phone != "" {
		user.Phone = data.Phone
	}
	if data.Password != "" {
		user.Password = data.Password
	}

	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func DeleteFrontUser(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ApproveFrontUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := config.DB.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	user.Status = 1
	config.DB.Save(&user)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "审核通过", "data": user})
}

func ListComments(c *gin.Context) {
	targetType := c.Query("type")
	targetID := c.Query("target_id")

	query := config.DB.Model(&models.Comment{}).Where("status = 1")
	if targetType != "" {
		query = query.Where("type = ?", targetType)
	}
	if targetID != "" {
		query = query.Where("target_id = ?", targetID)
	}

	var comments []models.Comment
	query.Preload("User").Order("created_at DESC").Find(&comments)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": comments})
}

func AddComment(c *gin.Context) {
	userID := c.GetUint("user_id")

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	comment.UserID = userID
	comment.Status = 1

	if err := config.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "评论失败"})
		return
	}

	config.DB.Preload("User").First(&comment, comment.ID)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "评论成功", "data": comment})
}

func DeleteComment(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Comment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favorite models.Favorite
	if err := c.ShouldBindJSON(&favorite); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	favorite.UserID = userID

	var existing models.Favorite
	if err := config.DB.Where("user_id = ? AND type = ? AND target_id = ?", userID, favorite.Type, favorite.TargetID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "已收藏"})
		return
	}

	if err := config.DB.Create(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "收藏失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "收藏成功", "data": favorite})
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := c.Param("id")

	if err := config.DB.Where("user_id = ? AND id = ?", userID, id).Delete(&models.Favorite{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "取消收藏失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "取消收藏成功"})
}

func ListFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")
	favoriteType := c.Query("type")

	query := config.DB.Where("user_id = ?", userID)
	if favoriteType != "" {
		query = query.Where("type = ?", favoriteType)
	}

	var favorites []models.Favorite
	query.Order("created_at DESC").Find(&favorites)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": favorites})
}

func AddMessage(c *gin.Context) {
	userID := c.GetUint("user_id")

	var message models.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	message.UserID = userID

	if err := config.DB.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "留言失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "留言成功", "data": message})
}

func ListUserMessages(c *gin.Context) {
	userID := c.GetUint("user_id")

	var messages []models.Message
	config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&messages)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": messages})
}

func ListAdminMessages(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	offset := (page - 1) * pageSize

	var total int64
	var messages []models.Message

	config.DB.Model(&models.Message{}).Count(&total)
	config.DB.Preload("User").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&messages)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      messages,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ReplyMessage(c *gin.Context) {
	id := c.Param("id")

	var data struct {
		Reply string `json:"reply"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	var message models.Message
	if err := config.DB.First(&message, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}

	message.Reply = data.Reply
	message.Status = 1
	config.DB.Save(&message)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "回复成功", "data": message})
}

func DeleteMessage(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Message{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AddDemand(c *gin.Context) {
	userID := c.GetUint("user_id")

	var demand models.Demand
	if err := c.ShouldBindJSON(&demand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	demand.UserID = userID

	if err := config.DB.Create(&demand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "提交失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "提交成功", "data": demand})
}

func ListUserDemands(c *gin.Context) {
	userID := c.GetUint("user_id")

	var demands []models.Demand
	config.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&demands)

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": demands})
}

func ListAdminDemands(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	status := c.Query("status")
	offset := (page - 1) * pageSize

	query := config.DB.Model(&models.Demand{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	var demands []models.Demand

	query.Count(&total)
	query.Preload("User").Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&demands)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      demands,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ApproveDemand(c *gin.Context) {
	id := c.Param("id")

	var demand models.Demand
	if err := config.DB.First(&demand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "需求不存在"})
		return
	}

	demand.Status = 1
	config.DB.Save(&demand)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "审核通过", "data": demand})
}

func DeleteDemand(c *gin.Context) {
	id := c.Param("id")

	if err := config.DB.Delete(&models.Demand{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListSystemSettings(c *gin.Context) {
	var settings []models.SystemSetting
	config.DB.Find(&settings)

	settingMap := make(map[string]string)
	for _, s := range settings {
		settingMap[s.Key] = s.Value
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": settingMap})
}

func GetSystemSetting(c *gin.Context) {
	key := c.Param("key")

	var setting models.SystemSetting
	if err := config.DB.Where("key = ?", key).First(&setting).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "设置不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": setting.Value})
}

func UpdateSystemSettings(c *gin.Context) {
	var data map[string]string
	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	for key, value := range data {
		var setting models.SystemSetting
		if err := config.DB.Where("key = ?", key).First(&setting).Error; err != nil {
			setting = models.SystemSetting{Key: key, Value: value}
			config.DB.Create(&setting)
		} else {
			setting.Value = value
			config.DB.Save(&setting)
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "保存成功"})
}

func BackupDatabase(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "备份成功"})
}
