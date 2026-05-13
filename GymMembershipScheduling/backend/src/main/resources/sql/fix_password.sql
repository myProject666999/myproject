USE gym_membership;
UPDATE user SET password = '$2a$10$WVD74MfGtTmqcIqc4.nPTunaPFKYMkPKlNWJCo70GaqEP1Wq/GUbW' WHERE username = 'admin';
SELECT id, username, password FROM user WHERE username = 'admin';
