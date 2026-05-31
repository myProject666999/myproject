CREATE DATABASE IF NOT EXISTS electronic_signature DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE electronic_signature;

DROP TABLE IF EXISTS contract_logs;
DROP TABLE IF EXISTS signers;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contracts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_url VARCHAR(500),
    file_hash VARCHAR(64),
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    initiator_id INT NOT NULL,
    current_sign_order INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    signed_at DATETIME,
    archived_at DATETIME,
    FOREIGN KEY (initiator_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE signers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    user_id INT NOT NULL,
    sign_order INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    signature_image LONGTEXT,
    signature_type VARCHAR(20),
    signed_at DATETIME,
    comment VARCHAR(500),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE contract_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contract_id INT NOT NULL,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    action_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    detail VARCHAR(500),
    hash_chain VARCHAR(64),
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_initiator ON contracts(initiator_id);
CREATE INDEX idx_signers_contract ON signers(contract_id);
CREATE INDEX idx_signers_user ON signers(user_id);
CREATE INDEX idx_logs_contract ON contract_logs(contract_id);

INSERT INTO users (name, email, password, role) VALUES
('张三', 'zhangsan@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('李四', 'lisi@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user'),
('王五', 'wangwu@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user');
