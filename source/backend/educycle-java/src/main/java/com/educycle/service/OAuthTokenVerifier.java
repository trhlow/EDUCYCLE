package com.educycle.service;

import com.educycle.config.OAuthProperties;
import com.educycle.exception.BadRequestException;
import com.educycle.util.MessageConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class OAuthTokenVerifier {

    private final OAuthProperties oAuthProperties;
    private final Map<String, JwtDecoder> decoderCache = new ConcurrentHashMap<>();

    public OAuthTokenVerifier(OAuthProperties oAuthProperties) {
        this.oAuthProperties = oAuthProperties;
    }

    /**
     * Verifies the OAuth token and returns the user's email.
     * Supports both JWT ID tokens and opaque access tokens (Google implicit flow).
     */
    public String verifyAndExtractEmail(String provider, String token) {
        // Google implicit flow sends an opaque access_token, not a JWT
        boolean looksLikeJwt = token != null
                && token.chars().filter(c -> c == '.').count() == 2;

        if (!looksLikeJwt && "google".equals(provider)) {
            return verifyGoogleAccessToken(token);
        }

        Jwt jwt = decode(provider, token);

        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException(MessageConstants.OAUTH_EMAIL_CLAIM_MISSING);
        }

        log.info("Đã xác minh token đăng nhập mạng xã hội: nhà cung cấp={}, email={}", provider, email);
        return email.trim().toLowerCase();
    }

    // ── Google access_token verification via tokeninfo endpoint ─────────

    @SuppressWarnings("unchecked")
    private String verifyGoogleAccessToken(String accessToken) {
        try {
            RestTemplate rest = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?access_token=" + accessToken;
            Map<String, Object> info = rest.getForObject(url, Map.class);

            if (info == null) {
                throw new BadRequestException(MessageConstants.GOOGLE_ACCESS_TOKEN_VERIFY_FAILED);
            }

            String aud = (String) info.get("aud");
            String expectedClientId = oAuthProperties.getGoogle().getClientId();
            if (aud == null || !aud.equals(expectedClientId)) {
                log.warn("Audience của access token Google không khớp: expected={}, got={}", expectedClientId, aud);
                throw new BadRequestException(MessageConstants.GOOGLE_TOKEN_WRONG_AUDIENCE);
            }

            String email = (String) info.get("email");
            if (email == null || email.isBlank()) {
                throw new BadRequestException(MessageConstants.GOOGLE_ACCESS_TOKEN_EMAIL_MISSING);
            }

            log.info("Đã xác minh access token Google: email={}", email);
            return email.trim().toLowerCase();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Xác minh access token Google thất bại: {}", e.getMessage());
            throw new BadRequestException(MessageConstants.INVALID_GOOGLE_ACCESS_TOKEN);
        }
    }

    // ── JWT decode (Google ID token / Microsoft ID token) ───────────────

    private Jwt decode(String provider, String idToken) {
        JwtDecoder decoder = decoderCache.computeIfAbsent(
                provider.toLowerCase(), this::buildDecoder);
        try {
            return decoder.decode(idToken);
        } catch (Exception e) {
            log.warn("Xác minh token đăng nhập mạng xã hội thất bại cho nhà cung cấp={}: {}", provider, e.getMessage());
            throw new BadRequestException(
                    MessageConstants.INVALID_OAUTH_TOKEN_PREFIX + provider + MessageConstants.INVALID_OAUTH_TOKEN_SUFFIX);
        }
    }

    private JwtDecoder buildDecoder(String provider) {
        return switch (provider) {
            case "google"    -> buildGoogleDecoder();
            case "microsoft" -> buildMicrosoftDecoder();
            default -> throw new BadRequestException(
                    MessageConstants.UNSUPPORTED_OAUTH_PROVIDER_PREFIX + provider + MessageConstants.SUPPORTED_OAUTH_PROVIDERS);
        };
    }

    private JwtDecoder buildGoogleDecoder() {
        String clientId = oAuthProperties.getGoogle().getClientId();
        String jwksUri  = oAuthProperties.getGoogle().getJwksUri();

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(jwksUri)
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();

        decoder.setJwtValidator(buildValidator("https://accounts.google.com", clientId));
        log.info("Đã khởi tạo bộ giải mã JWT Google (client-id: {})", clientId);
        return decoder;
    }

    private JwtDecoder buildMicrosoftDecoder() {
        String clientId = oAuthProperties.getMicrosoft().getClientId();
        String jwksUri  = oAuthProperties.getMicrosoft().getJwksUri();

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri(jwksUri)
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                .build();

        decoder.setJwtValidator(buildMicrosoftValidator(clientId));
        log.info("Đã khởi tạo bộ giải mã JWT Microsoft (client-id: {})", clientId);
        return decoder;
    }

    /**
     * Uses jwt.getAudience() instead of JwtClaimValidator&lt;String&gt;
     * to safely handle aud as both string and array.
     */
    private OAuth2TokenValidator<Jwt> buildValidator(String issuer, String audience) {
        JwtTimestampValidator timeValidator  = new JwtTimestampValidator();
        JwtIssuerValidator   issuerValidator = new JwtIssuerValidator(issuer);
        OAuth2TokenValidator<Jwt> audValidator = audValidator(audience);

        return new DelegatingOAuth2TokenValidator<>(timeValidator, issuerValidator, audValidator);
    }

    private OAuth2TokenValidator<Jwt> buildMicrosoftValidator(String audience) {
        JwtTimestampValidator timeValidator = new JwtTimestampValidator();

        OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
            String iss = jwt.getClaimAsString("iss");
            if (iss != null && iss.contains("login.microsoftonline.com")) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_issuer", "Issuer Microsoft không hợp lệ, nhận được: " + iss, null));
        };

        return new DelegatingOAuth2TokenValidator<>(timeValidator, issuerValidator, audValidator(audience));
    }

    private static OAuth2TokenValidator<Jwt> audValidator(String expectedAudience) {
        return jwt -> {
            List<String> audiences = jwt.getAudience();
            if (audiences != null && audiences.contains(expectedAudience)) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_audience",
                            "Audience không hợp lệ. Mong đợi " + expectedAudience + ", nhận được: " + audiences, null));
        };
    }
}
