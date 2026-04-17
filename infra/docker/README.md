# Docker layer structure

Thư mục này chứa các Docker assets tách theo vai trò:
- `apps/web/` cho React/Vite
- `backend/` cho Spring Boot image assets
- `nginx/` cho reverse proxy

Lưu ý: root `docker-compose.yml` hiện build trực tiếp từ `apps/web/Dockerfile` và `apps/api/Dockerfile`; thư mục này giữ các Docker asset phụ và compose deploy.
