-- otp_code lưu SHA-256 (hex 64 ký tự). VARCHAR(10) gây DataIntegrityViolation khi tạo OTP.
ALTER TABLE transactions
    ALTER COLUMN otp_code TYPE VARCHAR(64);
