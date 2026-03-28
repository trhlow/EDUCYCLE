package com.educycle.service;

import com.educycle.dto.auth.*;
import com.educycle.enums.Role;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.UnauthorizedException;
import com.educycle.model.User;
import com.educycle.repository.UserRepository;
import com.educycle.security.JwtTokenProvider;
import com.educycle.service.impl.AuthServiceImpl;
import com.educycle.util.MessageConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Maps C# AuthServiceTests.cs (xUnit + Moq) → JUnit 5 + Mockito
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private MailService mailService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("should return pending response without JWT when email is new")
        void shouldReturnPending_whenEmailIsNew() {
            RegisterRequest request = new RegisterRequest("testuser", "test@student.edu.vn", "Password123");

            given(userRepository.existsByEmail("test@student.edu.vn")).willReturn(false);
            given(passwordEncoder.encode("Password123")).willReturn("hashed_password");
            given(userRepository.save(any(User.class))).willAnswer(inv -> inv.getArgument(0));

            RegisterPendingResponse result = authService.register(request);

            assertThat(result).isNotNull();
            assertThat(result.email()).isEqualTo("test@student.edu.vn");
            assertThat(result.username()).isEqualTo("testuser");
            assertThat(result.message()).isEqualTo(MessageConstants.REGISTER_OTP_SENT);
            verify(jwtTokenProvider, never()).generateToken(any());
            verify(jwtTokenProvider, never()).generateRefreshToken();
            verify(userRepository, times(2)).save(any(User.class));
            verify(mailService, times(1)).sendPlain(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw BadRequestException when email already exists")
        void shouldThrow_whenEmailAlreadyExists() {
            RegisterRequest request = new RegisterRequest("testuser", "existing@student.edu.vn", "Password123");
            given(userRepository.existsByEmail("existing@student.edu.vn")).willReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email đã tồn tại");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("login()")
    class Login {

        private User existingUser;

        @BeforeEach
        void setUp() {
            existingUser = User.builder()
                    .id(UUID.randomUUID())
                    .username("testuser")
                    .email("test@student.edu.vn")
                    .passwordHash("hashed_password")
                    .role(Role.USER)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .createdAt(Instant.now())
                    .build();
        }

        @Test
        @DisplayName("should return token when credentials are valid and email verified")
        void shouldReturnToken_whenCredentialsAreValid() {
            LoginRequest request = new LoginRequest("test@student.edu.vn", "Password123");

            given(userRepository.findByEmail("test@student.edu.vn"))
                    .willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("Password123", "hashed_password")).willReturn(true);
            given(jwtTokenProvider.generateToken(existingUser)).willReturn("fake-jwt-token");
            given(jwtTokenProvider.generateRefreshToken()).willReturn("fake-refresh-token");

            AuthResponse result = authService.login(request);

            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo("fake-jwt-token");
            assertThat(result.userId()).isEqualTo(existingUser.getId());
            assertThat(result.refreshToken()).isEqualTo("fake-refresh-token");
            verify(userRepository, times(1)).save(existingUser);
        }

        @Test
        @DisplayName("should throw when email not verified (OTP chưa nhập)")
        void shouldThrow_whenEmailNotVerified() {
            existingUser.setEmailVerified(false);
            LoginRequest request = new LoginRequest("test@student.edu.vn", "Password123");

            given(userRepository.findByEmail("test@student.edu.vn"))
                    .willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("Password123", "hashed_password")).willReturn(true);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage(MessageConstants.EMAIL_NOT_VERIFIED_LOGIN);

            verify(jwtTokenProvider, never()).generateToken(any());
        }

        @Test
        @DisplayName("should throw UnauthorizedException when user not found")
        void shouldThrow_whenUserNotFound() {
            LoginRequest request = new LoginRequest("notfound@student.edu.vn", "Password123");
            given(userRepository.findByEmail("notfound@student.edu.vn")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Thông tin đăng nhập không đúng");
        }

        @Test
        @DisplayName("should throw UnauthorizedException when password is wrong")
        void shouldThrow_whenPasswordIsWrong() {
            LoginRequest request = new LoginRequest("test@student.edu.vn", "WrongPassword");

            given(userRepository.findByEmail("test@student.edu.vn"))
                    .willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("WrongPassword", "hashed_password")).willReturn(false);

            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Thông tin đăng nhập không đúng");
        }
    }

    @Nested
    @DisplayName("verifyOtp()")
    class VerifyOtp {

        @Test
        @DisplayName("should issue JWT after valid OTP")
        void shouldReturnAuthResponse_whenOtpValid() {
            String email = "new@student.edu.vn";
            User user = User.builder()
                    .id(UUID.randomUUID())
                    .username("newuser")
                    .email(email)
                    .passwordHash("hash")
                    .role(Role.USER)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .emailVerificationToken("123456")
                    .emailVerificationTokenExpiry(Instant.now().plus(30, ChronoUnit.MINUTES))
                    .createdAt(Instant.now())
                    .build();

            given(userRepository.findByEmail(email)).willReturn(Optional.of(user));
            given(jwtTokenProvider.generateToken(user)).willReturn("jwt-after-otp");
            given(jwtTokenProvider.generateRefreshToken()).willReturn("rt-after-otp");

            AuthResponse res = authService.verifyOtp(new VerifyOtpRequest(email, "123456"));

            assertThat(res.token()).isEqualTo("jwt-after-otp");
            assertThat(res.emailVerified()).isTrue();
            assertThat(res.refreshToken()).isEqualTo("rt-after-otp");
            verify(userRepository, times(1)).save(user);
        }
    }
}
