CREATE DATABASE IF NOT EXISTS family_shopping_list DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE family_shopping_list;

DROP TABLE IF EXISTS shopping_item;
DROP TABLE IF EXISTS shopping_list;
DROP TABLE IF EXISTS purchase_record;
DROP TABLE IF EXISTS category;

CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO category (name, icon) VALUES
('蔬菜', 'shu'),
('调料', 'tia'),
('日用', 'ri'),
('水果', 'shuig'),
('肉类', 'rou'),
('零食', 'lings');

CREATE TABLE shopping_list (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_template TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE shopping_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    list_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id BIGINT,
    quantity INT DEFAULT 1,
    purchased TINYINT(1) DEFAULT 0,
    price DECIMAL(10,2),
    note VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES shopping_list(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE purchase_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    category_id BIGINT,
    price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO shopping_list (name, is_template) VALUES ('当前购物清单', 0);
