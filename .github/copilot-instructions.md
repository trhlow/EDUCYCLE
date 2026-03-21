# Copilot / AI — Quy tắc làm việc (EduCycle Monorepo)

## Quy trình Git (bắt buộc)

Khi làm thêm bất kỳ tính năng nào, **phải dừng lại, commit feature đã lên git** trước rồi mới tiếp tục làm phần tiếp theo. Dùng **feature branch workflow** (không gom nhiều feature không liên quan trong một commit lớn).

## Đường dẫn quan trọng trong monorepo

| Thành phần | Đường dẫn |
|------------|-----------|
| Backend (.NET 10) | `source/backend/EduCycle.Api/` |
| Backend (Java / Spring Boot, nếu có trong repo) | `source/backend/educycle-java/` — file build: `pom.xml` |
| Project file .NET | `source/backend/EduCycle.Api/*.csproj` (tên file cụ thể theo solution) |
| Frontend | `source/frontend/` — `package.json`, `vite.config.*` |
| CI/CD | `.github/workflows/ci.yml` |
| Quy tắc AI (file này) | `.github/copilot-instructions.md` |

## Branch naming

- `feature/<ten-tinh-nang>` — tính năng mới  
- `fix/<ten-loi>` — sửa lỗi  
- `docs/<noi-dung>` — chỉ tài liệu  

Luồng gợi ý: `feature/*` → `dev` → `main` (theo quy ước team).

## Gợi ý khi chỉnh code

- Backend: ưu tiên chạy test / build local (`dotnet build` hoặc `mvn verify`) trước khi push.  
- Frontend: `npm run lint` / `npm run build` khi đụng cấu hình hoặc dependency.  
- Không commit secret, connection string production, hoặc file `.env` thật — dùng `.env.example` và biến môi trường CI.
