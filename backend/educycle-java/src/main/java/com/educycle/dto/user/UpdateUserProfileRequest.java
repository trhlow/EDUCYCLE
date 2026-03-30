package com.educycle.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @NotBlank(message = "Tên người dùng không được để trống")
        @Size(min = 2, max = 100, message = "Tên người dùng từ 2 đến 100 ký tự")
        String username,

        @Size(max = 2000, message = "Tiểu sử tối đa 2000 ký tự")
        String bio,

        @Size(max = 2000, message = "URL ảnh đại diện tối đa 2000 ký tự")
        String avatar
) {}
