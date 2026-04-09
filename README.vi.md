# EduCycle

EduCycle là nền tảng P2P giúp sinh viên trao đổi sách và tài liệu học tập. Repo này là một monorepo gồm backend Spring Boot, frontend React/Vite, bộ compose để chạy full stack, và chatbot AI tùy chọn chạy qua backend.

## Cấu trúc repo

```text
EDUCYCLE/
├── backend/educycle-java/   # API Spring Boot
├── frontend/                # Ứng dụng React + Vite
├── docs/                    # Tài liệu chung của dự án
├── deploy/                  # Compose và cấu hình triển khai
├── scripts/                 # Script verify và release
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
cd backend\educycle-java
docker compose up -d
```

Postgres sẽ mở ở `localhost:5433`.

### 2. Chạy backend

```powershell
cd backend\educycle-java
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

Profile `docker` chạy API ở `http://localhost:8081`.

### 3. Chạy frontend

```powershell
cd frontend
npm ci
npm run dev
```

Frontend chạy ở [http://localhost:5173](http://localhost:5173).

Lưu ý:

- `frontend/vite.config.js` mặc định proxy dev sang `http://localhost:8081`.
- Nếu backend chạy profile thường ở cổng `8080`, tạo `frontend/.env.local` với `VITE_DEV_PROXY_TARGET=http://localhost:8080`.

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
- [Backend README](backend/educycle-java/README.md)
- [Frontend README](frontend/README.md)
- [Scripts README](scripts/README.md)

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
