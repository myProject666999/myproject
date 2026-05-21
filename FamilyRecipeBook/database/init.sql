CREATE DATABASE IF NOT EXISTS family_recipe_book DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_recipe_book;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS favorite;
DROP TABLE IF EXISTS recipe_season;
DROP TABLE IF EXISTS season;
DROP TABLE IF EXISTS recipe_step;
DROP TABLE IF EXISTS recipe_ingredient;
DROP TABLE IF EXISTS ingredient;
DROP TABLE IF EXISTS recipe;

CREATE TABLE recipe (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    cover_image VARCHAR(255),
    cooking_time INT,
    difficulty VARCHAR(20),
    servings INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ingredient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    UNIQUE KEY uk_ingredient_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe_ingredient (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(10,2),
    unit VARCHAR(20),
    is_required TINYINT(1) DEFAULT 1,
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON DELETE CASCADE,
    UNIQUE KEY uk_recipe_ingredient (recipe_id, ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    INDEX idx_recipe_step (recipe_id, step_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE season (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    UNIQUE KEY uk_season_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE recipe_season (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    season_id BIGINT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    FOREIGN KEY (season_id) REFERENCES season(id) ON DELETE CASCADE,
    UNIQUE KEY uk_recipe_season (recipe_id, season_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE favorite (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    UNIQUE KEY uk_favorite_recipe (recipe_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
