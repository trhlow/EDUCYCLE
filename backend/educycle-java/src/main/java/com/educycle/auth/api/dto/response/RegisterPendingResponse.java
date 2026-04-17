package com.educycle.auth.api.dto.response;

/**
 * Đăng ký thành công — chưa cấp JWT. Sinh viên phải nhập OTP gửi về email .edu.vn rồi gọi {@code POST /api/auth/verify-otp}.
 */
public record RegisterPendingResponse(String message, String email, String username) {}
