package com.educycle.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Tên người dùng là bắt buộc")
        @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3–50 ký tự")
        String username,

        @NotBlank(message = "Email là bắt buộc")
        @Email(message = "Email không đúng định dạng")
        @Pattern(regexp = "(?i)^\\s*.+\\.edu\\.vn\\s*$", message = "Chỉ chấp nhận email .edu.vn")
        String email,

        @NotBlank(message = "Mật khẩu là bắt buộc")
        @Size(min = 8, max = 128, message = "Mật khẩu phải có ít nhất 8 ký tự")
        String password
) {}
