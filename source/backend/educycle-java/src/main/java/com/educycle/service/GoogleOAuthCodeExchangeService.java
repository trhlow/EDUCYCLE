package com.educycle.service;

import com.educycle.config.OAuthProperties;
import com.educycle.exception.BadRequestException;
import com.educycle.util.MessageConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Đổi authorization code (Google Sign-In, PKCE / popup postmessage) lấy id_token, rồi lấy email.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleOAuthCodeExchangeService {

    private final OAuthProperties oAuthProperties;
    private final OAuthTokenVerifier oAuthTokenVerifier;

    @SuppressWarnings("unchecked")
    public String exchangeCodeForEmail(String code, String redirectUri) {
        String secret = oAuthProperties.getGoogle().getClientSecret();
        if (secret == null || secret.isBlank()) {
            throw new BadRequestException(
                    "Đăng nhập Google dạng auth-code cần oauth.google.client-secret (GOOGLE_CLIENT_SECRET). "
                            + "Hoặc dùng implicit flow từ frontend (gửi token).");
        }
        String rid = redirectUri != null && !redirectUri.isBlank() ? redirectUri.trim() : "postmessage";

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("code", code);
        form.add("client_id", oAuthProperties.getGoogle().getClientId());
        form.add("client_secret", secret);
        form.add("redirect_uri", rid);
        form.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            RestTemplate rt = new RestTemplate();
            ResponseEntity<Map> response = rt.postForEntity(
                    "https://oauth2.googleapis.com/token",
                    new HttpEntity<>(form, headers),
                    Map.class);

            Map<?, ?> body = response.getBody();
            if (body == null) {
                throw new BadRequestException(MessageConstants.INVALID_GOOGLE_ACCESS_TOKEN);
            }
            Object idToken = body.get("id_token");
            if (idToken == null || idToken.toString().isBlank()) {
                log.warn("Google token response không có id_token: keys={}", body.keySet());
                throw new BadRequestException(MessageConstants.INVALID_GOOGLE_ACCESS_TOKEN);
            }
            return oAuthTokenVerifier.verifyAndExtractEmail("google", idToken.toString());
        } catch (BadRequestException e) {
            throw e;
        } catch (RestClientException e) {
            log.warn("Đổi code Google thất bại: {}", e.getMessage());
            throw new BadRequestException(MessageConstants.INVALID_GOOGLE_ACCESS_TOKEN);
        }
    }
}
