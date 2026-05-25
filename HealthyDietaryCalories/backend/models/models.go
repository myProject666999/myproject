package models

type User struct {
	ID        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type Food struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Calories    float64 `json:"calories"`
	Protein     float64 `json:"protein"`
	Carbs       float64 `json:"carbs"`
	Fat         float64 `json:"fat"`
	Fiber       float64 `json:"fiber"`
	ServingSize float64 `json:"serving_size"`
	ServingUnit string  `json:"serving_unit"`
	IsCustom    int     `json:"is_custom"`
	CreatedAt   string  `json:"created_at"`
	UpdatedAt   string  `json:"updated_at"`
}

type Meal struct {
	ID            int     `json:"id"`
	UserID        int     `json:"user_id"`
	MealType      string  `json:"meal_type"`
	MealDate      string  `json:"meal_date"`
	TotalCalories float64 `json:"total_calories"`
	TotalProtein  float64 `json:"total_protein"`
	TotalCarbs    float64 `json:"total_carbs"`
	TotalFat      float64 `json:"total_fat"`
	Notes         string  `json:"notes"`
	CreatedAt     string  `json:"created_at"`
	UpdatedAt     string  `json:"updated_at"`
	Items         []MealItem `json:"items,omitempty"`
}

type MealItem struct {
	ID       int     `json:"id"`
	MealID   int     `json:"meal_id"`
	FoodID   int     `json:"food_id"`
	FoodName string  `json:"food_name,omitempty"`
	Quantity float64 `json:"quantity"`
	Calories float64 `json:"calories"`
	Protein  float64 `json:"protein"`
	Carbs    float64 `json:"carbs"`
	Fat      float64 `json:"fat"`
}

type DailyGoal struct {
	ID              int     `json:"id"`
	UserID          int     `json:"user_id"`
	TargetDate      string  `json:"target_date"`
	TargetCalories  float64 `json:"target_calories"`
	TargetProtein   float64 `json:"target_protein"`
	TargetCarbs     float64 `json:"target_carbs"`
	TargetFat       float64 `json:"target_fat"`
	IsAchieved      int     `json:"is_achieved"`
	CreatedAt       string  `json:"created_at"`
	IntakeCalories  float64 `json:"intake_calories,omitempty"`
	IntakeProtein   float64 `json:"intake_protein,omitempty"`
	IntakeCarbs     float64 `json:"intake_carbs,omitempty"`
	IntakeFat       float64 `json:"intake_fat,omitempty"`
}

type WeightRecord struct {
	ID         int     `json:"id"`
	UserID     int     `json:"user_id"`
	RecordDate string  `json:"record_date"`
	Weight     float64 `json:"weight"`
	Note       string  `json:"note"`
	CreatedAt  string  `json:"created_at"`
}

type DailySummary struct {
	Date           string  `json:"date"`
	TotalCalories  float64 `json:"total_calories"`
	TotalProtein   float64 `json:"total_protein"`
	TotalCarbs     float64 `json:"total_carbs"`
	TotalFat       float64 `json:"total_fat"`
	Breakfast      *Meal   `json:"breakfast,omitempty"`
	Lunch          *Meal   `json:"lunch,omitempty"`
	Dinner         *Meal   `json:"dinner,omitempty"`
	Snack          *Meal   `json:"snack,omitempty"`
	Goal           *DailyGoal `json:"goal,omitempty"`
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}
