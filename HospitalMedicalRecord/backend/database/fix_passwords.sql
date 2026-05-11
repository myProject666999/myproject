-- 修复数据库中的密码哈希值
-- 如果数据库已经初始化，执行此脚本来更新密码

USE hospital_medical_record;

-- 更新 admin 账户密码为 admin123
UPDATE users SET password = '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G' WHERE username = 'admin';

-- 更新 doctor01 账户密码为 admin123
UPDATE users SET password = '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G' WHERE username = 'doctor01';

-- 更新 nurse01 账户密码为 admin123
UPDATE users SET password = '$2a$10$qq3zmhm9wpS1hS2AtvP2Vu0y.UYu4cqrRc969yQE9Zf1HTlIn1l7G' WHERE username = 'nurse01';

SELECT 'Passwords updated successfully!' as result;
