package controllers

import (
	"chain-store-inspection/database"
	"chain-store-inspection/models"
	"chain-store-inspection/utils"
	"crypto/md5"
	"encoding/hex"
	"io"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PhotoController struct{}

func NewPhotoController() *PhotoController {
	return &PhotoController{}
}

func (ctrl *PhotoController) UploadPhoto(c *gin.Context) {
	photoURL, fileSize, err := utils.UploadPhoto(c, "file")
	if err != nil {
		utils.BadRequestResponse(c, err.Error())
		return
	}

	recordID, _ := strconv.ParseUint(c.PostForm("recordId"), 10, 64)
	issueID, _ := strconv.ParseUint(c.PostForm("issueId"), 10, 64)
	longitude, _ := strconv.ParseFloat(c.PostForm("longitude"), 64)
	latitude, _ := strconv.ParseFloat(c.PostForm("latitude"), 64)
	locationAddress := c.PostForm("locationAddress")
	shootTimeStr := c.PostForm("shootTime")
	deviceType := c.PostForm("deviceType")
	deviceModel := c.PostForm("deviceModel")
	deviceUUID := c.PostForm("deviceUuid")
	uploaderID, _ := strconv.ParseUint(c.PostForm("uploaderId"), 10, 64)
	photoType := c.PostForm("photoType")

	if recordID == 0 && issueID == 0 {
		utils.DeletePhoto(photoURL)
		utils.BadRequestResponse(c, "记录ID或问题ID不能为空")
		return
	}

	var shootTime time.Time
	if shootTimeStr != "" {
		parsedTime, err := time.Parse(time.RFC3339, shootTimeStr)
		if err == nil {
			shootTime = parsedTime
		} else {
			shootTime = time.Now()
		}
	} else {
		shootTime = time.Now()
	}

	fullPath := utils.GetPhotoFullPath(photoURL)
	fileHash := ""
	if fullPath != "" {
		file, err := os.Open(fullPath)
		if err == nil {
			defer file.Close()
			hash := md5.New()
			if _, err := io.Copy(hash, file); err == nil {
				fileHash = hex.EncodeToString(hash.Sum(nil))
			}
		}
	}

	if photoType == "" {
		photoType = "inspection"
	}

	photo := models.Photo{
		RecordID:        recordID,
		IssueID:         issueID,
		PhotoURL:        photoURL,
		ThumbnailURL:    photoURL,
		PhotoType:       photoType,
		Longitude:       longitude,
		Latitude:        latitude,
		LocationAddress: locationAddress,
		ShootTime:       shootTime,
		DeviceType:      deviceType,
		DeviceModel:     deviceModel,
		DeviceUUID:      deviceUUID,
		FileSize:        fileSize,
		FileHash:        fileHash,
		IsValid:         1,
		UploaderID:      uploaderID,
		SyncStatus:      1,
	}

	if err := database.DB.Create(&photo).Error; err != nil {
		utils.DeletePhoto(photoURL)
		utils.InternalServerErrorResponse(c, "保存照片信息失败")
		return
	}

	if recordID > 0 {
		database.DB.Model(&models.InspectionRecord{}).
			Where("id = ?", recordID).
			Update("has_photo", 1)
	}

	utils.SuccessResponse(c, photo)
}

func (ctrl *PhotoController) GetPhotoDetail(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的照片ID")
		return
	}

	var photo models.Photo
	if err := database.DB.First(&photo, id).Error; err != nil {
		utils.NotFoundResponse(c, "照片不存在")
		return
	}

	utils.SuccessResponse(c, photo)
}

func (ctrl *PhotoController) GetPhotoList(c *gin.Context) {
	var photos []models.Photo

	recordID := c.Query("recordId")
	issueID := c.Query("issueId")

	if recordID == "" && issueID == "" {
		utils.BadRequestResponse(c, "记录ID或问题ID不能为空")
		return
	}

	query := database.DB.Model(&models.Photo{})

	if recordID != "" {
		query = query.Where("record_id = ?", recordID)
	}
	if issueID != "" {
		query = query.Where("issue_id = ?", issueID)
	}

	if err := query.Order("created_at DESC").Find(&photos).Error; err != nil {
		utils.InternalServerErrorResponse(c, "获取照片列表失败")
		return
	}

	utils.SuccessResponse(c, photos)
}

func (ctrl *PhotoController) DeletePhoto(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.BadRequestResponse(c, "无效的照片ID")
		return
	}

	var photo models.Photo
	if err := database.DB.First(&photo, id).Error; err != nil {
		utils.NotFoundResponse(c, "照片不存在")
		return
	}

	utils.DeletePhoto(photo.PhotoURL)

	if err := database.DB.Delete(&photo).Error; err != nil {
		utils.InternalServerErrorResponse(c, "删除照片失败")
		return
	}

	if photo.RecordID > 0 {
		var count int64
		database.DB.Model(&models.Photo{}).
			Where("record_id = ?", photo.RecordID).
			Count(&count)
		if count == 0 {
			database.DB.Model(&models.InspectionRecord{}).
				Where("id = ?", photo.RecordID).
				Update("has_photo", 0)
		}
	}

	utils.SuccessResponse(c, nil)
}
