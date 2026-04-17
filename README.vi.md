# EduCycle

EduCycle là nền tảng P2P giúp sinh viên trao đổi sách và tài liệu học tập. Repo này là một monorepo gồm backend Spring Boot, frontend React/Vite, bộ compose để chạy full stack, và chatbot AI tùy chọn chạy qua backend.

## Cấu trúc repo

```text
EDUCYCLE/
├── apps/
│   ├── api/                  # API Spring Boot
│   └── web/                  # Ứng dụng React + Vite
├── infra/
│   ├── docker/               # Docker và compose
│   ├── nginx/                # Cấu hình reverse proxy
│   └── scripts/              # Script verify và release
├── docs/
│   ├── adr/                  # Architecture decision records
│   ├── api/                  # Tài liệu API
│   └── runbooks/             # Runbook vận hành
├── docker-compose.yml       # Compose full stack
├── .env.example
├── README.md
└── README.vi.md
```

## Chạy nhanh bằng Docker

Tại thư mục gốc repo:

```powershell
Copy-Item .env.example .env
docker compose up --build
```

Trước lần chạy đầu tiên, cần điền tối thiểu:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`

Sau đó mở [http://localhost](http://localhost).

## Dev local

### 1. Chạy PostgreSQL cho backend

```powershell
cd apps\api
docker compose up -d
```

Postgres sẽ mở ở `localhost:5433`.

### 2. Chạy backend

```powershell
cd apps\api
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

Profile `docker` chạy API ở `http://localhost:8081`.

### 3. Chạy frontend

```powershell
cd apps/web
npm ci
npm run dev
```

Frontend chạy ở [http://localhost:5173](http://localhost:5173).

Lưu ý:

- `apps/web/vite.config.js` mặc định proxy dev sang `http://localhost:8081`.
- Nếu backend chạy profile thường ở cổng `8080`, tạo `apps/web/.env.local` với `VITE_DEV_PROXY_TARGET=http://localhost:8080`.

## Tính năng chính

- Đăng ký và đăng nhập bằng email `.edu.vn` với OTP
- Đăng bán, duyệt bài, wishlist và hồ sơ người bán công khai
- Giao dịch có chat, OTP xác nhận gặp mặt và đánh giá
- Luồng `book wanted` cho nhu cầu tìm sách
- Trang admin để duyệt bài và xử lý tranh chấp
- Chatbot AI tùy chọn qua backend

## Tài liệu

Bắt đầu tại:

- [Hub tài liệu](docs/README.md)
- [Getting started](docs/getting-started/README.md)
- [Kiến trúc hệ thống](docs/architecture/README.md)
- [Backend README](apps/api/README.md)
- [Frontend README](apps/web/README.md)
- [Scripts README](infra/scripts/README.md)

Hướng dẫn chi tiết:

- [AI chatbot](docs/guides/ai-chatbot.md)
- [CI/CD auto deploy](docs/guides/cicd-auto-deploy.md)
- [Production TLS](docs/guides/production-tls.md)
- [Design reference](docs/design/README.md)

## Đường dẫn hữu ích

- App qua Docker: `http://localhost`
- Frontend dev: `http://localhost:5173`
- Backend dev với profile `docker`: `http://localhost:8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

## Đóng góp

- Dùng `dev` làm nhánh tích hợp chính.
- Chia commit nhỏ, rõ phạm vi.
- Dùng Conventional Commits.
- Stage từng file thay vì `git add .`.

## License

Dự án học tập và cá nhân.
