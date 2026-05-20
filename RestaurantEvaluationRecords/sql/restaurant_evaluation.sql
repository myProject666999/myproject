-- Create database
CREATE DATABASE IF NOT EXISTS restaurant_evaluation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE restaurant_evaluation;

-- User table
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `username` VARCHAR(50) NOT NULL COMMENT 'Username',
  `password` VARCHAR(100) NOT NULL COMMENT 'Password',
  `nickname` VARCHAR(50) NOT NULL COMMENT 'Nickname',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT 'Avatar URL',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User table';

-- Friendship table
DROP TABLE IF EXISTS `friendship`;
CREATE TABLE `friendship` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `user_id` BIGINT NOT NULL COMMENT 'User ID',
  `friend_id` BIGINT NOT NULL COMMENT 'Friend ID',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 1-added 2-pending',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_friend` (`user_id`, `friend_id`),
  KEY `idx_friend_id` (`friend_id`),
  CONSTRAINT `fk_friendship_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_friendship_friend` FOREIGN KEY (`friend_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Friendship table';

-- Restaurant table
DROP TABLE IF EXISTS `restaurant`;
CREATE TABLE `restaurant` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `name` VARCHAR(100) NOT NULL COMMENT 'Restaurant name',
  `cuisine_type` VARCHAR(50) DEFAULT NULL COMMENT 'Cuisine type',
  `address` VARCHAR(255) DEFAULT NULL COMMENT 'Address',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT 'Phone number',
  `price_per_person` DECIMAL(10,2) DEFAULT NULL COMMENT 'Price per person',
  `description` TEXT DEFAULT NULL COMMENT 'Description',
  `create_user_id` BIGINT NOT NULL COMMENT 'Creator user ID',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  KEY `idx_create_user` (`create_user_id`),
  KEY `idx_name` (`name`),
  CONSTRAINT `fk_restaurant_user` FOREIGN KEY (`create_user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restaurant table';

-- Review table
DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `restaurant_id` BIGINT NOT NULL COMMENT 'Restaurant ID',
  `user_id` BIGINT NOT NULL COMMENT 'Review user ID',
  `taste_score` INT NOT NULL COMMENT 'Taste score (1-5)',
  `environment_score` INT NOT NULL COMMENT 'Environment score (1-5)',
  `service_score` INT NOT NULL COMMENT 'Service score (1-5)',
  `overall_score` DECIMAL(3,2) NOT NULL COMMENT 'Overall score',
  `repurchase_intention` TINYINT NOT NULL COMMENT 'Repurchase intention: 1-no 2-maybe 3-yes',
  `content` TEXT DEFAULT NULL COMMENT 'Review content',
  `visit_date` DATE DEFAULT NULL COMMENT 'Visit date',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_restaurant_user` (`restaurant_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_create_time` (`create_time`),
  CONSTRAINT `fk_review_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`),
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Review table';

-- Recommended dish table
DROP TABLE IF EXISTS `recommended_dish`;
CREATE TABLE `recommended_dish` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `restaurant_id` BIGINT NOT NULL COMMENT 'Restaurant ID',
  `user_id` BIGINT NOT NULL COMMENT 'Recommending user ID',
  `dish_name` VARCHAR(100) NOT NULL COMMENT 'Dish name',
  `description` VARCHAR(255) DEFAULT NULL COMMENT 'Dish description',
  `recommend_count` INT NOT NULL DEFAULT 1 COMMENT 'Recommendation count',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Create time',
  PRIMARY KEY (`id`),
  KEY `idx_restaurant_id` (`restaurant_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_dish_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`),
  CONSTRAINT `fk_dish_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recommended dish table';

-- Restaurant score stats table (for aggregated score data)
DROP TABLE IF EXISTS `restaurant_score_stats`;
CREATE TABLE `restaurant_score_stats` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key ID',
  `restaurant_id` BIGINT NOT NULL COMMENT 'Restaurant ID',
  `avg_taste_score` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Avg taste score',
  `avg_environment_score` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Avg environment score',
  `avg_service_score` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Avg service score',
  `avg_overall_score` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Avg overall score',
  `review_count` INT NOT NULL DEFAULT 0 COMMENT 'Review count',
  `repurchase_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT 'Repurchase rate (%)',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update time',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_restaurant_id` (`restaurant_id`),
  CONSTRAINT `fk_stats_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restaurant score stats table';

-- Insert test data
INSERT INTO `user` (`username`, `password`, `nickname`) VALUES 
('user1', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'ZhangSan'),
('user2', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'LiSi'),
('user3', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'WangWu');

INSERT INTO `friendship` (`user_id`, `friend_id`, `status`) VALUES 
(1, 2, 1),
(2, 1, 1),
(1, 3, 1),
(3, 1, 1),
(2, 3, 1),
(3, 2, 1);

INSERT INTO `restaurant` (`name`, `cuisine_type`, `address`, `phone`, `price_per_person`, `description`, `create_user_id`) VALUES 
('Chuan Wei Xuan', 'Sichuan Cuisine', 'No.88 Jianguo Road, Chaoyang District, Beijing', '010-12345678', 80.00, 'Authentic Sichuan cuisine, spicy and delicious', 1),
('Jiang Nan Restaurant', 'Jiangsu-Zhejiang Cuisine', 'No.1 Zhongguancun Street, Haidian District, Beijing', '010-87654321', 120.00, 'Exquisite Jiangnan cuisine, light and tasty', 2),
('Old Beijing Hot Pot', 'Hot Pot', 'No.100 Wangfujing Street, Dongcheng District, Beijing', '010-55667788', 100.00, 'Traditional copper pot hot pot, authentic Beijing flavor', 1);

INSERT INTO `review` (`restaurant_id`, `user_id`, `taste_score`, `environment_score`, `service_score`, `overall_score`, `repurchase_intention`, `content`, `visit_date`) VALUES 
(1, 1, 5, 4, 4, 4.33, 3, 'Spicy hot pot is amazing! Service is very warm, will come again', '2024-01-15'),
(1, 2, 4, 3, 4, 3.67, 2, 'Good taste, but environment is a bit noisy', '2024-01-20'),
(1, 3, 5, 4, 5, 4.67, 3, 'Boiled fish is a must! Highly recommended', '2024-02-01'),
(2, 1, 4, 5, 4, 4.33, 2, 'Great environment, suitable for dating, exquisite dishes but small portions', '2024-01-10'),
(2, 2, 5, 5, 5, 5.00, 3, 'Braised pork melts in your mouth, service is thoughtful', '2024-01-25'),
(3, 1, 5, 3, 4, 4.00, 3, 'Fresh lamb, great sesame sauce, but environment is so-so', '2024-02-05'),
(3, 3, 4, 3, 3, 3.33, 2, 'Average taste, average value for money', '2024-02-10');

INSERT INTO `recommended_dish` (`restaurant_id`, `user_id`, `dish_name`, `description`) VALUES 
(1, 1, 'Boiled Fish', 'Spicy and delicious, tender fish'),
(1, 2, 'Kung Pao Chicken', 'Sweet and sour, crispy peanuts'),
(1, 3, 'Spicy Hot Pot', 'Rich ingredients, authentic taste'),
(2, 1, 'Braised Pork', 'Fat but not greasy, melts in mouth'),
(2, 2, 'Sweet and Sour Mandarin Fish', 'Beautiful presentation, crispy outside and tender inside'),
(3, 1, 'Hand-Cut Lamb', 'Freshly cut, excellent texture');

-- Initialize restaurant score stats
INSERT INTO `restaurant_score_stats` (`restaurant_id`, `avg_taste_score`, `avg_environment_score`, `avg_service_score`, `avg_overall_score`, `review_count`, `repurchase_rate`)
SELECT 
    r.id,
    ROUND(AVG(rv.taste_score), 2) as avg_taste_score,
    ROUND(AVG(rv.environment_score), 2) as avg_environment_score,
    ROUND(AVG(rv.service_score), 2) as avg_service_score,
    ROUND(AVG(rv.overall_score), 2) as avg_overall_score,
    COUNT(rv.id) as review_count,
    ROUND(SUM(CASE WHEN rv.repurchase_intention = 3 THEN 1 ELSE 0 END) / COUNT(rv.id) * 100, 2) as repurchase_rate
FROM restaurant r
LEFT JOIN review rv ON r.id = rv.restaurant_id
GROUP BY r.id;
