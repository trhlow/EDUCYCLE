# EduCycle — AI / Copilot Instructions

## Stack thực tế (không dùng .NET)
- **Backend**: Java 17 + Spring Boot 3.2.5 + PostgreSQL + Flyway
- **Frontend**: React 19 + Vite 7 + Axios + Context API
- **Backend path**: `source/backend/educycle-java/` (build: `pom.xml`, run: `mvn spring-boot:run`)
- **Frontend path**: `source/frontend/` (run: `npm run dev`)
- **API port**: `http://localhost:8080` (không phải 5171)

## Quy trình Git (bắt buộc)
- Làm xong mỗi feature → commit trước rồi mới làm tiếp
- Dùng **feature branch workflow**: `feature/be-<tên>` hoặc `feature/fe-<tên>` → `dev` → `main`
- **Không bao giờ** `git add .` — stage từng file cụ thể

## Commit message format
```
<type>(<scope>): <mô tả>
```
- `type`: feat | fix | refactor | docs | chore | security | test
- `scope`: be | fe | db | ws | auth | docs

## Rules bắt buộc
- Status enums từ backend luôn **UPPERCASE**: `"PENDING"` `"ADMIN"` `"APPROVED"` — dùng `.toUpperCase()` khi compare
- Flyway: V1, V2, V3 đã có → thêm **V4** nếu cần. Không sửa file cũ
- Refresh token: dùng `SecureRandom` — không dùng `UUID.randomUUID()`
- CSS: dùng `var(--token-name)` — không hardcode màu hex
- Không có mock bypass trong `AuthContext`

## Paths quan trọng
| Thứ | Đường dẫn |
|-----|-----------|
| Backend Java | `source/backend/educycle-java/` |
| Frontend React | `source/frontend/` |
| DB migrations | `source/backend/educycle-java/src/main/resources/db/migration/` |
| API config | `source/backend/educycle-java/src/main/resources/application.yml` |
| CI/CD | `.github/workflows/ci.yml` |
| Cursor rules | `.cursor/rules/` |

## Build / verify trước khi push
```powershell
# Backend
cd source\backend\educycle-java
mvn clean compile -q

# Frontend
cd source\frontend
npm run build
```

## Không commit
- `source/backend/educycle-java/target/`
- `source/frontend/dist/`
- `source/frontend/node_modules/`
- `.env` thật — dùng `.env.example`
