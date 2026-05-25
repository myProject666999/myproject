package handlers

import (
	"database/sql"
	"log"
	"strconv"
	"strings"
	"time"

	"healthy-diet-backend/database"
	"healthy-diet-backend/models"

	"github.com/gofiber/fiber/v2"
)

func success(c *fiber.Ctx, data interface{}) error {
	return c.JSON(models.Response{Code: 0, Message: "success", Data: data})
}

func fail(c *fiber.Ctx, msg string) error {
	return c.JSON(models.Response{Code: 1, Message: msg})
}

func GetFoods(c *fiber.Ctx) error {
	category := c.Query("category", "")
	search := c.Query("search", "")

	query := `SELECT id, name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit, is_custom, created_at, updated_at FROM foods WHERE 1=1`
	var args []interface{}

	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}
	if search != "" {
		query += " AND name LIKE ?"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY category, name"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return fail(c, err.Error())
	}
	defer rows.Close()

	foods := []models.Food{}
	for rows.Next() {
		var f models.Food
		rows.Scan(&f.ID, &f.Name, &f.Category, &f.Calories, &f.Protein, &f.Carbs, &f.Fat, &f.Fiber, &f.ServingSize, &f.ServingUnit, &f.IsCustom, &f.CreatedAt, &f.UpdatedAt)
		foods = append(foods, f)
	}
	return success(c, foods)
}

func GetFood(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var f models.Food
	err := database.DB.QueryRow(
		`SELECT id, name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit, is_custom, created_at, updated_at FROM foods WHERE id = ?`, id,
	).Scan(&f.ID, &f.Name, &f.Category, &f.Calories, &f.Protein, &f.Carbs, &f.Fat, &f.Fiber, &f.ServingSize, &f.ServingUnit, &f.IsCustom, &f.CreatedAt, &f.UpdatedAt)
	if err == sql.ErrNoRows {
		return fail(c, "食物不存在")
	}
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, f)
}

func CreateFood(c *fiber.Ctx) error {
	var f models.Food
	if err := c.BodyParser(&f); err != nil {
		return fail(c, err.Error())
	}
	f.IsCustom = 1

	result, err := database.DB.Exec(
		`INSERT INTO foods (name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit, is_custom) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		f.Name, f.Category, f.Calories, f.Protein, f.Carbs, f.Fat, f.Fiber, f.ServingSize, f.ServingUnit, f.IsCustom,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	id, _ := result.LastInsertId()
	f.ID = int(id)
	return success(c, f)
}

func UpdateFood(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	var f models.Food
	if err := c.BodyParser(&f); err != nil {
		return fail(c, err.Error())
	}

	_, err := database.DB.Exec(
		`UPDATE foods SET name=?, category=?, calories=?, protein=?, carbs=?, fat=?, fiber=?, serving_size=?, serving_unit=? WHERE id=?`,
		f.Name, f.Category, f.Calories, f.Protein, f.Carbs, f.Fat, f.Fiber, f.ServingSize, f.ServingUnit, id,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, nil)
}

func DeleteFood(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	_, err := database.DB.Exec(`DELETE FROM foods WHERE id = ? AND is_custom = 1`, id)
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, nil)
}

func GetFoodCategories(c *fiber.Ctx) error {
	rows, err := database.DB.Query(`SELECT DISTINCT category FROM foods ORDER BY category`)
	if err != nil {
		return fail(c, err.Error())
	}
	defer rows.Close()

	categories := []string{}
	for rows.Next() {
		var cat string
		rows.Scan(&cat)
		categories = append(categories, cat)
	}
	return success(c, categories)
}

func GetMealsByDate(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))

	rows, err := database.DB.Query(
		`SELECT id, user_id, meal_type, meal_date, total_calories, total_protein, total_carbs, total_fat, notes, created_at, updated_at FROM meals WHERE meal_date = ? ORDER BY 
CASE meal_type 
WHEN '早餐' THEN 1 
WHEN '午餐' THEN 2 
WHEN '晚餐' THEN 3 
WHEN '加餐' THEN 4 
ELSE 5 END`,
		date,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	defer rows.Close()

	meals := []models.Meal{}
	for rows.Next() {
		var m models.Meal
		rows.Scan(&m.ID, &m.UserID, &m.MealType, &m.MealDate, &m.TotalCalories, &m.TotalProtein, &m.TotalCarbs, &m.TotalFat, &m.Notes, &m.CreatedAt, &m.UpdatedAt)
		meals = append(meals, m)
	}

	for i := range meals {
		meals[i].Items = getMealItems(meals[i].ID)
	}

	return success(c, meals)
}

func getMealItems(mealID int) []models.MealItem {
	rows, err := database.DB.Query(
		`SELECT mi.id, mi.meal_id, mi.food_id, mi.quantity, mi.calories, mi.protein, mi.carbs, mi.fat, f.name 
FROM meal_items mi 
LEFT JOIN foods f ON mi.food_id = f.id 
WHERE mi.meal_id = ?`,
		mealID,
	)
	if err != nil {
		return []models.MealItem{}
	}
	defer rows.Close()

	items := []models.MealItem{}
	for rows.Next() {
		var item models.MealItem
		rows.Scan(&item.ID, &item.MealID, &item.FoodID, &item.Quantity, &item.Calories, &item.Protein, &item.Carbs, &item.Fat, &item.FoodName)
		items = append(items, item)
	}
	return items
}

func CreateMeal(c *fiber.Ctx) error {
	var m models.Meal
	if err := c.BodyParser(&m); err != nil {
		return fail(c, err.Error())
	}

	if m.MealDate == "" {
		m.MealDate = time.Now().Format("2006-01-02")
	}

	result, err := database.DB.Exec(
		`INSERT INTO meals (user_id, meal_type, meal_date, notes) VALUES (?, ?, ?, ?)`,
		1, m.MealType, m.MealDate, m.Notes,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	id, _ := result.LastInsertId()
	m.ID = int(id)
	return success(c, m)
}

func AddMealItem(c *fiber.Ctx) error {
	mealID, _ := strconv.Atoi(c.Params("id"))
	var item models.MealItem
	if err := c.BodyParser(&item); err != nil {
		return fail(c, err.Error())
	}

	var food models.Food
	err := database.DB.QueryRow(
		`SELECT id, calories, protein, carbs, fat, serving_size FROM foods WHERE id = ?`, item.FoodID,
	).Scan(&food.ID, &food.Calories, &food.Protein, &food.Carbs, &food.Fat, &food.ServingSize)
	if err != nil {
		return fail(c, "食物不存在")
	}

	ratio := item.Quantity / food.ServingSize
	item.Calories = food.Calories * ratio
	item.Protein = food.Protein * ratio
	item.Carbs = food.Carbs * ratio
	item.Fat = food.Fat * ratio
	item.MealID = mealID

	result, err := database.DB.Exec(
		`INSERT INTO meal_items (meal_id, food_id, quantity, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		item.MealID, item.FoodID, item.Quantity, item.Calories, item.Protein, item.Carbs, item.Fat,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	id, _ := result.LastInsertId()
	item.ID = int(id)

	updateMealTotals(mealID)

	return success(c, item)
}

func UpdateMealItem(c *fiber.Ctx) error {
	itemID, _ := strconv.Atoi(c.Params("itemId"))
	var item models.MealItem
	if err := c.BodyParser(&item); err != nil {
		return fail(c, err.Error())
	}

	var food models.Food
	err := database.DB.QueryRow(
		`SELECT calories, protein, carbs, fat, serving_size FROM foods WHERE id = ?`, item.FoodID,
	).Scan(&food.Calories, &food.Protein, &food.Carbs, &food.Fat, &food.ServingSize)
	if err != nil {
		return fail(c, "食物不存在")
	}

	ratio := item.Quantity / food.ServingSize
	item.Calories = food.Calories * ratio
	item.Protein = food.Protein * ratio
	item.Carbs = food.Carbs * ratio
	item.Fat = food.Fat * ratio

	_, err = database.DB.Exec(
		`UPDATE meal_items SET quantity=?, calories=?, protein=?, carbs=?, fat=? WHERE id=?`,
		item.Quantity, item.Calories, item.Protein, item.Carbs, item.Fat, itemID,
	)
	if err != nil {
		return fail(c, err.Error())
	}

	var mealID int
	database.DB.QueryRow(`SELECT meal_id FROM meal_items WHERE id = ?`, itemID).Scan(&mealID)
	updateMealTotals(mealID)

	return success(c, nil)
}

func DeleteMealItem(c *fiber.Ctx) error {
	itemID, _ := strconv.Atoi(c.Params("itemId"))
	var mealID int
	database.DB.QueryRow(`SELECT meal_id FROM meal_items WHERE id = ?`, itemID).Scan(&mealID)

	_, err := database.DB.Exec(`DELETE FROM meal_items WHERE id = ?`, itemID)
	if err != nil {
		return fail(c, err.Error())
	}

	updateMealTotals(mealID)
	return success(c, nil)
}

func DeleteMeal(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	_, err := database.DB.Exec(`DELETE FROM meals WHERE id = ?`, id)
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, nil)
}

func updateMealTotals(mealID int) {
	var m models.Meal
	err := database.DB.QueryRow(
		`SELECT id, meal_date FROM meals WHERE id = ?`, mealID,
	).Scan(&m.ID, &m.MealDate)
	if err != nil {
		return
	}

	row := database.DB.QueryRow(
		`SELECT COALESCE(SUM(calories), 0), COALESCE(SUM(protein), 0), COALESCE(SUM(carbs), 0), COALESCE(SUM(fat), 0) FROM meal_items WHERE meal_id = ?`,
		mealID,
	)
	row.Scan(&m.TotalCalories, &m.TotalProtein, &m.TotalCarbs, &m.TotalFat)

	database.DB.Exec(
		`UPDATE meals SET total_calories=?, total_protein=?, total_carbs=?, total_fat=? WHERE id=?`,
		m.TotalCalories, m.TotalProtein, m.TotalCarbs, m.TotalFat, mealID,
	)

	checkGoalAchievement(m.MealDate)
}

func GetDailySummary(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))

	summary := models.DailySummary{Date: date}

	rows, _ := database.DB.Query(
		`SELECT id, meal_type, total_calories, total_protein, total_carbs, total_fat FROM meals WHERE meal_date = ?`,
		date,
	)
	for rows.Next() {
		var m models.Meal
		rows.Scan(&m.ID, &m.MealType, &m.TotalCalories, &m.TotalProtein, &m.TotalCarbs, &m.TotalFat)
		summary.TotalCalories += m.TotalCalories
		summary.TotalProtein += m.TotalProtein
		summary.TotalCarbs += m.TotalCarbs
		summary.TotalFat += m.TotalFat

		switch m.MealType {
		case "早餐":
			summary.Breakfast = &m
		case "午餐":
			summary.Lunch = &m
		case "晚餐":
			summary.Dinner = &m
		case "加餐":
			summary.Snack = &m
		}
	}
	rows.Close()

	var goal models.DailyGoal
	err := database.DB.QueryRow(
		`SELECT id, target_calories, target_protein, target_carbs, target_fat, is_achieved FROM daily_goals WHERE target_date = ?`,
		date,
	).Scan(&goal.ID, &goal.TargetCalories, &goal.TargetProtein, &goal.TargetCarbs, &goal.TargetFat, &goal.IsAchieved)
	if err == nil {
		goal.IntakeCalories = summary.TotalCalories
		goal.IntakeProtein = summary.TotalProtein
		goal.IntakeCarbs = summary.TotalCarbs
		goal.IntakeFat = summary.TotalFat
		summary.Goal = &goal
	}

	return success(c, summary)
}

func GetDailyGoal(c *fiber.Ctx) error {
	date := c.Query("date", time.Now().Format("2006-01-02"))

	var goal models.DailyGoal
	err := database.DB.QueryRow(
		`SELECT id, target_date, target_calories, target_protein, target_carbs, target_fat, is_achieved FROM daily_goals WHERE target_date = ?`,
		date,
	).Scan(&goal.ID, &goal.TargetDate, &goal.TargetCalories, &goal.TargetProtein, &goal.TargetCarbs, &goal.TargetFat, &goal.IsAchieved)
	if err == sql.ErrNoRows {
		goal.TargetDate = date
		goal.TargetCalories = 2000
		goal.TargetProtein = 75
		goal.TargetCarbs = 250
		goal.TargetFat = 65
	} else if err != nil {
		return fail(c, err.Error())
	}

	return success(c, goal)
}

func SetDailyGoal(c *fiber.Ctx) error {
	var goal models.DailyGoal
	if err := c.BodyParser(&goal); err != nil {
		return fail(c, err.Error())
	}

	if goal.TargetDate == "" {
		goal.TargetDate = time.Now().Format("2006-01-02")
	}

	_, err := database.DB.Exec(
		`INSERT INTO daily_goals (user_id, target_date, target_calories, target_protein, target_carbs, target_fat) 
VALUES (?, ?, ?, ?, ?, ?) 
ON CONFLICT(user_id, target_date) DO UPDATE SET 
target_calories=excluded.target_calories, 
target_protein=excluded.target_protein, 
target_carbs=excluded.target_carbs, 
target_fat=excluded.target_fat`,
		1, goal.TargetDate, goal.TargetCalories, goal.TargetProtein, goal.TargetCarbs, goal.TargetFat,
	)
	if err != nil {
		return fail(c, err.Error())
	}

	checkGoalAchievement(goal.TargetDate)
	return success(c, nil)
}

func checkGoalAchievement(date string) {
	var totalCal float64
	row := database.DB.QueryRow(
		`SELECT COALESCE(SUM(total_calories), 0) FROM meals WHERE meal_date = ?`, date,
	)
	row.Scan(&totalCal)

	var targetCal float64
	database.DB.QueryRow(
		`SELECT target_calories FROM daily_goals WHERE target_date = ?`, date,
	).Scan(&targetCal)

	if targetCal > 0 {
		var achieved int
		if totalCal >= targetCal*0.9 && totalCal <= targetCal*1.1 {
			achieved = 1
		}
		database.DB.Exec(
			`UPDATE daily_goals SET is_achieved = ? WHERE target_date = ?`,
			achieved, date,
		)
	}
}

func GetWeightRecords(c *fiber.Ctx) error {
	startDate := c.Query("start", "")
	endDate := c.Query("end", "")

	query := `SELECT id, record_date, weight, note, created_at FROM weight_records WHERE 1=1`
	var args []interface{}

	if startDate != "" {
		query += " AND record_date >= ?"
		args = append(args, startDate)
	}
	if endDate != "" {
		query += " AND record_date <= ?"
		args = append(args, endDate)
	}
	query += " ORDER BY record_date DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return fail(c, err.Error())
	}
	defer rows.Close()

	records := []models.WeightRecord{}
	for rows.Next() {
		var r models.WeightRecord
		rows.Scan(&r.ID, &r.RecordDate, &r.Weight, &r.Note, &r.CreatedAt)
		records = append(records, r)
	}
	return success(c, records)
}

func AddWeightRecord(c *fiber.Ctx) error {
	var r models.WeightRecord
	if err := c.BodyParser(&r); err != nil {
		return fail(c, err.Error())
	}

	if r.RecordDate == "" {
		r.RecordDate = time.Now().Format("2006-01-02")
	}

	_, err := database.DB.Exec(
		`INSERT INTO weight_records (user_id, record_date, weight, note) VALUES (?, ?, ?, ?) 
ON CONFLICT(user_id, record_date) DO UPDATE SET weight=excluded.weight, note=excluded.note`,
		1, r.RecordDate, r.Weight, r.Note,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, nil)
}

func DeleteWeightRecord(c *fiber.Ctx) error {
	id, _ := strconv.Atoi(c.Params("id"))
	_, err := database.DB.Exec(`DELETE FROM weight_records WHERE id = ?`, id)
	if err != nil {
		return fail(c, err.Error())
	}
	return success(c, nil)
}

func GetStatistics(c *fiber.Ctx) error {
	startDate := c.Query("start", time.Now().AddDate(0, 0, -7).Format("2006-01-02"))
	endDate := c.Query("end", time.Now().Format("2006-01-02"))

	rows, err := database.DB.Query(
		`SELECT meal_date, COALESCE(SUM(total_calories), 0) as calories, 
COALESCE(SUM(total_protein), 0) as protein, 
COALESCE(SUM(total_carbs), 0) as carbs, 
COALESCE(SUM(total_fat), 0) as fat 
FROM meals WHERE meal_date >= ? AND meal_date <= ? GROUP BY meal_date ORDER BY meal_date`,
		startDate, endDate,
	)
	if err != nil {
		return fail(c, err.Error())
	}
	defer rows.Close()

	type DailyStats struct {
		Date     string  `json:"date"`
		Calories float64 `json:"calories"`
		Protein  float64 `json:"protein"`
		Carbs    float64 `json:"carbs"`
		Fat      float64 `json:"fat"`
	}

	stats := []DailyStats{}
	for rows.Next() {
		var s DailyStats
		rows.Scan(&s.Date, &s.Calories, &s.Protein, &s.Carbs, &s.Fat)
		stats = append(stats, s)
	}

	weightRows, _ := database.DB.Query(
		`SELECT record_date, weight FROM weight_records WHERE record_date >= ? AND record_date <= ? ORDER BY record_date`,
		startDate, endDate,
	)
	defer weightRows.Close()

	type WeightPoint struct {
		Date   string  `json:"date"`
		Weight float64 `json:"weight"`
	}
	weights := []WeightPoint{}
	for weightRows.Next() {
		var w WeightPoint
		weightRows.Scan(&w.Date, &w.Weight)
		weights = append(weights, w)
	}

	return success(c, fiber.Map{
		"daily_stats": stats,
		"weights":     weights,
	})
}

func SearchFoods(c *fiber.Ctx) error {
	query := c.Query("q", "")
	category := c.Query("category", "")

	if strings.TrimSpace(query) == "" {
		return success(c, []models.Food{})
	}

	sql := `SELECT id, name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit FROM foods WHERE name LIKE ?`
	var args []interface{}
	args = append(args, "%"+query+"%")

	if category != "" {
		sql += " AND category = ?"
		args = append(args, category)
	}
	sql += " ORDER BY CASE WHEN name LIKE ? THEN 0 WHEN name LIKE ? THEN 1 ELSE 2 END, name LIMIT 20"
	args = append(args, query+"%", "%"+query+"%")

	rows, err := database.DB.Query(sql, args...)
	if err != nil {
		log.Printf("Search error: %v", err)
		return fail(c, err.Error())
	}
	defer rows.Close()

	foods := []models.Food{}
	for rows.Next() {
		var f models.Food
		rows.Scan(&f.ID, &f.Name, &f.Category, &f.Calories, &f.Protein, &f.Carbs, &f.Fat, &f.Fiber, &f.ServingSize, &f.ServingUnit)
		foods = append(foods, f)
	}
	return success(c, foods)
}

func ExportAllData(c *fiber.Ctx) error {
	foods, _ := getAllFoods()
	meals, _ := getAllMeals()
	mealItems, _ := getAllMealItems()
	goals, _ := getAllGoals()
	weights, _ := getAllWeights()

	return success(c, fiber.Map{
		"export_date": time.Now().Format(time.RFC3339),
		"version":     "1.0.0",
		"data": fiber.Map{
			"foods":       foods,
			"meals":       meals,
			"meal_items":  mealItems,
			"daily_goals": goals,
			"weights":     weights,
		},
	})
}

func getAllFoods() ([]models.Food, error) {
	rows, err := database.DB.Query(`SELECT id, name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit, is_custom, created_at, updated_at FROM foods ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var foods []models.Food
	for rows.Next() {
		var f models.Food
		rows.Scan(&f.ID, &f.Name, &f.Category, &f.Calories, &f.Protein, &f.Carbs, &f.Fat, &f.Fiber, &f.ServingSize, &f.ServingUnit, &f.IsCustom, &f.CreatedAt, &f.UpdatedAt)
		foods = append(foods, f)
	}
	return foods, nil
}

func getAllMeals() ([]models.Meal, error) {
	rows, err := database.DB.Query(`SELECT id, user_id, meal_type, meal_date, total_calories, total_protein, total_carbs, total_fat, notes, created_at, updated_at FROM meals ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var meals []models.Meal
	for rows.Next() {
		var m models.Meal
		rows.Scan(&m.ID, &m.UserID, &m.MealType, &m.MealDate, &m.TotalCalories, &m.TotalProtein, &m.TotalCarbs, &m.TotalFat, &m.Notes, &m.CreatedAt, &m.UpdatedAt)
		meals = append(meals, m)
	}
	return meals, nil
}

func getAllMealItems() ([]models.MealItem, error) {
	rows, err := database.DB.Query(`SELECT id, meal_id, food_id, quantity, calories, protein, carbs, fat FROM meal_items ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.MealItem
	for rows.Next() {
		var item models.MealItem
		rows.Scan(&item.ID, &item.MealID, &item.FoodID, &item.Quantity, &item.Calories, &item.Protein, &item.Carbs, &item.Fat)
		items = append(items, item)
	}
	return items, nil
}

func getAllGoals() ([]models.DailyGoal, error) {
	rows, err := database.DB.Query(`SELECT id, user_id, target_date, target_calories, target_protein, target_carbs, target_fat, is_achieved, created_at FROM daily_goals ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var goals []models.DailyGoal
	for rows.Next() {
		var g models.DailyGoal
		rows.Scan(&g.ID, &g.UserID, &g.TargetDate, &g.TargetCalories, &g.TargetProtein, &g.TargetCarbs, &g.TargetFat, &g.IsAchieved, &g.CreatedAt)
		goals = append(goals, g)
	}
	return goals, nil
}

func getAllWeights() ([]models.WeightRecord, error) {
	rows, err := database.DB.Query(`SELECT id, user_id, record_date, weight, note, created_at FROM weight_records ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var weights []models.WeightRecord
	for rows.Next() {
		var w models.WeightRecord
		rows.Scan(&w.ID, &w.UserID, &w.RecordDate, &w.Weight, &w.Note, &w.CreatedAt)
		weights = append(weights, w)
	}
	return weights, nil
}
