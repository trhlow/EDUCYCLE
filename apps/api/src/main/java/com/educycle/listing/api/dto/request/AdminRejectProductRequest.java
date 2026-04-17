package com.educycle.listing.api.dto.request;

import jakarta.validation.constraints.Size;

public record AdminRejectProductRequest(
        @Size(max = 2000, message = "Lý do từ chối tối đa 2000 ký tự")
        String reason
) {}
