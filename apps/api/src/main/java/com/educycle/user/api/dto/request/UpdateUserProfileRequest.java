package com.educycle.user.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @NotBlank(message = "Tên người dùng không được để trống")
        @Size(max = 100, message = "Tên người dùng tối đa 100 ký tự trước khi chuẩn hóa")
        String username,

        @Size(max = 2000, message = "Tiểu sử tối đa 2000 ký tự")
        String bio,

        @Size(max = 2000, message = "URL ảnh đại diện tối đa 2000 ký tự")
        String avatar
) {}
