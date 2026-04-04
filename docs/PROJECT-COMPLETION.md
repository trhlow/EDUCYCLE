# EduCycle — Hoàn thành & phạm vi (tổng hợp)

Tài liệu này bổ sung [`NOTES.md`](NOTES.md): **đã làm trong code** vs **còn nợ khi triển khai production thật** (TLS, GDPR, S3, v.v.).

## Đã có trong repo (snapshot)

| Hạng mục | Ghi chú |
|----------|---------|
| CI | `mvn clean verify` + JaCoCo **check** tối thiểu ~**24%** line (chống tụt coverage) |
| SBOM BE | CycloneDX → `target/classes/META-INF/sbom/application.cdx.json` sau `package` |
| Log JSON | Profile **`production`**: `logback-spring.xml` + LogstashEncoder |
| CORS prod | `CORS_ALLOWED_ORIGINS` (CSV) → `cors.allowed-origins-csv` |
| WebSocket | STOMP **CONNECT** bắt buộc Bearer JWT hợp lệ (trước đây chỉ log cảnh báo) |
| E2E API golden | Playwright `e2e/api/golden-path.spec.js`: đăng ký → tạo sản phẩm → `/products/mine` |
| FE contract | **Zod** validate `AuthResponse` cho login/register/refresh/social + interceptor Axios |
| Vitest | Ngưỡng coverage nâng nhẹ (floor ~30% lines) — vẫn dưới mục tiêu “enterprise 60%” |

## Còn nợ / ngoài phạm vi một phiên làm việc

- **TLS + HSTS** tại edge (Caddy/Traefik/nginx 443) — cấu hình hạ tầng.
- **Object storage** (S3/MinIO) thay volume upload — feature lớn.
- **Java 21** compile toàn repo + CI — quyết định team.
- **RHF + Zod** toàn form — migrate dần.
- **GDPR / xóa tài khoản** — API + policy.
- **Bucket4j HTTP** dùng store chung khi nhiều replica — thiết kế riêng.
- **OTEL** bật thật — cần collector + env (đã ghi chú trong `application-production.yml`).

## Cách tự kiểm tra nhanh

```powershell
cd D:\EDUCYCLE\backend\educycle-java
mvn -q clean verify

cd D:\EDUCYCLE\frontend
npm ci
npm test
npm run test:e2e:api
```

Golden path API chạy cùng target với job CI **`e2e-api`** (Postgres + jar + Playwright).
