package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"online-quiz-game/config"
	"online-quiz-game/database"
	"online-quiz-game/models"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	Cfg *config.Config
}

func NewHandler(cfg *config.Config) *Handler {
	return &Handler{Cfg: cfg}
}

func (h *Handler) Response(c *gin.Context, code int, message string, data interface{}) {
	c.JSON(code, models.APIResponse{
		Code:    code,
		Message: message,
		Data:    data,
	})
}

func (h *Handler) GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := database.MySQLDB.Find(&categories).Error; err != nil {
		h.Response(c, 500, "获取分类失败", nil)
		return
	}
	h.Response(c, 200, "success", categories)
}

func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Nickname string `json:"nickname" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	var user models.User
	err := database.MySQLDB.Where("username = ?", req.Username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			avatar := fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", req.Username)
			user = models.User{
				Username: req.Username,
				Nickname: req.Nickname,
				Avatar:   avatar,
			}
			if err := database.MySQLDB.Create(&user).Error; err != nil {
				h.Response(c, 500, "创建用户失败", nil)
				return
			}
		} else {
			h.Response(c, 500, "数据库错误", nil)
			return
		}
	} else {
		user.Nickname = req.Nickname
		database.MySQLDB.Save(&user)
	}

	h.Response(c, 200, "登录成功", gin.H{
		"userId":   user.ID,
		"username": user.Username,
		"nickname": user.Nickname,
		"avatar":   user.Avatar,
	})
}

func (h *Handler) StartQuiz(c *gin.Context) {
	var req models.StartQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	var user models.User
	err := database.MySQLDB.Where("username = ?", req.Username).First(&user).Error
	if err != nil {
		avatar := fmt.Sprintf("https://api.dicebear.com/7.x/avataaars/svg?seed=%s", req.Username)
		user = models.User{
			Username: req.Username,
			Nickname: req.Nickname,
			Avatar:   avatar,
		}
		if err := database.MySQLDB.Create(&user).Error; err != nil {
			h.Response(c, 500, "创建用户失败", nil)
			return
		}
	}

	var categoryID *int
	if req.CategoryID > 0 {
		id := req.CategoryID
		categoryID = &id
	}

	gameRecord := models.GameRecord{
		UserID:         user.ID,
		CategoryID:     categoryID,
		TotalQuestions: req.NumQuestions,
	}
	now := time.Now()
	gameRecord.StartTime = &now
	if err := database.MySQLDB.Create(&gameRecord).Error; err != nil {
		h.Response(c, 500, "创建游戏记录失败", nil)
		return
	}

	var questions []models.Question
	query := database.MySQLDB
	if req.CategoryID > 0 {
		query = query.Where("category_id = ?", req.CategoryID)
	}
	query = query.Order("RAND()").Limit(req.NumQuestions)
	if err := query.Find(&questions).Error; err != nil {
		h.Response(c, 500, "获取题目失败", nil)
		return
	}

	var questionsForClient []models.QuestionForClient
	for _, q := range questions {
		questionsForClient = append(questionsForClient, models.QuestionForClient{
			ID:           q.ID,
			CategoryID:   q.CategoryID,
			QuestionText: q.QuestionText,
			OptionA:      q.OptionA,
			OptionB:      q.OptionB,
			OptionC:      q.OptionC,
			OptionD:      q.OptionD,
			Difficulty:   q.Difficulty,
		})
	}

	token := h.generateToken(gameRecord.ID, now)
	session := &models.QuizSession{
		GameID:      gameRecord.ID,
		UserID:      user.ID,
		StartTime:   now,
		ServerToken: token,
	}
	database.CacheQuizSession(session)

	h.Response(c, 200, "答题开始", gin.H{
		"gameId":    gameRecord.ID,
		"questions": questionsForClient,
		"quizTime":  h.Cfg.QuizTime,
		"token":     token,
	})
}

func (h *Handler) SubmitAnswer(c *gin.Context) {
	var req models.SubmitAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	_, err := database.GetQuizSession(req.GameID)
	if err != nil {
		h.Response(c, 400, "会话已过期，请重新开始", nil)
		return
	}

	var question models.Question
	if err := database.MySQLDB.First(&question, req.QuestionID).Error; err != nil {
		h.Response(c, 400, "题目不存在", nil)
		return
	}

	isCorrect := req.UserAnswer == question.CorrectAnswer
	timeSpent := int(req.ClientTime)

	answerDetail := models.AnswerDetail{
		GameRecordID: req.GameID,
		QuestionID:   req.QuestionID,
		UserAnswer:   &req.UserAnswer,
		IsCorrect:    0,
		TimeSpent:    timeSpent,
	}
	if isCorrect {
		answerDetail.IsCorrect = 1
	}

	if err := database.MySQLDB.Create(&answerDetail).Error; err != nil {
		h.Response(c, 500, "保存答案失败", nil)
		return
	}

	h.Response(c, 200, "答案已提交", gin.H{
		"isCorrect":     isCorrect,
		"correctAnswer": question.CorrectAnswer,
		"explanation":   question.Explanation,
	})
}

func (h *Handler) FinishQuiz(c *gin.Context) {
	var req struct {
		GameID int64 `json:"gameId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	var gameRecord models.GameRecord
	if err := database.MySQLDB.First(&gameRecord, req.GameID).Error; err != nil {
		h.Response(c, 400, "游戏记录不存在", nil)
		return
	}

	var answerDetails []models.AnswerDetail
	database.MySQLDB.Where("game_record_id = ?", req.GameID).Find(&answerDetails)

	correctCount := 0
	maxCombo := 0
	currentCombo := 0
	totalScore := 0

	for _, detail := range answerDetails {
		if detail.IsCorrect == 1 {
			correctCount++
			currentCombo++
			if currentCombo > maxCombo {
				maxCombo = currentCombo
			}
			baseScore := 100
			comboBonus := 0
			if currentCombo >= 3 {
				comboBonus = h.Cfg.ComboBonus
			}
			totalScore += baseScore + comboBonus
		} else {
			currentCombo = 0
		}
	}

	endTime := time.Now()
	gameRecord.CorrectCount = correctCount
	gameRecord.Score = totalScore
	gameRecord.MaxCombo = maxCombo
	gameRecord.EndTime = &endTime

	database.MySQLDB.Save(&gameRecord)

	var user models.User
	database.MySQLDB.First(&user, gameRecord.UserID)
	user.TotalScore += totalScore
	user.TotalGames++
	database.MySQLDB.Save(&user)

	database.IncrementScore(user.ID, int64(totalScore), "daily")
	database.IncrementScore(user.ID, int64(totalScore), "weekly")
	database.IncrementScore(user.ID, int64(totalScore), "total")

	database.DeleteQuizSession(req.GameID)

	h.Response(c, 200, "答题结束", gin.H{
		"score":          totalScore,
		"correctCount":   correctCount,
		"totalQuestions": gameRecord.TotalQuestions,
		"maxCombo":       maxCombo,
		"accuracy":       float64(correctCount) / float64(gameRecord.TotalQuestions) * 100,
	})
}

func (h *Handler) GetLeaderboard(c *gin.Context) {
	period := c.Query("period")
	if period == "" {
		period = "total"
	}

	limitStr := c.Query("limit")
	limit, _ := strconv.ParseInt(limitStr, 10, 10)
	if limit <= 0 {
		limit = 10
	}

	entries, err := database.GetLeaderboard(period, limit)
	if err != nil {
		h.Response(c, 500, "获取排行榜失败", nil)
		return
	}

	h.Response(c, 200, "success", entries)
}

func (h *Handler) GetHistory(c *gin.Context) {
	userIDStr := c.Query("userId")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		h.Response(c, 400, "用户ID错误", nil)
		return
	}

	var gameRecords []models.GameRecord
	if err := database.MySQLDB.Where("user_id = ?", userID).Order("created_at desc").Limit(20).Find(&gameRecords).Error; err != nil {
		h.Response(c, 500, "获取历史记录失败", nil)
		return
	}

	h.Response(c, 200, "success", gameRecords)
}

func (h *Handler) GetGameDetail(c *gin.Context) {
	gameIDStr := c.Query("gameId")
	gameID, err := strconv.ParseInt(gameIDStr, 10, 64)
	if err != nil {
		h.Response(c, 400, "游戏ID错误", nil)
		return
	}

	var gameRecord models.GameRecord
	if err := database.MySQLDB.First(&gameRecord, gameID).Error; err != nil {
		h.Response(c, 400, "游戏记录不存在", nil)
		return
	}

	var answerDetails []models.AnswerDetail
	database.MySQLDB.Where("game_record_id = ?", gameID).Find(&answerDetails)

	type AnswerWithQuestion struct {
		models.AnswerDetail
		QuestionText string `json:"questionText"`
		OptionA      string `json:"optionA"`
		OptionB      string `json:"optionB"`
		OptionC      string `json:"optionC"`
		OptionD      string `json:"optionD"`
		CorrectAnswer string `json:"correctAnswer"`
		Explanation  string `json:"explanation"`
	}

	var result []AnswerWithQuestion
	for _, detail := range answerDetails {
		var question models.Question
		database.MySQLDB.First(&question, detail.QuestionID)
		result = append(result, AnswerWithQuestion{
			AnswerDetail:  detail,
			QuestionText:  question.QuestionText,
			OptionA:       question.OptionA,
			OptionB:       question.OptionB,
			OptionC:       question.OptionC,
			OptionD:       question.OptionD,
			CorrectAnswer: question.CorrectAnswer,
			Explanation:   question.Explanation,
		})
	}

	h.Response(c, 200, "success", gin.H{
		"gameInfo": gameRecord,
		"details":  result,
	})
}

func (h *Handler) GetUserRank(c *gin.Context) {
	userIDStr := c.Query("userId")
	userID, err := strconv.ParseInt(userIDStr, 10, 64)
	if err != nil {
		h.Response(c, 400, "用户ID错误", nil)
		return
	}

	period := c.Query("period")
	if period == "" {
		period = "total"
	}

	key := database.GetLeaderboardKey(period)
	member := fmt.Sprintf("user:%d", userID)
	rank, err := database.RedisClient.ZRevRank(database.Ctx, key, member).Result()
	if err != nil {
		h.Response(c, 404, "用户未上榜", nil)
		return
	}

	score, _ := database.RedisClient.ZScore(database.Ctx, key, member).Result()

	h.Response(c, 200, "success", gin.H{
		"rank":  rank + 1,
		"score": int64(score),
	})
}

func (h *Handler) generateToken(gameID int64, t time.Time) string {
	raw := fmt.Sprintf("%d-%s-%d", gameID, uuid.New().String(), t.UnixNano())
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])[:32]
}

func (h *Handler) GetQuestionsByCategory(c *gin.Context) {
	categoryIDStr := c.Query("categoryId")
	categoryID, err := strconv.Atoi(categoryIDStr)
	if err != nil {
		h.Response(c, 400, "分类ID错误", nil)
		return
	}

	var questions []models.Question
	database.MySQLDB.Where("category_id = ?", categoryID).Find(&questions)
	h.Response(c, 200, "success", questions)
}

func (h *Handler) HealthCheck(c *gin.Context) {
	h.Response(c, 200, "ok", gin.H{
		"status": "running",
		"time":   time.Now().Format(time.RFC3339),
	})
}

func (h *Handler) AddQuestion(c *gin.Context) {
	var question models.Question
	if err := c.ShouldBindJSON(&question); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	if err := database.MySQLDB.Create(&question).Error; err != nil {
		log.Printf("添加题目失败: %v", err)
		h.Response(c, 500, "添加题目失败", nil)
		return
	}

	h.Response(c, 200, "添加成功", question)
}

func (h *Handler) GetAllQuestions(c *gin.Context) {
	categoryIDStr := c.Query("categoryId")
	pageStr := c.Query("page")
	sizeStr := c.Query("size")

	page, _ := strconv.Atoi(pageStr)
	size, _ := strconv.Atoi(sizeStr)
	if page <= 0 {
		page = 1
	}
	if size <= 0 {
		size = 20
	}

	var questions []models.Question
	var total int64

	query := database.MySQLDB.Model(&models.Question{})
	if categoryIDStr != "" {
		categoryID, _ := strconv.Atoi(categoryIDStr)
		query = query.Where("category_id = ?", categoryID)
	}

	query.Count(&total)
	query.Offset((page - 1) * size).Limit(size).Find(&questions)

	h.Response(c, 200, "success", gin.H{
		"list":     questions,
		"total":    total,
		"page":     page,
		"pageSize": size,
	})
}

func (h *Handler) DeleteQuestion(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.Response(c, 400, "ID错误", nil)
		return
	}

	if err := database.MySQLDB.Delete(&models.Question{}, id).Error; err != nil {
		h.Response(c, 500, "删除失败", nil)
		return
	}

	h.Response(c, 200, "删除成功", nil)
}

func (h *Handler) UpdateQuestion(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		h.Response(c, 400, "ID错误", nil)
		return
	}

	var question models.Question
	if err := c.ShouldBindJSON(&question); err != nil {
		h.Response(c, 400, "参数错误", nil)
		return
	}

	question.ID = id
	if err := database.MySQLDB.Save(&question).Error; err != nil {
		h.Response(c, 500, "更新失败", nil)
		return
	}

	h.Response(c, 200, "更新成功", question)
}
