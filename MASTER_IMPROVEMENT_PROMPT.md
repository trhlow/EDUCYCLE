# 🏗️ MASTER IMPROVEMENT PROMPT — 5 MODULE BACKEND
> Tất cả 5 module đã được implement xong (2026-03-21).
> File này giữ lại làm tài liệu tham chiếu spec và patterns đã dùng.

---

## TRẠNG THÁI

| Module | Status | Ghi chú |
|--------|--------|---------|
| Module 1 — Refresh Token | ✅ Done | SecureRandom 64 bytes, rotation, V2 migration |
| Module 2 — CORS Whitelist | ✅ Done | CorsProperties, application.yml whitelist |
| Module 3 — Rate Limiting | ✅ Done | Bucket4j, auth 5/min, API 60/min, per-IP |
| Module 4 — WebSocket Chat | ✅ Done | STOMP, SockJS, WebSocketAuthInterceptor |
| Module 5 — Notification System | ✅ Done | DB + STOMP broadcast + 5 trigger points |

---

## STACK THỰC TẾ

```
Backend : Java 17 + Spring Boot 3.2.5 + PostgreSQL + Flyway
          JJWT 0.12.5 + Lombok + MapStruct 1.5.5 + Bucket4j 8.10.1
Frontend: React 19 + Vite 7 + Axios + Context API + @stomp/stompjs + sockjs-client
Path BE : source/backend/educycle-java/
Path FE : source/frontend/
```

---

## PATTERNS DÙNG TRONG CÁC MODULE

### Backend
```java
// Service
@Service @RequiredArgsConstructor @Transactional
public class XyzServiceImpl implements XyzService {
    private XyzResponse mapToResponse(Entity e) { ... }
}

// Exceptions
throw new BadRequestException("message");
throw new NotFoundException("Entity not found");
throw new UnauthorizedException("message");

// DTO — Java record
public record AuthResponse(UUID userId, String token, ...) {}

// Flyway versioning đã dùng: V1, V2, V3 → tiếp theo là V4
// KHÔNG sửa file migration đã có
```

### Frontend
```javascript
// API call
const res = await xyzApi.action(data);
return res.data;

// Error extract
err.response?.data?.message || err.response?.data || 'fallback'

// localStorage keys: 'token', 'user', 'refreshToken'
```

---

## RULES BẮT BUỘC (không vi phạm)

1. SecureRandom cho mọi token generation (KHÔNG dùng UUID.randomUUID())
2. Chỉ buyer/seller của transaction mới nhận notification liên quan
3. Refresh token phải xóa khỏi DB khi logout
4. Notification chỉ gửi đúng userId — KHÔNG broadcast public
5. CORS origins đọc từ application.yml — KHÔNG hardcode trong Java
6. Flyway version tăng dần — KHÔNG sửa V1/V2/V3

---

## TÓM TẮT FILES ĐÃ TẠO/SỬA

### Module 1 — Refresh Token
- `model/User.java` — thêm refreshToken, refreshTokenExpiry
- `security/JwtTokenProvider.java` — thêm generateRefreshToken()
- `dto/auth/AuthResponse.java` — thêm refreshToken, refreshTokenExpiry fields
- `dto/auth/RefreshTokenRequest.java` — tạo mới
- `repository/UserRepository.java` — thêm findByRefreshToken()
- `service/AuthService.java` + `AuthServiceImpl.java` — thêm refreshToken(), logout()
- `controller/AuthController.java` — thêm POST /refresh, POST /logout
- `config/SecurityConfig.java` — permitAll cho /refresh, /logout
- `db/migration/V2__add_refresh_token.sql` — tạo mới
- `src/api/axios.js` — silent refresh với queue pattern
- `src/api/endpoints.js` — thêm authApi.refresh(), authApi.logout()
- `src/contexts/AuthContext.jsx` — lưu refreshToken, gọi logout API

### Module 2 — CORS Whitelist
- `src/main/resources/application.yml` — thêm cors.allowed-origins
- `config/CorsProperties.java` — tạo mới @ConfigurationProperties
- `config/SecurityConfig.java` — dùng whitelist từ config, allowCredentials(true)
- `EduCycleApplication.java` — @EnableConfigurationProperties

### Module 3 — Rate Limiting
- `pom.xml` — thêm bucket4j-core 8.10.1
- `config/RateLimitFilter.java` — tạo mới, auth 5/min, API 60/min

### Module 4 — WebSocket Chat
- `pom.xml` — thêm spring-boot-starter-websocket
- `config/WebSocketConfig.java` — tạo mới STOMP config
- `security/WebSocketAuthInterceptor.java` — tạo mới JWT auth cho STOMP
- `dto/message/ChatMessage.java` — tạo mới
- `controller/ChatController.java` — tạo mới @MessageMapping
- `config/SecurityConfig.java` — permitAll /ws/**
- `src/api/websocket.js` — tạo mới createChatClient(), sendChatMessage()
- `src/pages/TransactionDetailPage.jsx` — dùng STOMP thay HTTP polling

### Module 5 — Notification System
- `model/Notification.java` — tạo mới entity
- `dto/notification/NotificationResponse.java` — tạo mới record
- `db/migration/V3__add_notifications.sql` — tạo mới + index
- `repository/NotificationRepository.java` — tạo mới
- `service/NotificationService.java` + `NotificationServiceImpl.java` — tạo mới
- `controller/NotificationsController.java` — tạo mới
- Inject NotificationService vào: ProductServiceImpl, TransactionServiceImpl, MessageServiceImpl
- `src/contexts/NotificationContext.jsx` — tạo mới
- `src/main.jsx` — bọc NotificationProvider
- `src/components/layout/Navbar.jsx` — thêm 🔔 badge
