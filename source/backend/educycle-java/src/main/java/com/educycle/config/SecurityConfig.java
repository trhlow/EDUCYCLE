package com.educycle.config;

import com.educycle.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Replaces C# Program.cs JWT + Authorization policy setup.
 *
 * Mapping:
 *  [AllowAnonymous]         → permitAll()
 *  [Authorize]              → authenticated()
 *  [Authorize(Roles="Admin")] → hasRole("ADMIN")
 *  builder.Services.AddCors → corsConfigurationSource()
 *  Stateless (JWT)          → SessionCreationPolicy.STATELESS
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize on controllers
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsProperties corsProperties;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — stateless REST API
            .csrf(AbstractHttpConfigurer::disable)

            // CORS — whitelist from application.yml
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Stateless sessions — JWT, no HttpSession
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Authorization rules (matches C# [Authorize] / [AllowAnonymous] attributes)
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/social-login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/verify-otp").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/resend-otp").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/products").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/products/{id}").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/categories").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/categories/{id}").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/reviews").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/reviews/**").permitAll()
                // WebSocket (STOMP) — auth handled by WebSocketAuthInterceptor
                .requestMatchers("/ws/**").permitAll()
                // Swagger / Actuator
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**",
                    "/actuator/health"
                ).permitAll()
                // Everything else needs authentication
                .anyRequest().authenticated()
            )

            // Plug our JWT filter before Spring's default auth filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * BCryptPasswordEncoder — fully compatible with BCrypt.Net-Next used in C#.
     * Same BCrypt format ($2a$), so existing hashed passwords remain valid.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(11); // cost factor 11 matches C# default
    }

    /**
     * CORS — whitelist origins from application.yml (cors.allowed-origins).
     * allowCredentials(true) required for WebSocket (Module 4).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsProperties.getAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
