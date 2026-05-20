CREATE DATABASE IF NOT EXISTS flashcard_review DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE flashcard_review;

DROP TABLE IF EXISTS review_logs;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS decks;

CREATE TABLE decks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cards (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    deck_id BIGINT NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    ease_factor DECIMAL(5,2) DEFAULT 2.50,
    review_interval INT DEFAULT 0,
    repetitions INT DEFAULT 0,
    next_review_date DATETIME,
    last_review_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
    INDEX idx_deck_id (deck_id),
    INDEX idx_next_review_date (next_review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE review_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_id BIGINT NOT NULL,
    quality INT NOT NULL,
    review_date DATETIME NOT NULL,
    previous_review_interval INT,
    new_review_interval INT,
    previous_ease_factor DECIMAL(5,2),
    new_ease_factor DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    INDEX idx_card_id (card_id),
    INDEX idx_review_date (review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO decks (name, description) VALUES
('English Words', 'Common English vocabulary review'),
('Japanese Basics', 'Japanese beginner vocabulary and grammar'),
('Programming Concepts', 'Computer science basic concepts');

INSERT INTO cards (deck_id, front, back, next_review_date) VALUES
(1, 'apple', 'n. a round fruit with red or green skin', NOW()),
(1, 'banana', 'n. a long curved fruit with yellow skin', NOW()),
(1, 'computer', 'n. an electronic device for processing data', NOW()),
(2, 'konnichiwa', 'hello', NOW()),
(2, 'arigatou', 'thank you', NOW()),
(3, 'OOP', 'Object-Oriented Programming', NOW());
