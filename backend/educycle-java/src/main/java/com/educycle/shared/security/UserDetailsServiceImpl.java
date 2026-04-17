package com.educycle.shared.security;

import com.educycle.user.domain.User;
import com.educycle.user.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Bridges Spring Security's UserDetailsService with our User entity.
 *
 * In C# this was handled implicitly by ASP.NET Identity.
 * Spring Security requires an explicit implementation that loads
 * a UserDetails by username (we use email as the "username").
 *
 * Used by the authentication manager and integration tests.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy người dùng với email: " + email));

        // Spring Security expects "ROLE_" prefix — matches JwtAuthenticationFilter
        String authority = "ROLE_" + user.getRole().name();

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getId().toString()) // principal = userId (UUID)
                .password(user.getPasswordHash())
                .authorities(new SimpleGrantedAuthority(authority))
                .build();
    }
}
