USE vegetable_market;

UPDATE users 
SET password = '$2a$10$d0MAjLCHvf0hMG.NyXuxzOyWkDAqCknZC4gSuHIq8FuiwOXUIxoOm' 
WHERE username IN ('admin', 'merchant', 'customer');

SELECT username, password FROM users;
