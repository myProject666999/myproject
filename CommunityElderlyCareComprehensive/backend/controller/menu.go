package controller

import (
	"community-care/config"
	"community-care/model"
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
)

func GetMenus(c *gin.Context) {
	var menus []model.Menu
	config.DB.Order("sort asc, id asc").Find(&menus)
	c.JSON(http.StatusOK, menus)
}

func GetMenuTree(c *gin.Context) {
	var menus []model.Menu
	config.DB.Order("sort asc, id asc").Find(&menus)

	menuMap := make(map[uint]*model.Menu)
	for i := range menus {
		menuMap[menus[i].ID] = &menus[i]
	}

	var tree []*model.Menu
	for i := range menus {
		if menus[i].ParentID == 0 {
			tree = append(tree, &menus[i])
		} else {
			if parent, exists := menuMap[menus[i].ParentID]; exists {
				parent.Children = append(parent.Children, menus[i])
			}
		}
	}

	sort.Slice(tree, func(i, j int) bool {
		return tree[i].Sort < tree[j].Sort
	})

	c.JSON(http.StatusOK, tree)
}

func GetMenu(c *gin.Context) {
	id := c.Param("id")

	var menu model.Menu
	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜单不存在"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func CreateMenu(c *gin.Context) {
	var menu model.Menu
	if err := c.ShouldBindJSON(&menu); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建菜单失败"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func UpdateMenu(c *gin.Context) {
	id := c.Param("id")

	var menu model.Menu
	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜单不存在"})
		return
	}

	if err := c.ShouldBindJSON(&menu); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Save(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新菜单失败"})
		return
	}

	c.JSON(http.StatusOK, menu)
}

func DeleteMenu(c *gin.Context) {
	id := c.Param("id")

	var menu model.Menu
	if err := config.DB.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "菜单不存在"})
		return
	}

	tx := config.DB.Begin()
	tx.Where("menu_id = ?", id).Delete(&model.RoleMenu{})
	if err := tx.Delete(&menu).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除菜单失败"})
		return
	}
	tx.Commit()

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
