package com.educycle.shared.config;

import com.educycle.shared.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CorsProperties        corsProperties;

    @Value("${educycle.security.prometheus-endpoint-public:false}")
    private boolean prometheusEndpointPublic;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Stateless JWT — không dùng session cookie → CSRF không áp dụng.
            // Nếu sau này thêm cookie-based auth / refresh, phải bật lại CSRF.
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // RequestIdFilter: bean servlet @Order(HIGHEST_PRECEDENCE) — chạy trước FilterChainProxy, không neo vào JWT
            .authorizeHttpRequests(auth -> {
                auth
                    // ── Public auth
                    .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/verify-otp").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/resend-otp").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()
                    // ── Public read
                    .requestMatchers(HttpMethod.GET, "/api/public/users/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/public/health").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/files/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/categories").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/categories/{id}").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/reviews").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/media/unsplash/curated").permitAll()
                    // ── Tin tìm sách (book wanted) — đọc công khai; /mine cần đăng nhập
                    .requestMatchers(HttpMethod.GET, "/api/book-wanted/mine").authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/book-wanted").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/book-wanted/*").permitAll()
                    // ── Wishlist (authenticated)
                    .requestMatchers(HttpMethod.GET, "/api/wishlist").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/wishlist/**").authenticated()
                    .requestMatchers(HttpMethod.DELETE, "/api/wishlist/**").authenticated()
                    // ── AI Chatbot — require login (prevent abuse)
                    .requestMatchers(HttpMethod.POST, "/api/ai/chat").authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/ai/chat/stream").authenticated()
                    // ── WebSocket
                    .requestMatchers("/ws/**").permitAll()
                    // ── Swagger / Actuator (health/** cho K8s probes)
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/actuator/health", "/actuator/health/**", "/actuator/info").permitAll();
                if (prometheusEndpointPublic) {
                    auth.requestMatchers("/actuator/prometheus").permitAll();
                }
                auth.anyRequest().authenticated();
            })
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(11);
    }

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
