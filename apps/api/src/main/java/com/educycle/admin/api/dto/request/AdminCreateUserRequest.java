package com.educycle.admin.api.dto.request;

import com.educycle.user.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
        @NotBlank(message = "Tên người dùng là bắt buộc")
        @Size(max = 100, message = "Tên người dùng tối đa 100 ký tự trước khi chuẩn hóa")
        String username,

        @NotBlank(message = "Email là bắt buộc")
        @Email(message = "Email không đúng định dạng")
        @Pattern(regexp = "(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$", message = "Chỉ chấp nhận email .edu.vn")
        String email,

        @NotBlank(message = "Mật khẩu là bắt buộc")
        @Size(min = 8, max = 128, message = "Mật khẩu phải có ít nhất 8 ký tự")
        String password,

        @NotNull(message = "Vai trò là bắt buộc")
        Role role,

        /** Nếu true (mặc định): người dùng đăng nhập ngay không cần OTP đăng ký */
        Boolean emailVerified
) {}
