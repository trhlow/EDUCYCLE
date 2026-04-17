# Database bootstrap scripts

Đặt các script SQL khởi tạo dữ liệu vào thư mục này.

Gợi ý đặt tên:
- `001_schema.sql`
- `002_seed_data.sql`

Khi dùng Docker Compose local, có thể mount thư mục này vào `/docker-entrypoint-initdb.d` của Postgres.
