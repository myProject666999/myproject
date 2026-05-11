package controllers

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"strayanimalrescueplatform/config"
	"strayanimalrescueplatform/models"
	"strayanimalrescueplatform/utils"
)

type LostPetRequest struct {
	Name         string `json:"name"`
	Breed        string `json:"breed"`
	Age          string `json:"age"`
	Gender       string `json:"gender"`
	Description  string `json:"description"`
	LostDate     string `json:"lost_date"`
	LostLocation string `json:"lost_location"`
	ContactPhone string `json:"contact_phone"`
	ContactName  string `json:"contact_name"`
	Images       string `json:"images"`
	CoverImage   string `json:"cover_image"`
}

func GetLostPets(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")
	location := c.Query("location")

	db := config.GetDB()
	query := db.Model(&models.LostPet{})

	if keyword != "" {
		query = query.Where("name LIKE ? OR breed LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if location != "" {
		query = query.Where("lost_location LIKE ?", "%"+location+"%")
	}

	var total int
	query.Count(&total)

	var lostPets []models.LostPet
	query.Preload("User").Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&lostPets)

	utils.Success(c, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      lostPets,
	})
}

func GetLostPet(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var lostPet models.LostPet
	db := config.GetDB()
	if err := db.Preload("User").First(&lostPet, id).Error; err != nil {
		utils.NotFound(c, "挂失信息不存在")
		return
	}
	utils.Success(c, lostPet)
}

func parseDate(dateStr string) time.Time {
	layouts := []string{
		"2006-01-02",
		"2006-01-02 15:04:05",
		"2006/01/02",
		"2006-01-02T15:04:05Z",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, dateStr); err == nil {
			return t
		}
	}
	return time.Now()
}

func CreateLostPet(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req LostPetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	lostPet := models.LostPet{
		UserID:       userID,
		Name:         req.Name,
		Breed:        req.Breed,
		Age:          req.Age,
		Gender:       req.Gender,
		Description:  req.Description,
		LostDate:     parseDate(req.LostDate),
		LostLocation: req.LostLocation,
		ContactPhone: req.ContactPhone,
		ContactName:  req.ContactName,
		Images:       req.Images,
		CoverImage:   req.CoverImage,
	}

	db := config.GetDB()
	if err := db.Create(&lostPet).Error; err != nil {
		utils.InternalServerError(c, "创建失败")
		return
	}

	utils.Success(c, lostPet)
}

func UpdateLostPet(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	var lostPet models.LostPet
	db := config.GetDB()
	if err := db.First(&lostPet, id).Error; err != nil {
		utils.NotFound(c, "挂失信息不存在")
		return
	}

	if lostPet.UserID != userID {
		utils.Forbidden(c, "无权修改")
		return
	}

	var req LostPetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误")
		return
	}

	if req.Name != "" {
		lostPet.Name = req.Name
	}
	if req.Breed != "" {
		lostPet.Breed = req.Breed
	}
	if req.Age != "" {
		lostPet.Age = req.Age
	}
	if req.Gender != "" {
		lostPet.Gender = req.Gender
	}
	if req.Description != "" {
		lostPet.Description = req.Description
	}
	if req.LostDate != "" {
		lostPet.LostDate = parseDate(req.LostDate)
	}
	if req.LostLocation != "" {
		lostPet.LostLocation = req.LostLocation
	}
	if req.ContactPhone != "" {
		lostPet.ContactPhone = req.ContactPhone
	}
	if req.ContactName != "" {
		lostPet.ContactName = req.ContactName
	}
	if req.Images != "" {
		lostPet.Images = req.Images
	}
	if req.CoverImage != "" {
		lostPet.CoverImage = req.CoverImage
	}

	db.Save(&lostPet)
	utils.Success(c, lostPet)
}

func DeleteLostPet(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.Atoi(c.Param("id"))

	db := config.GetDB()
	var lostPet models.LostPet
	if err := db.First(&lostPet, id).Error; err != nil {
		utils.NotFound(c, "挂失信息不存在")
		return
	}

	if lostPet.UserID != userID {
		utils.Forbidden(c, "无权删除")
		return
	}

	db.Delete(&lostPet)
	utils.SuccessWithMessage(c, "删除成功", nil)
}
