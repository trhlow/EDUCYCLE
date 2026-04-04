-- V1 seed used a BCrypt hash that did not match the documented password "admin@1"
-- (verified with Spring BCryptPasswordEncoder strength 11).
UPDATE users
SET password_hash = '$2a$11$rKaPf4vIrVgZqa5Y.uhOnOHwFBsf0wWNk0bP48o9ZdUFZO6j1.1tK'
WHERE email = 'admin@educycle.com';
