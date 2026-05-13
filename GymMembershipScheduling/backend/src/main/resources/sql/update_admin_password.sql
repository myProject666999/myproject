-- 更新管理员密码为 123456 (使用新生成的BCrypt哈希)
UPDATE `user` SET `password` = '$2a$10$WVD74MfGtTmqcIqc4.nPTunaPFKYMkPKlNWJCo70GaqEP1Wq/GUbW' WHERE `username` = 'admin';
