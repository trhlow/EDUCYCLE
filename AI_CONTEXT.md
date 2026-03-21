# 🤖 AI CONTEXT — ĐỌC FILE NÀY TRƯỚC KHI LÀM BẤT CỨ ĐIỀU GÌ

---

## 1. DỰ ÁN

**EduCycle** — Nền tảng P2P trao đổi sách giáo trình. Java Spring Boot (BE) + React 19 (FE).

---

## 2. CẤU TRÚC FOLDER

```
EDUCYCLE/
├── AI_CONTEXT.md                  ← 📍 Bạn đang ở đây
├── PROJECT_AUDIT.md               ← Bug đã fix + còn mở + template (đọc khi sửa)
├── MASTER_IMPROVEMENT_PROMPT.md   ← Spec 5 module BE (tất cả đã xong)
├── FRONTEND_IMPROVEMENT_PROMPT.md ← Spec 8 vấn đề FE (1–6 đã xong, 7–8 còn mở)
├── GITFLOW.md                     ← Commit convention + branching + scripts
├── HOW_TO_USE_AI.md               ← Prompt templates A–D
│
├── source/
│   ├── backend/educycle-java/
│   │   ├── pom.xml                     ← Java 17, Spring Boot 3.2.5, Bucket4j, WebSocket
│   │   ├── src/main/resources/
│   │   │   ├── application.yml         ← ⚠️ JWT_SECRET hardcoded — cần move ra env
│   │   │   └── db/migration/           ← V1(schema) V2(refresh_token) V3(notifications)
│   │   └── src/main/java/com/educycle/
│   │       ├── model/                  ← User(+refreshToken) Transaction(⚠️ thiếu updatedAt)
│   │       ├── config/                 ← SecurityConfig WebSocketConfig RateLimitFilter CorsProperties
│   │       ├── security/               ← JwtTokenProvider WebSocketAuthInterceptor
│   │       └── service/impl/           ← AuthServiceImpl NotificationServiceImpl (tất cả đầy đủ)
│   │
│   └── frontend/
│       ├── package.json                ← ⚠️ Có 5 deps cài nhưng không dùng
│       └── src/
│           ├── api/
│           │   ├── axios.js            ← Silent refresh ✅
│           │   ├── endpoints.js        ← 8 hàm authApi đầy đủ ✅
│           │   └── websocket.js        ← STOMP client ✅
│           ├── contexts/
│           │   ├── AuthContext.jsx     ← No mock bypass, isAdmin uppercase ✅
│           │   └── NotificationContext.jsx ← STOMP + 30s poll fallback ✅
│           ├── utils/
│           │   ├── safeSession.js      ← localStorage safe read/clear ✅
│           │   └── safeStorage.js      ← JSON array safe read ✅
│           └── components/
│               └── ErrorBoundary.jsx   ← Crash recovery ✅
```

---

## 3. TRẠNG THÁI FEATURES

| Feature | BE | FE | Ghi chú |
|---------|----|----|---------|
| JWT Auth login/register | ✅ | ✅ | — |
| Refresh Token | ✅ | ✅ | Module 1 xong — rotation, V2 migration |
| CORS Whitelist | ✅ | — | Module 2 xong — CorsProperties + yml |
| Rate Limiting | ✅ | — | Module 3 xong — Bucket4j per-IP |
| WebSocket Chat | ✅ | ✅ | Module 4 xong — STOMP/SockJS |
| Notification System | ✅ | ✅ | Module 5 xong — DB + STOMP broadcast |
| isAdmin check uppercase | ✅ | ✅ | Đã fix — `toUpperCase() === 'ADMIN'` |
| STATUS_CONFIG uppercase | ✅ | ✅ | Đã fix — PENDING/ACCEPTED/MEETING/... |
| Mock bypass đã xóa | — | ✅ | Đã fix — throw lỗi thật khi BE down |
| endpoints.js đầy đủ | — | ✅ | Đã fix — 8 hàm authApi |
| AuthContext verifyOtp/resendOtp | — | ✅ | Đã fix — export đủ methods |
| OTP step sau register | ✅ | ✅ | Đã fix — AuthPage có form OTP |
| ErrorBoundary | — | ✅ | Đã thêm |
| safeSession utils | — | ✅ | Đã thêm |
| Transaction updatedAt | ⚠️ | ⚠️ | Chưa làm — entity thiếu, "Invalid Date" |
| JWT secret env var | ⚠️ | — | Chưa làm — hardcoded trong application.yml |
| Dashboard status uppercase | — | ⚠️ | Chưa làm — DashboardPage dùng TitleCase |
| flyway-database-postgresql | ⚠️ | — | Chưa làm — thiếu dep trong pom.xml |
| N+1 reviews query | ⚠️ | — | Nợ kỹ thuật — mapAllWithReviews dùng loop |
| Unused npm deps | — | ⚠️ | Nợ kỹ thuật — 5 deps không dùng |

---

## 4. PATTERNS BẮT BUỘC

### Backend (Java 17 + Spring Boot 3.2.5)
```java
// Status enum → name() = UPPERCASE
TransactionStatus.PENDING.name() // = "PENDING"
ProductStatus.APPROVED.name()    // = "APPROVED"
Role.ADMIN.name()                // = "ADMIN"

// Service pattern
@Service @RequiredArgsConstructor @Transactional
public class XyzServiceImpl implements XyzService { ... }

// Exception pattern
throw new BadRequestException("message");
throw new NotFoundException("Entity not found");
throw new UnauthorizedException("message");

// Flyway: V1, V2, V3 đã có → tiếp theo là V4
// KHÔNG BAO GIỜ sửa file migration đã có
```

### Frontend (React 19 + Vite 7)
```javascript
// ✅ ĐÚNG — luôn normalize trước khi so sánh
transaction.status?.toUpperCase() === 'PENDING'
user?.role?.toUpperCase() === 'ADMIN'

// ❌ SAI
transaction.status === 'Pending'
user?.role === 'Admin'

// ✅ CSS — luôn dùng tokens
var(--primary-500)  // ✅
#2196f3            // ❌

// ✅ Error extract
err.response?.data?.message || err.response?.data || 'fallback'
```

---

## 5. LỖI ĐÃ BIẾT — ĐỪNG LẶP LẠI

- ❌ Check role/status bằng TitleCase — BE trả UPPERCASE
- ❌ Tái tạo mock fallback trong AuthContext
- ❌ Sửa V1/V2/V3 migration — chỉ thêm V4, V5...
- ❌ Dùng UUID.randomUUID() cho token — phải SecureRandom 64 bytes
- ❌ AllowAnyOrigin với WebSocket — cần withOrigins() + allowCredentials(true)
- ❌ Hardcode màu hex — dùng var(--xxx)
- ❌ git add . — stage theo từng file/module

---

## 6. ĐỌC GÌ KHI LÀM GÌ

| Task | File cần đọc |
|------|-------------|
| Bắt đầu session mới | `HOW_TO_USE_AI.md` Prompt A |
| Fix bugs còn mở | `PROJECT_AUDIT.md` — có danh sách + template |
| Implement FE features | `FRONTEND_IMPROVEMENT_PROMPT.md` (xem Issue 7–8) |
| Implement BE module mới | `MASTER_IMPROVEMENT_PROMPT.md` |
| Commit / push code | `GITFLOW.md` — convention + scripts |
