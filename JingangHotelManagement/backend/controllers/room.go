package controllers

import (
	"net/http"
	"time"

	"jingang-hotel-backend/config"
	"jingang-hotel-backend/models"

	"github.com/gin-gonic/gin"
)

type RoomController struct{}

func (c *RoomController) GetRoomTypes(ctx *gin.Context) {
	var roomTypes []models.RoomType
	config.DB.Where("status = ?", 1).Find(&roomTypes)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": roomTypes,
	})
}

func (c *RoomController) GetAvailableRooms(ctx *gin.Context) {
	checkInStr := ctx.Query("checkIn")
	checkOutStr := ctx.Query("checkOut")
	roomTypeID := ctx.Query("roomTypeId")

	checkIn, err := time.Parse("2006-01-02", checkInStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "入住时间格式错误"})
		return
	}

	checkOut, err := time.Parse("2006-01-02", checkOutStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "退房时间格式错误"})
		return
	}

	var occupiedRoomIDs []uint
	config.DB.Model(&models.Order{}).
		Where("status IN ? AND check_in < ? AND check_out > ?", []int{1, 2, 3, 4}, checkOut, checkIn).
		Pluck("room_id", &occupiedRoomIDs)

	var rooms []models.Room
	query := config.DB.Where("status = ?", 1)
	if roomTypeID != "" {
		query = query.Where("room_type_id = ?", roomTypeID)
	}
	if len(occupiedRoomIDs) > 0 {
		query = query.Where("id NOT IN ?", occupiedRoomIDs)
	}
	query.Preload("RoomType").Find(&rooms)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": rooms,
	})
}

func (c *RoomController) GetAdminRoomTypes(ctx *gin.Context) {
	var roomTypes []models.RoomType
	config.DB.Find(&roomTypes)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": roomTypes,
	})
}

func (c *RoomController) CreateRoomType(ctx *gin.Context) {
	var req models.RoomType
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&req).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功"})
}

func (c *RoomController) UpdateRoomType(ctx *gin.Context) {
	id := ctx.Param("id")
	var roomType models.RoomType
	config.DB.First(&roomType, id)

	if roomType.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "房型不存在"})
		return
	}

	var req models.RoomType
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Model(&roomType).Updates(req)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *RoomController) DeleteRoomType(ctx *gin.Context) {
	id := ctx.Param("id")
	config.DB.Delete(&models.RoomType{}, id)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}

func (c *RoomController) GetAdminRooms(ctx *gin.Context) {
	var rooms []models.Room
	config.DB.Preload("RoomType").Find(&rooms)

	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"data": rooms,
	})
}

func (c *RoomController) CreateRoom(ctx *gin.Context) {
	var req models.Room
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	if err := config.DB.Create(&req).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"code": 500, "message": "创建失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "创建成功"})
}

func (c *RoomController) UpdateRoom(ctx *gin.Context) {
	id := ctx.Param("id")
	var room models.Room
	config.DB.First(&room, id)

	if room.ID == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"code": 404, "message": "房间不存在"})
		return
	}

	var req models.Room
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"code": 400, "message": "参数错误"})
		return
	}

	config.DB.Model(&room).Updates(req)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "更新成功"})
}

func (c *RoomController) DeleteRoom(ctx *gin.Context) {
	id := ctx.Param("id")
	config.DB.Delete(&models.Room{}, id)

	ctx.JSON(http.StatusOK, gin.H{"code": 200, "message": "删除成功"})
}
