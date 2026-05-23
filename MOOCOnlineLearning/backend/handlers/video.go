package handlers

import (
	"net/http"
	"strconv"

	"mooc-platform/middleware"
	"mooc-platform/services"
	"mooc-platform/utils"

	"github.com/gin-gonic/gin"
)

type VideoHandler struct {
	videoService *services.VideoService
}

func NewVideoHandler(videoService *services.VideoService) *VideoHandler {
	return &VideoHandler{videoService: videoService}
}

func (h *VideoHandler) Upload(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "请选择文件", nil)
		return
	}
	defer file.Close()

	courseID, _ := strconv.ParseUint(c.PostForm("course_id"), 10, 64)
	chapterID, _ := strconv.ParseUint(c.PostForm("chapter_id"), 10, 64)
	title := c.PostForm("title")

	userID, _ := c.Get(middleware.UserIDKey)

	video, err := h.videoService.Upload(uint64(userID.(uint)), courseID, chapterID, title, file, header)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "上传失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "上传成功", video)
}

func (h *VideoHandler) InitChunk(c *gin.Context) {
	var req struct {
		Filename   string `json:"filename" binding:"required"`
		TotalSize  int64  `json:"total_size" binding:"required"`
		ChunkSize  int64  `json:"chunk_size" binding:"required"`
		TotalChunk int    `json:"total_chunk" binding:"required"`
		CourseID   uint64 `json:"course_id"`
		ChapterID  uint64 `json:"chapter_id"`
		Title      string `json:"title"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	uploadID, err := h.videoService.InitChunkUpload(uint64(userID.(uint)), req.CourseID, req.ChapterID, req.Title, req.Filename, req.TotalSize, req.ChunkSize, req.TotalChunk)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "初始化失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "初始化成功", gin.H{"upload_id": uploadID})
}

func (h *VideoHandler) UploadChunk(c *gin.Context) {
	uploadID := c.PostForm("upload_id")
	chunkIndex, _ := strconv.Atoi(c.PostForm("chunk_index"))
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}
	defer file.Close()

	if err := h.videoService.UploadChunk(uploadID, chunkIndex, file); err != nil {
		utils.Response(c, http.StatusInternalServerError, "分片上传失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "分片上传成功", nil)
}

func (h *VideoHandler) CompleteChunk(c *gin.Context) {
	var req struct {
		UploadID string `json:"upload_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	video, err := h.videoService.CompleteChunkUpload(req.UploadID)
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "合并失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "合并成功", video)
}

func (h *VideoHandler) GetPlaySign(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	userID, _ := c.Get(middleware.UserIDKey)

	signInfo, err := h.videoService.GetPlaySign(id, uint64(userID.(uint)))
	if err != nil {
		utils.Response(c, http.StatusInternalServerError, "获取签名失败", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", signInfo)
}

func (h *VideoHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		utils.Response(c, http.StatusBadRequest, "参数错误", nil)
		return
	}

	video, err := h.videoService.GetByID(id)
	if err != nil {
		utils.Response(c, http.StatusNotFound, "视频不存在", nil)
		return
	}

	utils.Response(c, http.StatusOK, "获取成功", video)
}
