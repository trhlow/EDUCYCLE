package com.educycle.dto.admin;

import com.educycle.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3–50 ký tự")
        String username,

        @Email(message = "Email không đúng định dạng")
        @Pattern(regexp = "(?i)^[^@\\s]+@[^@\\s]+\\.edu\\.vn$", message = "Chỉ chấp nhận email .edu.vn")
        String email,

        @Size(min = 8, max = 128, message = "Mật khẩu phải có ít nhất 8 ký tự")
        String password,

        Role role,
        Boolean tradingAllowed,
        Boolean emailVerified
) {}
