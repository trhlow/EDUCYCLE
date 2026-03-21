package com.educycle.repository;

import com.educycle.model.User;
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

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByFacebookId(String facebookId);

    Optional<User> findByMicrosoftId(String microsoftId);

    Optional<User> findByRefreshToken(String refreshToken);
}
