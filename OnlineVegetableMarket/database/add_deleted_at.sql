USE vegetable_market;

ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;
ALTER TABLE categories ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at;

ALTER TABLE users ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE categories ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE products ADD INDEX idx_deleted_at (deleted_at);

DESCRIBE users;
