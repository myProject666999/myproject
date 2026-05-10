package database

import (
	"database/sql"
	"gamemall/models"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func Init() {
	var err error
	DB, err = sql.Open("sqlite", "gamemall.db")
	if err != nil {
		log.Fatal("failed to open database:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("failed to ping database:", err)
	}

	createTables()
	seedData()
}

func createTables() {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			role TEXT DEFAULT 'user',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS games (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			price REAL NOT NULL DEFAULT 0,
			image TEXT,
			category_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (category_id) REFERENCES categories(id)
		)`,
		`CREATE TABLE IF NOT EXISTS cart_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			game_id INTEGER NOT NULL,
			quantity INTEGER DEFAULT 1,
			FOREIGN KEY (user_id) REFERENCES users(id),
			FOREIGN KEY (game_id) REFERENCES games(id)
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			total_price REAL NOT NULL DEFAULT 0,
			status TEXT DEFAULT 'pending',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
		`CREATE TABLE IF NOT EXISTS order_items (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			order_id INTEGER NOT NULL,
			game_id INTEGER NOT NULL,
			quantity INTEGER NOT NULL,
			price REAL NOT NULL,
			FOREIGN KEY (order_id) REFERENCES orders(id),
			FOREIGN KEY (game_id) REFERENCES games(id)
		)`,
		`CREATE TABLE IF NOT EXISTS news (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			content TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
	}

	for _, stmt := range statements {
		_, err := DB.Exec(stmt)
		if err != nil {
			log.Fatal("failed to create table:", err)
		}
	}
}

func seedData() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil || count > 0 {
		return
	}

	DB.Exec("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", "admin", "admin123", "admin")

	categories := []string{"动作游戏", "角色扮演", "策略游戏", "模拟经营", "射击游戏"}
	for _, name := range categories {
		DB.Exec("INSERT INTO categories (name) VALUES (?)", name)
	}

	games := []struct {
		Name        string
		Description string
		Price       float64
		Image       string
		CategoryID  int
	}{
		{"超级战士", "一款经典的动作冒险游戏，画面精美，玩法丰富。", 199.99, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=futuristic%20warrior%20game%20cover&image_size=square", 1},
		{"勇者传说", "史诗级RPG游戏，带你进入奇幻的魔法世界。", 299.00, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fantasy%20rpg%20game%20cover%20brave%20hero&image_size=square", 2},
		{"帝国时代", "经典策略游戏，建设你的帝国，征服世界。", 159.50, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=strategy%20game%20empire%20building&image_size=square", 3},
		{"模拟人生", "最受欢迎的模拟经营游戏，体验另一种人生。", 128.00, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=simulation%20life%20game%20cover&image_size=square", 4},
		{"反恐精英", "经典射击游戏，团队竞技的巅峰之作。", 0, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=counter%20strike%20fps%20game&image_size=square", 5},
		{"赛博朋克2077", "开放世界RPG巨作，未来都市的冒险之旅。", 399.00, "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cyberpunk%20city%20game%20cover&image_size=square", 2},
	}

	for _, g := range games {
		DB.Exec("INSERT INTO games (name, description, price, image, category_id) VALUES (?, ?, ?, ?, ?)",
			g.Name, g.Description, g.Price, g.Image, g.CategoryID)
	}

	news := []models.News{
		{Title: "《超级战士》DLC即将发布", Content: "备受期待的《超级战士》新DLC将于下月正式发布，包含全新剧情和多人模式。"},
		{Title: "游戏商城周年庆活动", Content: "为庆祝游戏商城成立一周年，全场游戏八折优惠，限时一周！"},
	}
	for _, n := range news {
		DB.Exec("INSERT INTO news (title, content) VALUES (?, ?)", n.Title, n.Content)
	}
}
