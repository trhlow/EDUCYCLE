package com.educycle.admin.api.dto.request;

import com.educycle.user.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AdminUpdateUserRequest(
        @Size(max = 100, message = "Tên người dùng tối đa 100 ký tự trước khi chuẩn hóa")
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
