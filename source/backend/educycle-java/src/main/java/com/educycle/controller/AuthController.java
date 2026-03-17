package com.educycle.controller;

import com.educycle.dto.auth.*;
import com.educycle.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Maps C# AuthController.cs
 *
 * Key differences:
 *  - [ApiController]                  → @RestController
 *  - [Route("api/auth")]              → @RequestMapping("/api/auth")
 *  - IActionResult                    → ResponseEntity<T>
 *  - User.FindFirstValue(NameIdentifier) → @AuthenticationPrincipal (principal = userId string from JWT)
 *  - [HttpPost("register")]           → @PostMapping("/register")
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/social-login
    @PostMapping("/social-login")
    public ResponseEntity<AuthResponse> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        return ResponseEntity.ok(authService.socialLogin(request));
    }

    // POST /api/auth/verify-otp
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyOtp(request);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    }

    // POST /api/auth/resend-otp
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.ok(Map.of("message", "OTP resent successfully!"));
    }

    // POST /api/auth/verify-phone  [Authorize]
    // @AuthenticationPrincipal replaces User.FindFirstValue(ClaimTypes.NameIdentifier)
    @PostMapping("/verify-phone")
    public ResponseEntity<Map<String, Boolean>> verifyPhone(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody VerifyPhoneRequest request) {

        boolean result = authService.verifyPhone(UUID.fromString(userId), request);
        return ResponseEntity.ok(Map.of("success", result));
    }
}
