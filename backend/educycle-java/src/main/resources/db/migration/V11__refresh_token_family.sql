-- Chuỗi refresh token (đổi family khi đăng nhập mới / đổi MK); giữ family khi rotate
ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_family UUID;

UPDATE users SET refresh_token_family = gen_random_uuid() WHERE refresh_token_family IS NULL AND refresh_token IS NOT NULL;
