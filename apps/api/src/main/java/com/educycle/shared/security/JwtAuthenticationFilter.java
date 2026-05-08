package com.educycle.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import io.jsonwebtoken.Claims;

/**
 * Replaces the JWT middleware wired in C# Program.cs (.AddJwtBearer).
 * Runs once per request, reads "Authorization: Bearer <token>",
 * validates and sets Spring Security context.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = extractToken(request);

        Optional<Claims> claimsOpt = jwtTokenProvider.parseValidClaims(token);
        if (claimsOpt.isPresent()) {
            Claims claims = claimsOpt.get();
            String userId = claims.getSubject();
            String role = claims.get("role", String.class);

            if (!StringUtils.hasText(userId) || !StringUtils.hasText(role)) {
                SecurityContextHolder.clearContext();
                log.warn("JWT missing subject or role claim");
            } else {
                try {
                    // Spring Security expects "ROLE_" prefix for role-based checks
                    var authority = new SimpleGrantedAuthority("ROLE_" + role);

                    var authentication = new UsernamePasswordAuthenticationToken(
                            userId, null, List.of(authority));
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    SecurityContextHolder.clearContext();
                    log.warn("Failed to set authentication from JWT");
                    log.debug("Failed to set authentication from JWT", e);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
