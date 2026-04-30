package com.educycle.auth.application;

import com.educycle.auth.api.dto.request.*;
import com.educycle.auth.api.dto.response.*;
import com.educycle.user.domain.Role;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ConflictException;
import com.educycle.shared.exception.UnauthorizedException;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import com.educycle.shared.security.JwtTokenProvider;
import com.educycle.shared.security.RefreshTokenHasher;
import com.educycle.auth.application.support.AuthRefreshTokens;
import com.educycle.auth.application.support.AuthResponses;
import com.educycle.auth.application.support.OtpCodeGenerator;
import com.educycle.auth.application.service.impl.AuthServiceImpl;
import com.educycle.auth.application.usecase.AuthAccountUseCase;
import com.educycle.auth.application.usecase.AuthRegistrationUseCase;
import com.educycle.auth.application.usecase.AuthSessionUseCase;
import com.educycle.auth.application.usecase.PasswordRecoveryUseCase;
import com.educycle.shared.config.RegistrationOtpProperties;
import com.educycle.shared.mail.MailService;
import com.educycle.shared.util.MessageConstants;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    private AuthServiceImpl authService;

    @BeforeEach
    void initService() {
        AuthRefreshTokens refreshTokens = new AuthRefreshTokens(jwtTokenProvider);
        AuthResponses authResponses = new AuthResponses(jwtTokenProvider);
        OtpCodeGenerator otpCodeGenerator = new OtpCodeGenerator("");
        RegistrationOtpProperties registrationOtpProperties = new RegistrationOtpProperties();
        AuthRegistrationUseCase registrationUseCase = new AuthRegistrationUseCase(
                userRepository, passwordEncoder, mailService, otpCodeGenerator, refreshTokens, authResponses,
                registrationOtpProperties);
        AuthSessionUseCase sessionUseCase = new AuthSessionUseCase(
                userRepository, passwordEncoder, refreshTokens, authResponses);
        AuthAccountUseCase accountUseCase = new AuthAccountUseCase(userRepository, passwordEncoder, refreshTokens);
        PasswordRecoveryUseCase passwordRecoveryUseCase = new PasswordRecoveryUseCase(
                userRepository, passwordEncoder, mailService, refreshTokens);
        authService = new AuthServiceImpl(
                registrationUseCase, sessionUseCase, accountUseCase, passwordRecoveryUseCase);
    }

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("should return pending response without JWT when email is new")
        void shouldReturnPending_whenEmailIsNew() {
            RegisterRequest request = new RegisterRequest("testuser", "test@student.edu.vn", "Password123");

            given(userRepository.findByEmail("test@student.edu.vn")).willReturn(Optional.empty());
            given(userRepository.existsByUsername("testuser")).willReturn(false);
            given(passwordEncoder.encode("Password123")).willReturn("hashed_password");
            given(userRepository.save(any(User.class))).willAnswer(inv -> inv.getArgument(0));

            RegisterPendingResponse result = authService.register(request);

            assertThat(result).isNotNull();
            assertThat(result.email()).isEqualTo("test@student.edu.vn");
            assertThat(result.username()).isEqualTo("testuser");
            assertThat(result.message()).isEqualTo(MessageConstants.REGISTER_OTP_SENT);
            verify(jwtTokenProvider, never()).generateToken(any());
            verify(jwtTokenProvider, never()).generateRefreshToken();
            verify(userRepository, times(1)).save(any(User.class));
            verify(mailService, times(1)).sendPlain(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw BadRequestException when email already exists and verified")
        void shouldThrow_whenEmailAlreadyExistsAndVerified() {
            RegisterRequest request = new RegisterRequest("testuser", "existing@student.edu.vn", "Password123");
            User verified = User.builder()
                    .id(UUID.randomUUID())
                    .username("old")
                    .email("existing@student.edu.vn")
                    .passwordHash("hash")
                    .role(Role.USER)
                    .emailVerified(true)
                    .phoneVerified(false)
                    .createdAt(Instant.now())
                    .build();
            given(userRepository.findByEmail("existing@student.edu.vn")).willReturn(Optional.of(verified));

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email đã tồn tại");

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should throw when username already taken (new email)")
        void shouldThrow_whenUsernameTaken() {
            RegisterRequest request = new RegisterRequest("taken", "fresh@student.edu.vn", "Password123");
            given(userRepository.findByEmail("fresh@student.edu.vn")).willReturn(Optional.empty());
            given(userRepository.existsByUsername("taken")).willReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessage(MessageConstants.USERNAME_TAKEN);

            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should validate username after normalization")
        void shouldValidateUsernameAfterNormalization() {
            RegisterRequest request = new RegisterRequest(" ab ", "fresh@student.edu.vn", "Password123");
            given(userRepository.findByEmail("fresh@student.edu.vn")).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessage(MessageConstants.VALIDATION_FAILED);

            verify(userRepository, never()).existsByUsername(anyString());
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("should re-register and send OTP when email exists but not verified")
        void shouldReregister_whenEmailUnverified() {
            UUID id = UUID.randomUUID();
            User existing = User.builder()
                    .id(id)
                    .username("oldname")
                    .email("pending@student.edu.vn")
                    .passwordHash("oldhash")
                    .role(Role.USER)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .createdAt(Instant.now())
                    .build();
            RegisterRequest request = new RegisterRequest("newuser", "pending@student.edu.vn", "Password123");
            given(userRepository.findByEmail("pending@student.edu.vn")).willReturn(Optional.of(existing));
            given(userRepository.existsByUsernameAndIdNot("newuser", id)).willReturn(false);
            given(passwordEncoder.encode("Password123")).willReturn("hashed_password");

            RegisterPendingResponse result = authService.register(request);

            assertThat(result.email()).isEqualTo("pending@student.edu.vn");
            assertThat(result.username()).isEqualTo("newuser");
            verify(userRepository, times(1)).save(existing);
            verify(mailService, times(1)).sendPlain(anyString(), anyString(), anyString());
        }

        @Test
        @DisplayName("should throw when username taken during re-register")
        void shouldThrow_whenUsernameTaken_onReregister() {
            UUID id = UUID.randomUUID();
            User existing = User.builder()
                    .id(id)
                    .username("oldname")
                    .email("pending@student.edu.vn")
                    .passwordHash("oldhash")
                    .role(Role.USER)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .createdAt(Instant.now())
                    .build();
            RegisterRequest request = new RegisterRequest("otheruser", "pending@student.edu.vn", "Password123");
            given(userRepository.findByEmail("pending@student.edu.vn")).willReturn(Optional.of(existing));
            given(userRepository.existsByUsernameAndIdNot("otheruser", id)).willReturn(true);

            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(ConflictException.class)
                    .hasMessage(MessageConstants.USERNAME_TAKEN);

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

    @Nested
    @DisplayName("refreshToken()")
    class RefreshToken {

        @Test
        @DisplayName("should reject opaque refresh token that does not match stored hash")
        void shouldThrow_whenRefreshTokenUnknown() {
            String plain = "not-a-stored-refresh-token";
            given(userRepository.findByRefreshToken(RefreshTokenHasher.sha256Hex(plain))).willReturn(Optional.empty());

            assertThatThrownBy(() -> authService.refreshToken(plain))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessage(MessageConstants.INVALID_REFRESH_TOKEN);

            verify(jwtTokenProvider, never()).generateRefreshToken();
        }
    }
}
