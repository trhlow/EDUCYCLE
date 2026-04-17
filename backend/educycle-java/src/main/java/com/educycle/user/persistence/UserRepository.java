package com.educycle.user.persistence;

import com.educycle.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Maps C# IUserRepository + UserRepository.
 * Spring Data JPA auto-implements all query methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, UUID id);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByFacebookId(String facebookId);

    Optional<User> findByMicrosoftId(String microsoftId);

    Optional<User> findByRefreshToken(String refreshToken);

    Optional<User> findByPasswordResetToken(String passwordResetToken);
}
