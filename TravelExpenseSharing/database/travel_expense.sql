CREATE DATABASE IF NOT EXISTS travel_expense DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE travel_expense;

DROP TABLE IF EXISTS bill_split;
DROP TABLE IF EXISTS bill;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payer_id BIGINT NOT NULL,
    bill_date DATE NOT NULL,
    remark VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payer_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bill_split (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bill_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    split_ratio DECIMAL(5,2) NOT NULL,
    split_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO user (name) VALUES 
('Zhang San'),
('Li Si'),
('Wang Wu'),
('Zhao Liu');

INSERT INTO bill (title, amount, payer_id, bill_date, remark) VALUES 
('Lunch Day 1', 600.00, 1, '2024-05-01', 'Four people'),
('Hotel', 1200.00, 2, '2024-05-01', 'Two nights'),
('Tickets', 400.00, 3, '2024-05-02', 'Scenic spot'),
('Taxi', 200.00, 1, '2024-05-02', 'Round trip');

INSERT INTO bill_split (bill_id, participant_id, split_ratio, split_amount) VALUES 
(1, 1, 25.00, 150.00),
(1, 2, 25.00, 150.00),
(1, 3, 25.00, 150.00),
(1, 4, 25.00, 150.00),
(2, 1, 25.00, 300.00),
(2, 2, 25.00, 300.00),
(2, 3, 25.00, 300.00),
(2, 4, 25.00, 300.00),
(3, 1, 25.00, 100.00),
(3, 2, 25.00, 100.00),
(3, 3, 25.00, 100.00),
(3, 4, 25.00, 100.00),
(4, 1, 25.00, 50.00),
(4, 2, 25.00, 50.00),
(4, 3, 25.00, 50.00),
(4, 4, 25.00, 50.00);
