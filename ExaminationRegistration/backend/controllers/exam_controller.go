package controllers

import (
	"strconv"
	"time"

	"examination-registration/database"
	"examination-registration/models"
	"examination-registration/utils"

	"github.com/gin-gonic/gin"
)

func GetPaperList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	category := c.Query("category")

	offset := (page - 1) * pageSize

	var papers []models.ExamPaper
	var total int64

	query := database.DB.Model(&models.ExamPaper{}).Where("status = ?", 1)
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Count(&total)
	query.Order("sort DESC, id DESC").Offset(offset).Limit(pageSize).Find(&papers)

	utils.Success(c, gin.H{
		"list":      papers,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetPaperDetail(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var paper models.ExamPaper
	if result := database.DB.First(&paper, id); result.Error != nil {
		utils.NotFound(c, "试卷不存在")
		return
	}

	utils.Success(c, paper)
}

func GetPaperQuestions(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var questions []models.Question
	database.DB.Where("paper_id = ?", id).Order("sort ASC, id ASC").Find(&questions)

	for i := range questions {
		var options []models.QuestionOption
		database.DB.Where("question_id = ?", questions[i].ID).Order("sort ASC, id ASC").Find(&options)
		questions[i].Analysis = ""
	}

	utils.Success(c, questions)
}

func StartExam(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var paper models.ExamPaper
	if result := database.DB.First(&paper, id); result.Error != nil {
		utils.NotFound(c, "试卷不存在")
		return
	}

	now := time.Now()
	record := models.ExamRecord{
		UserID:     userID,
		PaperID:    paper.ID,
		PaperTitle: paper.Title,
		TotalScore: paper.TotalScore,
		StartTime:  &now,
	}
	database.DB.Create(&record)

	utils.Success(c, gin.H{
		"record_id": record.ID,
		"duration":  paper.Duration,
	})
}

func SubmitExam(c *gin.Context) {
	userID := c.GetUint("user_id")
	recordID, _ := strconv.ParseUint(c.Param("record_id"), 10, 32)

	var req struct {
		Answers []struct {
			QuestionID uint   `json:"question_id"`
			Answer     string `json:"answer"`
		} `json:"answers"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var record models.ExamRecord
	if result := database.DB.Where("id = ? AND user_id = ?", recordID, userID).First(&record); result.Error != nil {
		utils.NotFound(c, "考试记录不存在")
		return
	}

	if record.EndTime != nil {
		utils.BadRequest(c, "考试已提交")
		return
	}

	now := time.Now()
	totalScore := 0

	for _, answer := range req.Answers {
		var question models.Question
		if result := database.DB.First(&question, answer.QuestionID); result.Error != nil {
			continue
		}

		isCorrect := 0
		score := 0
		if answer.Answer == question.Answer {
			isCorrect = 1
			score = question.Score
			totalScore += score
		}

		examAnswer := models.ExamAnswer{
			ExamRecordID:  record.ID,
			QuestionID:    question.ID,
			UserAnswer:    answer.Answer,
			CorrectAnswer: question.Answer,
			IsCorrect:     isCorrect,
			Score:         score,
		}
		database.DB.Create(&examAnswer)

		if isCorrect == 0 {
			var wrongQuestion models.WrongQuestion
			result := database.DB.Where("user_id = ? AND question_id = ?", userID, question.ID).First(&wrongQuestion)
			if result.RowsAffected > 0 {
				database.DB.Model(&wrongQuestion).UpdateColumn("wrong_count", wrongQuestion.WrongCount+1)
			} else {
				database.DB.Create(&models.WrongQuestion{
					UserID:     userID,
					QuestionID: question.ID,
					PaperID:    record.PaperID,
					WrongCount: 1,
				})
			}
		}
	}

	isPass := 0
	var paper models.ExamPaper
	database.DB.First(&paper, record.PaperID)
	if totalScore >= paper.PassScore {
		isPass = 1
	}

	duration := 0
	if record.StartTime != nil {
		duration = int(now.Sub(*record.StartTime).Seconds())
	}

	database.DB.Model(&record).Updates(map[string]interface{}{
		"score":    totalScore,
		"is_pass":  isPass,
		"end_time": &now,
		"duration": duration,
	})

	utils.Success(c, gin.H{
		"score":      totalScore,
		"total_score": paper.TotalScore,
		"is_pass":    isPass,
	})
}

func GetExamRecordList(c *gin.Context) {
	userID := c.GetUint("user_id")

	var records []models.ExamRecord
	database.DB.Where("user_id = ?", userID).Order("id DESC").Find(&records)

	utils.Success(c, records)
}

func GetExamRecordDetail(c *gin.Context) {
	userID := c.GetUint("user_id")
	recordID, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var record models.ExamRecord
	if result := database.DB.Where("id = ? AND user_id = ?", recordID, userID).First(&record); result.Error != nil {
		utils.NotFound(c, "考试记录不存在")
		return
	}

	var answers []models.ExamAnswer
	database.DB.Where("exam_record_id = ?", recordID).Find(&answers)

	utils.Success(c, gin.H{
		"record":  record,
		"answers": answers,
	})
}

func GetWrongQuestionList(c *gin.Context) {
	userID := c.GetUint("user_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var wrongQuestions []models.WrongQuestion
	var total int64

	query := database.DB.Model(&models.WrongQuestion{}).Where("user_id = ?", userID)
	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&wrongQuestions)

	for i := range wrongQuestions {
		var question models.Question
		database.DB.First(&question, wrongQuestions[i].QuestionID)
	}

	utils.Success(c, gin.H{
		"list":      wrongQuestions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func RemoveWrongQuestion(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&models.WrongQuestion{}); result.Error != nil {
		utils.InternalError(c, "删除失败")
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func AdminGetPaperList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	keyword := c.Query("keyword")

	offset := (page - 1) * pageSize

	var papers []models.ExamPaper
	var total int64

	query := database.DB.Model(&models.ExamPaper{})
	if keyword != "" {
		query = query.Where("title LIKE ?", "%"+keyword+"%")
	}

	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&papers)

	utils.Success(c, gin.H{
		"list":      papers,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminCreatePaper(c *gin.Context) {
	var paper models.ExamPaper
	if err := c.ShouldBindJSON(&paper); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if result := database.DB.Create(&paper); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "创建成功", paper)
}

func AdminUpdatePaper(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var paper models.ExamPaper
	if result := database.DB.First(&paper, id); result.Error != nil {
		utils.NotFound(c, "试卷不存在")
		return
	}

	if err := c.ShouldBindJSON(&paper); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	database.DB.Save(&paper)
	utils.SuccessWithMessage(c, "更新成功", paper)
}

func AdminDeletePaper(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.ExamPaper{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func AdminGetQuestionList(c *gin.Context) {
	paperID := c.Query("paper_id")

	var questions []models.Question
	query := database.DB.Model(&models.Question{})
	if paperID != "" {
		query = query.Where("paper_id = ?", paperID)
	}
	query.Order("sort ASC, id ASC").Find(&questions)

	utils.Success(c, questions)
}

func AdminCreateQuestion(c *gin.Context) {
	var req struct {
		models.Question
		Options []models.QuestionOption `json:"options"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	if result := database.DB.Create(&req.Question); result.Error != nil {
		utils.InternalError(c, "创建失败: "+result.Error.Error())
		return
	}

	for i := range req.Options {
		req.Options[i].QuestionID = req.Question.ID
	}
	if len(req.Options) > 0 {
		database.DB.Create(&req.Options)
	}

	utils.SuccessWithMessage(c, "创建成功", req.Question)
}

func AdminUpdateQuestion(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var req struct {
		models.Question
		Options []models.QuestionOption `json:"options"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.BadRequest(c, "参数错误: "+err.Error())
		return
	}

	var question models.Question
	if result := database.DB.First(&question, id); result.Error != nil {
		utils.NotFound(c, "试题不存在")
		return
	}

	database.DB.Save(&req.Question)
	database.DB.Where("question_id = ?", id).Delete(&models.QuestionOption{})

	for i := range req.Options {
		req.Options[i].QuestionID = question.ID
	}
	if len(req.Options) > 0 {
		database.DB.Create(&req.Options)
	}

	utils.SuccessWithMessage(c, "更新成功", req.Question)
}

func AdminDeleteQuestion(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	if result := database.DB.Delete(&models.Question{}, id); result.Error != nil {
		utils.InternalError(c, "删除失败: "+result.Error.Error())
		return
	}

	database.DB.Where("question_id = ?", id).Delete(&models.QuestionOption{})

	utils.SuccessWithMessage(c, "删除成功", nil)
}

func AdminGetExamRecordList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var records []models.ExamRecord
	var total int64

	query := database.DB.Model(&models.ExamRecord{})
	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&records)

	utils.Success(c, gin.H{
		"list":      records,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminGetWrongQuestionList(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	offset := (page - 1) * pageSize

	var wrongQuestions []models.WrongQuestion
	var total int64

	query := database.DB.Model(&models.WrongQuestion{})
	query.Count(&total)
	query.Order("id DESC").Offset(offset).Limit(pageSize).Find(&wrongQuestions)

	utils.Success(c, gin.H{
		"list":      wrongQuestions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}
