package database

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
	"healthy-diet-backend/config"
)

var DB *sql.DB

func Init(cfg *config.Config) error {
	var err error
	DB, err = sql.Open("sqlite", cfg.DBPath+"?_foreign_keys=on")
	if err != nil {
		return err
	}

	err = DB.Ping()
	if err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}

func Migrate() error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			email TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS foods (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			category TEXT DEFAULT '其他',
			calories REAL NOT NULL DEFAULT 0,
			protein REAL NOT NULL DEFAULT 0,
			carbs REAL NOT NULL DEFAULT 0,
			fat REAL NOT NULL DEFAULT 0,
			fiber REAL NOT NULL DEFAULT 0,
			serving_size REAL NOT NULL DEFAULT 100,
			serving_unit TEXT DEFAULT '克',
			is_custom INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS meals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER DEFAULT 1,
			meal_type TEXT NOT NULL,
			meal_date DATE NOT NULL,
			total_calories REAL DEFAULT 0,
			total_protein REAL DEFAULT 0,
			total_carbs REAL DEFAULT 0,
			total_fat REAL DEFAULT 0,
			notes TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS meal_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			meal_id INTEGER NOT NULL,
			food_id INTEGER NOT NULL,
			quantity REAL NOT NULL DEFAULT 100,
			calories REAL NOT NULL DEFAULT 0,
			protein REAL DEFAULT 0,
			carbs REAL DEFAULT 0,
			fat REAL DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
			FOREIGN KEY (food_id) REFERENCES foods(id)
		)`,
		`CREATE TABLE IF NOT EXISTS daily_goals (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER DEFAULT 1,
			target_date DATE NOT NULL,
			target_calories REAL NOT NULL DEFAULT 2000,
			target_protein REAL DEFAULT 60,
			target_carbs REAL DEFAULT 250,
			target_fat REAL DEFAULT 65,
			is_achieved INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, target_date)
		)`,
		`CREATE TABLE IF NOT EXISTS weight_records (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER DEFAULT 1,
			record_date DATE NOT NULL,
			weight REAL NOT NULL,
			note TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			UNIQUE(user_id, record_date)
		)`,
		`INSERT OR IGNORE INTO users (id, username, email) VALUES (1, 'default', 'default@example.com')`,
	}

	for _, stmt := range statements {
		_, err := DB.Exec(stmt)
		if err != nil {
			log.Printf("Migration error: %v\nStatement: %s", err, stmt)
			return err
		}
	}

	insertDefaultFoods()
	insertDefaultGoal()

	log.Println("Database migration completed")
	return nil
}

func insertDefaultFoods() {
	foods := []struct {
		name, category, unit string
		cal, pro, carb, fat, fib, size float64
	}{
		{"白米饭", "主食", "克", 116, 2.6, 25.6, 0.3, 0.3, 100},
		{"馒头", "主食", "克", 223, 7.0, 47.0, 1.1, 1.3, 100},
		{"面条", "主食", "克", 109, 4.5, 22.0, 0.5, 0.6, 100},
		{"全麦面包", "主食", "克", 246, 13.0, 41.0, 4.2, 7.0, 100},
		{"红薯", "主食", "克", 99, 1.1, 24.7, 0.2, 2.7, 100},
		{"玉米", "主食", "克", 112, 4.0, 22.8, 1.2, 2.9, 100},
		{"燕麦片", "主食", "克", 377, 15.0, 66.9, 7.0, 10.6, 100},
		{"鸡胸肉", "肉类", "克", 133, 19.4, 2.5, 5.0, 0, 100},
		{"牛肉", "肉类", "克", 125, 19.9, 2.0, 4.2, 0, 100},
		{"猪肉", "肉类", "克", 143, 20.3, 1.5, 6.2, 0, 100},
		{"鸡蛋", "肉类", "个", 144, 13.3, 2.8, 8.8, 0, 50},
		{"三文鱼", "肉类", "克", 139, 17.2, 0, 7.8, 0, 100},
		{"虾", "肉类", "克", 87, 18.6, 2.6, 0.8, 0, 100},
		{"牛奶", "乳制品", "毫升", 54, 3.0, 3.4, 3.2, 0, 250},
		{"酸奶", "乳制品", "克", 72, 2.5, 9.3, 2.7, 0, 100},
		{"奶酪", "乳制品", "克", 328, 25.7, 3.5, 23.5, 0, 30},
		{"苹果", "水果", "克", 54, 0.2, 13.5, 0.2, 1.2, 150},
		{"香蕉", "水果", "克", 93, 1.4, 22.0, 0.2, 1.2, 120},
		{"橙子", "水果", "克", 48, 0.8, 11.1, 0.2, 0.6, 150},
		{"葡萄", "水果", "克", 44, 0.5, 10.3, 0.2, 0.4, 100},
		{"西瓜", "水果", "克", 25, 0.6, 5.8, 0.1, 0.3, 200},
		{"蓝莓", "水果", "克", 57, 0.7, 14.5, 0.3, 2.4, 100},
		{"西兰花", "蔬菜", "克", 34, 2.8, 6.6, 0.4, 1.6, 100},
		{"菠菜", "蔬菜", "克", 24, 2.6, 4.5, 0.3, 1.7, 100},
		{"番茄", "蔬菜", "克", 19, 0.9, 4.0, 0.2, 0.5, 100},
		{"黄瓜", "蔬菜", "克", 16, 0.8, 2.9, 0.2, 0.5, 100},
		{"胡萝卜", "蔬菜", "克", 37, 1.0, 8.8, 0.2, 1.1, 100},
		{"白菜", "蔬菜", "克", 17, 1.5, 3.2, 0.1, 0.8, 100},
		{"豆腐", "豆类", "克", 81, 8.1, 1.9, 4.8, 0.4, 100},
		{"豆浆", "豆类", "毫升", 31, 1.8, 1.1, 1.6, 0.6, 250},
		{"花生", "坚果", "克", 574, 24.8, 16.1, 44.3, 5.5, 30},
		{"核桃", "坚果", "克", 646, 14.9, 9.6, 58.8, 9.5, 20},
		{"杏仁", "坚果", "克", 578, 22.5, 23.0, 50.6, 8.0, 20},
		{"橄榄油", "油脂", "毫升", 899, 0, 0, 99.9, 0, 10},
		{"花生油", "油脂", "毫升", 899, 0, 0, 99.9, 0, 10},
		{"黄油", "油脂", "克", 888, 1.4, 1.4, 98.0, 0, 10},
	}

	for _, f := range foods {
		DB.Exec(
			`INSERT OR IGNORE INTO foods (name, category, calories, protein, carbs, fat, fiber, serving_size, serving_unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			f.name, f.category, f.cal, f.pro, f.carb, f.fat, f.fib, f.size, f.unit,
		)
	}
}

func insertDefaultGoal() {
	DB.Exec(
		`INSERT OR IGNORE INTO daily_goals (user_id, target_date, target_calories, target_protein, target_carbs, target_fat) VALUES (1, DATE('now'), 2000, 75, 250, 65)`,
	)
}

func Close() {
	if DB != nil {
		DB.Close()
	}
}
