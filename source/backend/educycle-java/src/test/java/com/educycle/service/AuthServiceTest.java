package com.educycle.service;

import com.educycle.dto.auth.*;
import com.educycle.enums.Role;
import com.educycle.exception.BadRequestException;
import com.educycle.exception.UnauthorizedException;
import com.educycle.model.User;
import com.educycle.repository.UserRepository;
import com.educycle.security.JwtTokenProvider;
import com.educycle.service.impl.AuthServiceImpl;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

/**
 * Maps C# AuthServiceTests.cs (xUnit + Moq) → JUnit 5 + Mockito
 *
 * C# → Java mapping:
 *  [Fact]                            → @Test
 *  Assert.NotNull(result)            → assertThat(result).isNotNull()
 *  Assert.Equal("x", result.Email)  → assertThat(result.email()).isEqualTo("x")
 *  Assert.ThrowsAsync<T>()          → assertThatThrownBy(() -> ...).isInstanceOf(T.class)
 *  Mock<T>.Setup().Returns()        → given(mock.method()).willReturn(value)
 *  Mock<T>.Verify(Times.Once)       → verify(mock, times(1)).method()
 *  new Mock<IUserRepository>()      → @Mock UserRepository
 *  private readonly AuthService _sut → @InjectMocks AuthServiceImpl authService
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

    @InjectMocks
    private AuthServiceImpl authService;

    // ===================================================================
    // REGISTER
    // ===================================================================

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("should return AuthResponse with token when email is new")
        void shouldReturnToken_whenEmailIsNew() {
            // Arrange — maps C# RegisterAsync_ShouldReturnToken_WhenEmailIsNew
            RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "Password123");

            given(userRepository.existsByEmail("test@example.com")).willReturn(false);
            given(passwordEncoder.encode("Password123")).willReturn("hashed_password");
            given(jwtTokenProvider.generateToken(any(User.class))).willReturn("fake-jwt-token");

            // Act
            AuthResponse result = authService.register(request);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.email()).isEqualTo("test@example.com");
            assertThat(result.token()).isEqualTo("fake-jwt-token");
            assertThat(result.role()).isEqualTo("USER");
            verify(userRepository, times(1)).save(any(User.class));
        }

        @Test
        @DisplayName("should throw BadRequestException when email already exists")
        void shouldThrow_whenEmailAlreadyExists() {
            // Arrange — maps C# RegisterAsync_ShouldThrow_WhenEmailAlreadyExists
            RegisterRequest request = new RegisterRequest("testuser", "existing@example.com", "Password123");
            given(userRepository.existsByEmail("existing@example.com")).willReturn(true);

            // Act + Assert
            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Email already exists");

            verify(userRepository, never()).save(any());
        }
    }

    // ===================================================================
    // LOGIN
    // ===================================================================

    @Nested
    @DisplayName("login()")
    class Login {

        private User existingUser;

        @BeforeEach
        void setUp() {
            existingUser = User.builder()
                    .id(UUID.randomUUID())
                    .username("testuser")
                    .email("test@example.com")
                    .passwordHash("hashed_password")
                    .role(Role.USER)
                    .emailVerified(false)
                    .phoneVerified(false)
                    .createdAt(Instant.now())
                    .build();
        }

        @Test
        @DisplayName("should return token when credentials are valid")
        void shouldReturnToken_whenCredentialsAreValid() {
            // Arrange — maps C# LoginAsync_ShouldReturnToken_WhenCredentialsAreValid
            LoginRequest request = new LoginRequest("test@example.com", "Password123");

            given(userRepository.findByEmail("test@example.com"))
                    .willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("Password123", "hashed_password")).willReturn(true);
            given(jwtTokenProvider.generateToken(existingUser)).willReturn("fake-jwt-token");

            // Act
            AuthResponse result = authService.login(request);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.token()).isEqualTo("fake-jwt-token");
            assertThat(result.userId()).isEqualTo(existingUser.getId());
        }

        @Test
        @DisplayName("should throw UnauthorizedException when user not found")
        void shouldThrow_whenUserNotFound() {
            // Arrange — maps C# LoginAsync_ShouldThrow_WhenUserNotFound
            LoginRequest request = new LoginRequest("notfound@example.com", "Password123");
            given(userRepository.findByEmail("notfound@example.com")).willReturn(Optional.empty());

            // Act + Assert
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid credentials");
        }

        @Test
        @DisplayName("should throw UnauthorizedException when password is wrong")
        void shouldThrow_whenPasswordIsWrong() {
            // Arrange — maps C# LoginAsync_ShouldThrow_WhenPasswordIsWrong
            LoginRequest request = new LoginRequest("test@example.com", "WrongPassword");

            given(userRepository.findByEmail("test@example.com"))
                    .willReturn(Optional.of(existingUser));
            given(passwordEncoder.matches("WrongPassword", "hashed_password")).willReturn(false);

            // Act + Assert
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(UnauthorizedException.class)
                    .hasMessageContaining("Invalid credentials");
        }
    }
}
