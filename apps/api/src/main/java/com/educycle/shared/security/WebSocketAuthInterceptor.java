package com.educycle.shared.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import io.jsonwebtoken.Claims;

import java.util.List;

/**
 * Extracts JWT from the STOMP CONNECT frame's "Authorization" header,
 * validates it, and sets the Principal so @MessageMapping methods can
 * read principal.getName() as userId.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
                log.warn("WebSocket CONNECT without Bearer token");
                throw new MessageDeliveryException("WebSocket: missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);
            var claimsOpt = jwtTokenProvider.parseValidClaims(token);
            if (claimsOpt.isEmpty()) {
                log.warn("WebSocket CONNECT with invalid JWT");
                throw new MessageDeliveryException("WebSocket: invalid or expired token");
            }

            Claims claims = claimsOpt.get();
            String userId = claims.getSubject();
            String role = claims.get("role", String.class);
            if (!StringUtils.hasText(userId) || !StringUtils.hasText(role)) {
                log.warn("WebSocket CONNECT: JWT missing subject or role claim");
                throw new MessageDeliveryException("WebSocket: invalid token claims");
            }

            var authority = new SimpleGrantedAuthority("ROLE_" + role);
            var auth = new UsernamePasswordAuthenticationToken(userId, null, List.of(authority));
            accessor.setUser(auth);
        }

        return message;
    }
}
