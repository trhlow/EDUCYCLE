package com.educycle.admin.application;

import com.educycle.admin.api.dto.request.AdminCreateUserRequest;
import com.educycle.admin.api.dto.request.AdminUpdateUserRequest;
import com.educycle.admin.application.support.AdminUserMapper;
import com.educycle.admin.application.usecase.AdminUsersUseCase;
import com.educycle.shared.exception.BadRequestException;
import com.educycle.shared.exception.ConflictException;
import com.educycle.shared.util.MessageConstants;
import com.educycle.user.domain.Role;
import com.educycle.user.domain.User;
import com.educycle.user.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("AdminUsersUseCase")
class AdminUsersUseCaseTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AdminUserMapper mapper;

    private AdminUsersUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new AdminUsersUseCase(userRepository, passwordEncoder, mapper);
    }

    @Test
    @DisplayName("createUser rejects username after normalization")
    void createUserRejectsShortNormalizedUsername() {
        AdminCreateUserRequest request = new AdminCreateUserRequest(
                " ab ",
                "admin-created@student.edu.vn",
                "Password123",
                Role.USER,
                true);

        assertThatThrownBy(() -> useCase.createUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage(MessageConstants.VALIDATION_FAILED);

        verify(userRepository, never()).existsByEmail(anyString());
        verify(userRepository, never()).existsByUsername(anyString());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateUser rejects username after normalization")
    void updateUserRejectsShortNormalizedUsername() {
        UUID userId = UUID.randomUUID();
        User existing = User.builder()
                .id(userId)
                .username("validuser")
                .email("valid@student.edu.vn")
                .role(Role.USER)
                .passwordHash("hash")
                .build();
        given(userRepository.findById(userId)).willReturn(Optional.of(existing));

        AdminUpdateUserRequest request = new AdminUpdateUserRequest(" ab ", null, null, null, null, null);

        assertThatThrownBy(() -> useCase.updateUser(userId, request, UUID.randomUUID()))
                .isInstanceOf(BadRequestException.class)
                .hasMessage(MessageConstants.VALIDATION_FAILED);

        verify(userRepository, never()).existsByUsernameAndIdNot(anyString(), any());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("createUser maps duplicate username to conflict")
    void createUserDuplicateUsernameIsConflict() {
        AdminCreateUserRequest request = new AdminCreateUserRequest(
                "takenuser",
                "admin-created@student.edu.vn",
                "Password123",
                Role.USER,
                true);
        given(userRepository.existsByEmail("admin-created@student.edu.vn")).willReturn(false);
        given(userRepository.existsByUsername("takenuser")).willReturn(true);

        assertThatThrownBy(() -> useCase.createUser(request))
                .isInstanceOf(ConflictException.class)
                .hasMessage(MessageConstants.ADMIN_USERNAME_TAKEN);

        verify(userRepository, never()).save(any());
    }
}
