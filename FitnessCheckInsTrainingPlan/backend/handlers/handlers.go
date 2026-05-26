package handlers

import (
	"fitness-tracker/database"
	"fitness-tracker/models"
	"net/http"
	"sort"
	"time"

	"github.com/gin-gonic/gin"
)

func GetExercises(c *gin.Context) {
	var exercises []models.Exercise
	category := c.Query("category")
	
	query := database.DB
	if category != "" {
		query = query.Where("category = ?", category)
	}
	
	query.Find(&exercises)
	c.JSON(http.StatusOK, exercises)
}

func CreateExercise(c *gin.Context) {
	var exercise models.Exercise
	if err := c.ShouldBindJSON(&exercise); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&exercise)
	c.JSON(http.StatusOK, exercise)
}

func GetTrainingPlans(c *gin.Context) {
	var plans []models.TrainingPlan
	database.DB.Preload("Exercises").Find(&plans)
	c.JSON(http.StatusOK, plans)
}

func CreateTrainingPlan(c *gin.Context) {
	var plan models.TrainingPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&plan)
	for i := range plan.Exercises {
		plan.Exercises[i].PlanID = plan.ID
		database.DB.Create(&plan.Exercises[i])
	}
	c.JSON(http.StatusOK, plan)
}

func UpdateTrainingPlan(c *gin.Context) {
	id := c.Param("id")
	var plan models.TrainingPlan
	if err := c.ShouldBindJSON(&plan); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Model(&models.TrainingPlan{}).Where("id = ?", id).Updates(&plan)
	database.DB.Where("plan_id = ?", id).Delete(&models.PlanExercise{})
	for i := range plan.Exercises {
		plan.Exercises[i].PlanID = plan.ID
		database.DB.Create(&plan.Exercises[i])
	}
	c.JSON(http.StatusOK, plan)
}

func DeleteTrainingPlan(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.TrainingPlan{}, id)
	database.DB.Where("plan_id = ?", id).Delete(&models.PlanExercise{})
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func GetCheckIns(c *gin.Context) {
	var checkIns []models.CheckIn
	year := c.Query("year")
	month := c.Query("month")
	
	query := database.DB.Preload("Exercises")
	if year != "" && month != "" {
		prefix := year + "-" + month
		query = query.Where("date LIKE ?", prefix+"%")
	}
	
	query.Order("date desc").Find(&checkIns)
	c.JSON(http.StatusOK, checkIns)
}

func GetTodayCheckIn(c *gin.Context) {
	today := time.Now().Format("2006-01-02")
	var checkIn models.CheckIn
	result := database.DB.Preload("Exercises").Where("date = ?", today).First(&checkIn)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, checkIn)
}

func CreateCheckIn(c *gin.Context) {
	var checkIn models.CheckIn
	if err := c.ShouldBindJSON(&checkIn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if checkIn.Date == "" {
		checkIn.Date = time.Now().Format("2006-01-02")
	}
	
	database.DB.Create(&checkIn)
	for i := range checkIn.Exercises {
		checkIn.Exercises[i].CheckInID = checkIn.ID
		database.DB.Create(&checkIn.Exercises[i])
	}
	
	checkAchievements()
	c.JSON(http.StatusOK, checkIn)
}

func GetBodyRecords(c *gin.Context) {
	var records []models.BodyRecord
	database.DB.Order("date desc").Find(&records)
	c.JSON(http.StatusOK, records)
}

func CreateBodyRecord(c *gin.Context) {
	var record models.BodyRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	
	if record.Date == "" {
		record.Date = time.Now().Format("2006-01-02")
	}
	
	var existing models.BodyRecord
	result := database.DB.Where("date = ?", record.Date).First(&existing)
	if result.Error == nil {
		record.ID = existing.ID
		database.DB.Save(&record)
	} else {
		database.DB.Create(&record)
	}
	
	c.JSON(http.StatusOK, record)
}

func GetAchievements(c *gin.Context) {
	var achievements []models.Achievement
	database.DB.Find(&achievements)
	c.JSON(http.StatusOK, achievements)
}

func GetStats(c *gin.Context) {
	var stats models.UserStats
	
	var totalCheckIns int64
	database.DB.Model(&models.CheckIn{}).Where("completed = ?", true).Count(&totalCheckIns)
	stats.TotalCheckIns = int(totalCheckIns)
	
	stats.CurrentStreak = calculateCurrentStreak()
	stats.LongestStreak = calculateLongestStreak()
	
	var checkInExercises []models.CheckInExercise
	database.DB.Find(&checkInExercises)
	var totalWeight float64
	for _, e := range checkInExercises {
		totalWeight += float64(e.Sets * e.Reps) * e.Weight
	}
	stats.TotalWeightLifted = totalWeight
	
	c.JSON(http.StatusOK, stats)
}

func calculateCurrentStreak() int {
	var checkIns []models.CheckIn
	database.DB.Where("completed = ?", true).Order("date desc").Find(&checkIns)
	
	if len(checkIns) == 0 {
		return 0
	}
	
	streak := 0
	expectedDate := time.Now()
	todayStr := expectedDate.Format("2006-01-02")
	
	if checkIns[0].Date != todayStr {
		expectedDate = expectedDate.AddDate(0, 0, -1)
	}
	
	checkInMap := make(map[string]bool)
	for _, ci := range checkIns {
		checkInMap[ci.Date] = true
	}
	
	for {
		dateStr := expectedDate.Format("2006-01-02")
		if checkInMap[dateStr] {
			streak++
			expectedDate = expectedDate.AddDate(0, 0, -1)
		} else {
			break
		}
	}
	
	return streak
}

func calculateLongestStreak() int {
	var checkIns []models.CheckIn
	database.DB.Where("completed = ?", true).Order("date asc").Find(&checkIns)
	
	if len(checkIns) == 0 {
		return 0
	}
	
	dates := make([]time.Time, 0)
	for _, ci := range checkIns {
		t, _ := time.Parse("2006-01-02", ci.Date)
		dates = append(dates, t)
	}
	
	sort.Slice(dates, func(i, j int) bool {
		return dates[i].Before(dates[j])
	})
	
	longest := 1
	current := 1
	
	for i := 1; i < len(dates); i++ {
		diff := dates[i].Sub(dates[i-1]).Hours() / 24
		if diff == 1 {
			current++
			if current > longest {
				longest = current
			}
		} else if diff > 1 {
			current = 1
		}
	}
	
	return longest
}

func checkAchievements() {
	var stats models.UserStats
	var totalCheckIns int64
	database.DB.Model(&models.CheckIn{}).Where("completed = ?", true).Count(&totalCheckIns)
	stats.TotalCheckIns = int(totalCheckIns)
	stats.CurrentStreak = calculateCurrentStreak()
	
	var checkInExercises []models.CheckInExercise
	database.DB.Find(&checkInExercises)
	var totalWeight float64
	for _, e := range checkInExercises {
		totalWeight += float64(e.Sets * e.Reps) * e.Weight
	}
	stats.TotalWeightLifted = totalWeight
	
	today := time.Now().Format("2006-01-02")
	
	if stats.TotalCheckIns >= 1 {
		unlockAchievement(1, today)
	}
	if stats.CurrentStreak >= 7 {
		unlockAchievement(2, today)
	}
	if stats.CurrentStreak >= 30 {
		unlockAchievement(3, today)
	}
	if stats.TotalCheckIns >= 100 {
		unlockAchievement(4, today)
	}
	if stats.TotalWeightLifted >= 1000 {
		unlockAchievement(5, today)
	}
	if stats.TotalWeightLifted >= 10000 {
		unlockAchievement(6, today)
	}
}

func unlockAchievement(id int, date string) {
	var achievement models.Achievement
	database.DB.First(&achievement, id)
	if !achievement.Unlocked {
		achievement.Unlocked = true
		achievement.UnlockedAt = &date
		database.DB.Save(&achievement)
	}
}
