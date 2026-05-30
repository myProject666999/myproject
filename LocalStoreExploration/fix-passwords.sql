USE local_store_exploration;

UPDATE users 
SET password = '$2a$10$d3tJUMuVP4myl5y7qQKF0.yc1vF7nhpi43OQKhdCTS/uLPSGSer1S' 
WHERE username IN ('daren1', 'daren2', 'daren3');

SELECT id, username, password FROM users;
