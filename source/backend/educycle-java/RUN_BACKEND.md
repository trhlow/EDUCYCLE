# Chạy backend (test nhanh)

- **Profile mặc định** (không có `docker`): API **http://localhost:8080** — Swagger **http://localhost:8080/swagger-ui.html**
- **Profile `docker`**: API **http://localhost:8081** (tránh xung đột khi Apache/XAMPP giữ 8080) — Swagger **http://localhost:8081/swagger-ui.html**

Ghi đè cổng (ưu tiên cao hơn `application-docker.yml`): `$env:SERVER_PORT = "8082"` hoặc `-Dspring-boot.run.jvmArguments=-Dserver.port=8082`.

## 1) Cần PostgreSQL + database `educycledb`

Cấu hình mặc định trong `application.yml`: `localhost:5432`, user **`educycle`**, password **`educycle123`** (khớp với SQL trong `README.md`).

### Postgres cài sẵn trên máy

- Tạo user + DB nếu chưa có (xem `README.md` mục *Create database*).
- Nếu **user/mật khẩu** khác, override bằng biến môi trường (PowerShell), ví dụ:

```powershell
$env:SPRING_DATASOURCE_USERNAME = "user_khac"
$env:SPRING_DATASOURCE_PASSWORD = "mat_khau_that_cua_ban"
cd d:\EDUCYCLE\source\backend\educycle-java
mvn spring-boot:run
```

### Docker Compose (`docker-compose.yml`)

User / password trong container: **`educycle`** / **`educycle123`**, DB **`educycledb`**, cổng host **`5433`**.

1. Bật **Docker Desktop**.
2. Trong thư mục `educycle-java`:

```powershell
docker compose up -d
mvn spring-boot:run "-Dspring-boot.run.profiles=docker"
```

Profile **`docker`** dùng `application-docker.yml` (Postgres `localhost:5433`, user/password như compose; **port HTTP 8081**).

### Cổng 8080 bị chiếm (Apache, v.v.)

- **Cách A — dùng profile `docker`**: đã cấu hình sẵn **8081** trong `application-docker.yml`, không cần `-Dserver.port`.
- **Cách B — giữ Spring trên 8080**: tắt Apache (PowerShell **Run as Administrator**), ví dụ `Get-Service *Apache*` rồi `Stop-Service -Name "..."`, hoặc `taskkill /PID <pid> /F` sau khi xác định PID bằng `netstat -ano | findstr :8080`.

## 2) Lệnh chạy thường (khi DB đã đúng)

```powershell
cd d:\EDUCYCLE\source\backend\educycle-java
mvn spring-boot:run
```

Kiểm tra:

- Mặc định: `curl http://localhost:8080/actuator/health` → `{"status":"UP"}`
- Với profile `docker`: `curl http://localhost:8081/actuator/health`
