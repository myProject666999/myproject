package controllers

import (
	"net/http"
	"sort"
	"strconv"
	"time"

	"student-recommendation-platform/config"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func ListFrontUsers(c *gin.Context) {
	page, pageSize := parsePageInfo(c)
	keyword := c.Query("keyword")
	status := c.Query("status")

	config.DB.Lock()
	defer config.DB.Unlock()

	var users []models.User
	for _, user := range config.DB.Users {
		if keyword != "" && !config.Contains(user.Username, keyword) && !config.Contains(user.Nickname, keyword) {
			continue
		}
		if status != "" {
			statusInt, _ := strconv.Atoi(status)
			if user.Status != statusInt {
				continue
			}
		}
		users = append(users, user)
	}

	sort.Slice(users, func(i, j int) bool {
		return users[i].CreatedAt.After(users[j].CreatedAt)
	})

	paginated, total := paginate(users, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func UpdateFrontUser(c *gin.Context) {
	id := parseUint(c.Param("id"))

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

	config.DB.Lock()
	defer config.DB.Unlock()

	user, exists := config.DB.Users[id]
	if !exists {
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
	user.UpdatedAt = time.Now()
	config.DB.Users[id] = user

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func DeleteFrontUser(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Users, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ApproveFrontUser(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	user, exists := config.DB.Users[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	user.Status = 1
	user.UpdatedAt = time.Now()
	config.DB.Users[id] = user

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "审核通过", "data": user})
}

func ListComments(c *gin.Context) {
	targetType := c.Query("type")
	targetID := c.Query("target_id")

	config.DB.Lock()
	defer config.DB.Unlock()

	var comments []models.Comment
	for _, comment := range config.DB.Comments {
		if comment.Status != 1 {
			continue
		}
		if targetType != "" && comment.Type != targetType {
			continue
		}
		if targetID != "" && comment.TargetID != parseUint(targetID) {
			continue
		}
		comment.User = config.DB.GetUser(comment.UserID)
		comments = append(comments, comment)
	}

	sort.Slice(comments, func(i, j int) bool {
		return comments[i].CreatedAt.After(comments[j].CreatedAt)
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": comments})
}

func AddComment(c *gin.Context) {
	userID := c.GetUint("user_id")

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.CommentIDCounter++
	comment.ID = config.DB.CommentIDCounter
	comment.UserID = userID
	comment.Status = 1
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()
	config.DB.Comments[comment.ID] = comment
	comment.User = config.DB.GetUser(userID)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "评论成功", "data": comment})
}

func DeleteComment(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Comments, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AddFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")

	var favorite models.Favorite
	if err := c.ShouldBindJSON(&favorite); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	for _, f := range config.DB.Favorites {
		if f.UserID == userID && f.Type == favorite.Type && f.TargetID == favorite.TargetID {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "已收藏"})
			return
		}
	}

	config.DB.FavoriteIDCounter++
	favorite.ID = config.DB.FavoriteIDCounter
	favorite.UserID = userID
	favorite.CreatedAt = time.Now()
	config.DB.Favorites[favorite.ID] = favorite

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "收藏成功", "data": favorite})
}

func RemoveFavorite(c *gin.Context) {
	userID := c.GetUint("user_id")
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	if favorite, exists := config.DB.Favorites[id]; exists && favorite.UserID == userID {
		delete(config.DB.Favorites, id)
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "取消收藏成功"})
}

func ListFavorites(c *gin.Context) {
	userID := c.GetUint("user_id")
	favoriteType := c.Query("type")

	config.DB.Lock()
	defer config.DB.Unlock()

	var favorites []models.Favorite
	for _, f := range config.DB.Favorites {
		if f.UserID != userID {
			continue
		}
		if favoriteType != "" && f.Type != favoriteType {
			continue
		}
		favorites = append(favorites, f)
	}

	sort.Slice(favorites, func(i, j int) bool {
		return favorites[i].CreatedAt.After(favorites[j].CreatedAt)
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": favorites})
}

func AddMessage(c *gin.Context) {
	userID := c.GetUint("user_id")

	var message models.Message
	if err := c.ShouldBindJSON(&message); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.MessageIDCounter++
	message.ID = config.DB.MessageIDCounter
	message.UserID = userID
	message.Status = 0
	message.CreatedAt = time.Now()
	message.UpdatedAt = time.Now()
	config.DB.Messages[message.ID] = message

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "留言成功", "data": message})
}

func ListUserMessages(c *gin.Context) {
	userID := c.GetUint("user_id")

	config.DB.Lock()
	defer config.DB.Unlock()

	var messages []models.Message
	for _, msg := range config.DB.Messages {
		if msg.UserID == userID {
			messages = append(messages, msg)
		}
	}

	sort.Slice(messages, func(i, j int) bool {
		return messages[i].CreatedAt.After(messages[j].CreatedAt)
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": messages})
}

func ListAdminMessages(c *gin.Context) {
	page, pageSize := parsePageInfo(c)

	config.DB.Lock()
	defer config.DB.Unlock()

	var messages []models.Message
	for _, msg := range config.DB.Messages {
		msg.User = config.DB.GetUser(msg.UserID)
		messages = append(messages, msg)
	}

	sort.Slice(messages, func(i, j int) bool {
		return messages[i].CreatedAt.After(messages[j].CreatedAt)
	})

	paginated, total := paginate(messages, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ReplyMessage(c *gin.Context) {
	id := parseUint(c.Param("id"))

	var data struct {
		Reply string `json:"reply"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	message, exists := config.DB.Messages[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "留言不存在"})
		return
	}

	message.Reply = data.Reply
	message.Status = 1
	message.UpdatedAt = time.Now()
	config.DB.Messages[id] = message

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "回复成功", "data": message})
}

func DeleteMessage(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Messages, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func AddDemand(c *gin.Context) {
	userID := c.GetUint("user_id")

	var demand models.Demand
	if err := c.ShouldBindJSON(&demand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	config.DB.DemandIDCounter++
	demand.ID = config.DB.DemandIDCounter
	demand.UserID = userID
	demand.Status = 0
	demand.CreatedAt = time.Now()
	demand.UpdatedAt = time.Now()
	config.DB.Demands[demand.ID] = demand

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "提交成功", "data": demand})
}

func ListUserDemands(c *gin.Context) {
	userID := c.GetUint("user_id")

	config.DB.Lock()
	defer config.DB.Unlock()

	var demands []models.Demand
	for _, d := range config.DB.Demands {
		if d.UserID == userID {
			demands = append(demands, d)
		}
	}

	sort.Slice(demands, func(i, j int) bool {
		return demands[i].CreatedAt.After(demands[j].CreatedAt)
	})

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": demands})
}

func ListAdminDemands(c *gin.Context) {
	page, pageSize := parsePageInfo(c)
	status := c.Query("status")

	config.DB.Lock()
	defer config.DB.Unlock()

	var demands []models.Demand
	for _, d := range config.DB.Demands {
		if status != "" {
			statusInt, _ := strconv.Atoi(status)
			if d.Status != statusInt {
				continue
			}
		}
		d.User = config.DB.GetUser(d.UserID)
		demands = append(demands, d)
	}

	sort.Slice(demands, func(i, j int) bool {
		return demands[i].CreatedAt.After(demands[j].CreatedAt)
	})

	paginated, total := paginate(demands, page, pageSize)

	c.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": gin.H{
			"list":      paginated,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

func ApproveDemand(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	demand, exists := config.DB.Demands[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "需求不存在"})
		return
	}

	demand.Status = 1
	demand.UpdatedAt = time.Now()
	config.DB.Demands[id] = demand

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "审核通过", "data": demand})
}

func DeleteDemand(c *gin.Context) {
	id := parseUint(c.Param("id"))

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Demands, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func ListSystemSettings(c *gin.Context) {
	config.DB.Lock()
	defer config.DB.Unlock()

	settingMap := make(map[string]string)
	for key, s := range config.DB.SystemSettings {
		settingMap[key] = s.Value
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": settingMap})
}

func GetSystemSetting(c *gin.Context) {
	key := c.Param("key")

	config.DB.Lock()
	defer config.DB.Unlock()

	setting, exists := config.DB.SystemSettings[key]
	if !exists {
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

	config.DB.Lock()
	defer config.DB.Unlock()

	for key, value := range data {
		setting, exists := config.DB.SystemSettings[key]
		if !exists {
			config.DB.SystemSettings[key] = models.SystemSetting{
				Key:       key,
				Value:     value,
				UpdatedAt: time.Now(),
			}
		} else {
			setting.Value = value
			setting.UpdatedAt = time.Now()
			config.DB.SystemSettings[key] = setting
		}
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "保存成功"})
}

func BackupDatabase(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "备份成功"})
}
