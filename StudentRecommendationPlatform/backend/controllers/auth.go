package controllers

import (
	"net/http"
	"sort"
	"strconv"
	"time"

	"student-recommendation-platform/config"
	"student-recommendation-platform/middleware"
	"student-recommendation-platform/models"

	"github.com/gin-gonic/gin"
)

func parseUint(s string) uint {
	n, _ := strconv.Atoi(s)
	return uint(n)
}

func parsePageInfo(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 10
	}
	return page, pageSize
}

func paginate[T any](items []T, page, pageSize int) ([]T, int) {
	total := len(items)
	start := (page - 1) * pageSize
	end := start + pageSize
	if start > total {
		return []T{}, total
	}
	if end > total {
		end = total
	}
	return items[start:end], total
}

func AdminLogin(c *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	for _, admin := range config.DB.Admins {
		if admin.Username == loginData.Username && admin.Password == loginData.Password {
			token, err := middleware.GenerateToken(admin.ID, admin.Username, "admin")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"code": 200,
				"data": gin.H{
					"token": token,
					"user":  admin,
				},
			})
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
}

func AdminLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "退出成功"})
}

func GetAdminProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	config.DB.Lock()
	defer config.DB.Unlock()

	admin, exists := config.DB.Admins[userID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": admin})
}

func ChangeAdminPassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	admin, exists := config.DB.Admins[userID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if admin.Password != data.OldPassword {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "原密码错误"})
		return
	}

	admin.Password = data.NewPassword
	admin.UpdatedAt = time.Now()
	config.DB.Admins[userID] = admin

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "密码修改成功"})
}

func UserRegister(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	for _, u := range config.DB.Users {
		if u.Username == user.Username {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
			return
		}
	}

	config.DB.UserIDCounter++
	user.ID = config.DB.UserIDCounter
	user.Status = 1
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	config.DB.Users[user.ID] = user

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "注册成功", "data": user})
}

func UserLogin(c *gin.Context) {
	var loginData struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	for _, user := range config.DB.Users {
		if user.Username == loginData.Username && user.Password == loginData.Password {
			if user.Status != 1 {
				c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "账号未审核或已禁用"})
				return
			}
			token, err := middleware.GenerateToken(user.ID, user.Username, "user")
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "生成Token失败"})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"code": 200,
				"data": gin.H{
					"token": token,
					"user":  user,
				},
			})
			return
		}
	}

	c.JSON(http.StatusUnauthorized, gin.H{"code": 401, "message": "用户名或密码错误"})
}

func UserLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "退出成功"})
}

func GetUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	config.DB.Lock()
	defer config.DB.Unlock()

	user, exists := config.DB.Users[userID]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"code": 200, "data": user})
}

func UpdateUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")

	var data struct {
		Nickname string `json:"nickname"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Avatar   string `json:"avatar"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	user, exists := config.DB.Users[userID]
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
	if data.Avatar != "" {
		user.Avatar = data.Avatar
	}
	user.UpdatedAt = time.Now()
	config.DB.Users[userID] = user

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": user})
}

func ListAdminUsers(c *gin.Context) {
	page, pageSize := parsePageInfo(c)

	config.DB.Lock()
	defer config.DB.Unlock()

	var admins []models.Admin
	for _, admin := range config.DB.Admins {
		admins = append(admins, admin)
	}

	sort.Slice(admins, func(i, j int) bool {
		return admins[i].ID < admins[j].ID
	})

	paginated, total := paginate(admins, page, pageSize)

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

func CreateAdminUser(c *gin.Context) {
	var admin models.Admin
	if err := c.ShouldBindJSON(&admin); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	for _, a := range config.DB.Admins {
		if a.Username == admin.Username {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "用户名已存在"})
			return
		}
	}

	config.DB.AdminIDCounter++
	admin.ID = config.DB.AdminIDCounter
	admin.CreatedAt = time.Now()
	admin.UpdatedAt = time.Now()
	config.DB.Admins[admin.ID] = admin

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功", "data": admin})
}

func UpdateAdminUser(c *gin.Context) {
	id := parseUint(c.Param("id"))

	var data struct {
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	admin, exists := config.DB.Admins[id]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "用户不存在"})
		return
	}

	if data.Name != "" {
		admin.Name = data.Name
	}
	if data.Password != "" {
		admin.Password = data.Password
	}
	admin.UpdatedAt = time.Now()
	config.DB.Admins[id] = admin

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功", "data": admin})
}

func DeleteAdminUser(c *gin.Context) {
	id := parseUint(c.Param("id"))

	if id == 1 {
		c.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "不能删除超级管理员"})
		return
	}

	config.DB.Lock()
	defer config.DB.Unlock()

	delete(config.DB.Admins, id)

	c.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
