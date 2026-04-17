# EduCycle API — Java Spring Boot 4.0.5

> Migrated from **ASP.NET Core 10 + EF Core** → **Spring Boot 4.0.5 + JPA/Hibernate + Flyway**

---

## 📋 Tech Stack

| Layer | C# (Original) | Java (Migration) |
|---|---|---|
| Framework | ASP.NET Core 10 | Spring Boot 4.0.5 |
| ORM | Entity Framework Core | Spring Data JPA + Hibernate |
| DB Migration | EF Core Migrations | Flyway |
| Auth | JWT Bearer | JJWT 0.12.x + Spring Security |
| Validation | FluentValidation | Bean Validation (jakarta.validation) |
| Password | BCrypt.Net-Next | BCryptPasswordEncoder (compatible) |
| Docs | Swashbuckle | SpringDoc OpenAPI 3 |
| Logging | Serilog | Logback + @Slf4j (Lombok) |
| Tests | xUnit + Moq | JUnit 5 + Mockito |
| Boilerplate | (manual) | Lombok |

---

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 18+

### 1. Database (chọn một)

**A — Postgres cài trên máy (port 5432), khớp `application.yml` mặc định**

Kết nối bằng superuser (`postgres`), chạy:

```sql
CREATE USER educycle WITH PASSWORD 'educycle123';
CREATE DATABASE educycledb OWNER educycle;
```

Nếu DB đã tồn tại và thuộc `postgres`:

```sql
CREATE USER educycle WITH PASSWORD 'educycle123';
GRANT ALL PRIVILEGES ON DATABASE educycledb TO educycle;
\c educycledb
GRANT ALL ON SCHEMA public TO educycle;
ALTER SCHEMA public OWNER TO educycle;
```

Đổi mật khẩu user có sẵn: `ALTER USER educycle WITH PASSWORD 'educycle123';`

**B — Docker Compose** (Postgres host **5433**, user/pass như trên): từ thư mục `educycle-java` chạy `docker compose up -d`, rồi start BE với profile **`docker`** (xem mục 4 bên dưới).

**C — Mật khẩu / URL khác** (không sửa file trong repo): PowerShell trước khi `mvn spring-boot:run`:

```powershell
$env:SPRING_DATASOURCE_URL = 'jdbc:postgresql://localhost:5432/educycledb'
$env:SPRING_DATASOURCE_USERNAME = 'postgres'
$env:SPRING_DATASOURCE_PASSWORD = 'mat_khau_cua_ban'
```

### 2. Configure `application.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/educycledb
    username: educycle
    password: educycle123

jwt:
  secret: YOUR_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG
  issuer: EduCycle
  audience: EduCycleUsers
  expiration-hours: 2
```

**Ảnh sản phẩm (Sprint 3)** — mặc định lưu đĩa cục bộ, không nhét base64 vào DB:
- `app.upload-dir` (default `./data/uploads`) hoặc biến môi trường **`APP_UPLOAD_DIR`**
- `POST /api/upload/product-image` (multipart, cần JWT) → `{ "url": "/api/files/<uuid>.ext" }`
- `GET /api/files/**` phục vụ file tĩnh (anonymous). Production nên chuyển sang S3 / MinIO / Cloudinary nếu scale nhiều instance.

### 3. Run
```bash
mvn spring-boot:run
```

Flyway chạy `src/main/resources/db/migration/V1__baseline.sql`. Đây là baseline sạch cho Backend V1; nếu DB local/dev đã từng chạy chuỗi migration cũ (`V1__initial_schema.sql` → `V16__...`) thì cần drop/recreate DB hoặc xóa volume Docker trước khi chạy lại.

Seed mặc định:
- Admin: `admin@educycle.com` / `admin@1`
- Danh mục mặc định: `Giáo Trình`, `Sách Chuyên Ngành`, `Tài Liệu Ôn Thi`, `Dụng Cụ Học Tập`, `Ngoại Ngữ`, `Khác`

**SBOM (CycloneDX):** sau `mvn package` → `target/classes/META-INF/sbom/application.cdx.json`

**Log JSON:** profile **`production`** dùng `logback-spring.xml` + `LogstashEncoder` (một dòng / event).

**CORS:** biến môi trường **`CORS_ALLOWED_ORIGINS`** (danh sách origin cách nhau bởi dấu phẩy) — xem `application.yml` / `.env.example` gốc repo.

### 4. Swagger UI
```
http://localhost:8080/swagger-ui.html
```
Profile **`docker`** (Postgres trong Docker Compose + HTTP **8081** để tránh xung đột với Apache trên 8080):  
`mvn spring-boot:run "-Dspring-boot.run.profiles=docker"` → Swagger tại **http://localhost:8081/swagger-ui.html** (xem `application-docker.yml`).

Click **Authorize** and enter: `Bearer <your-jwt-token>`

### 5. Run tests
```bash
mvn test
```

---

## 📁 Project Structure

```
src/main/java/com/educycle/
├── EduCycleApplication.java
├── shared/
│   ├── config/
│   ├── security/
│   ├── exception/
│   ├── response/
│   └── util/
├── auth/
├── user/
├── listing/
├── transaction/
├── review/
├── admin/
└── notification/                   # Persistence support used by core flows; REST API is outside V1 contract

src/main/resources/
├── application.yml                 # Config (maps appsettings.json)
├── rag/
│   └── educycle-knowledge.md       # Outside V1 runtime scope by default
└── db/migration/
    └── V1__baseline.sql            # Clean Backend V1 baseline

src/test/java/com/educycle/service/
├── AuthServiceTest.java            # Maps C# AuthServiceTests.cs
├── ProductServiceTest.java         # Maps C# ProductServiceTests.cs
├── TransactionServiceTest.java     # New: OTP + status tests
├── ReviewServiceTest.java          # New: CRUD + ownership tests
└── CategoryServiceTest.java        # New: CRUD tests
```

---

## 🔑 API Endpoints

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/verify-phone` | 🔒 User | Set phone number |

### Products
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | Public | List approved products |
| GET | `/api/products/{id}` | Public | Get product detail |
| POST | `/api/products` | 🔒 User | Create product (→ PENDING) |
| PUT | `/api/products/{id}` | 🔒 Owner | Update product |
| DELETE | `/api/products/{id}` | 🔒 Owner | Delete product |
| GET | `/api/products/mine` | 🔒 User | My products |
| GET | `/api/products/pending` | 🔒 Admin | Pending list |
| PATCH | `/api/products/{id}/approve` | 🔒 Admin | Approve product |
| PATCH | `/api/products/{id}/reject` | 🔒 Admin | Reject product |

### Transactions
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/transactions` | 🔒 User | Create transaction |
| GET | `/api/transactions/mine` | 🔒 User | My transactions |
| PATCH | `/api/transactions/{id}/status` | 🔒 User | Update status |
| POST | `/api/transactions/{id}/otp` | 🔒 User | Generate OTP |
| POST | `/api/transactions/{id}/verify-otp` | 🔒 User | Verify OTP → COMPLETED |
| POST | `/api/transactions/{id}/confirm` | 🔒 User | Confirm receipt |
| GET/POST | `/api/transactions/{id}/messages` | 🔒 User | Transaction chat |

---

## ⚠️ Migration Notes

### 1. BCrypt Compatibility
Both C# `BCrypt.Net-Next` and Java `BCryptPasswordEncoder` use the **same BCrypt format** (`$2a$`).
Existing password hashes from the C# app are 100% compatible — no re-hashing needed.

### 2. Enum Naming
C# stored enums as e.g. `"User"`, `"Pending"`. Java stores them as `"USER"`, `"PENDING"` (uppercase).
The Flyway migration and all `CHECK` constraints use uppercase.
**If migrating an existing database:** run this before Flyway:
```sql
UPDATE users SET role = UPPER(role);
UPDATE products SET status = UPPER(status);
UPDATE transactions SET status = UPPER(status);
```

### 3. JWT Claims
JWT payload is identical to C# original:
- `sub` = userId (UUID string)
- `email` = user's email
- `role` = `"USER"` or `"ADMIN"` (uppercase)

### 4. @AuthenticationPrincipal
In controllers, `@AuthenticationPrincipal String userId` replaces:
```csharp
var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
```
The principal is the userId (UUID string) set in `JwtAuthenticationFilter`.

### 5. Async → Sync
All `Task<T>` async operations were converted to synchronous.
Spring MVC uses a thread-per-request model — synchronous code is correct here.
Add `@Async` + `CompletableFuture` only if you need true non-blocking I/O.

### 6. FluentValidation → Bean Validation
- `[Required]` → `@NotNull` / `@NotBlank`
- `[StringLength(max)]` → `@Size(max = ...)`
- `[Range(1, 5)]` → `@Min(1)` + `@Max(5)`
- `[EmailAddress]` → `@Email`
- Controller parameter: add `@Valid` to trigger validation

---

## 🔧 Building for Production

```bash
# Build JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/educycle-api-1.0.0.jar \
  --spring.datasource.url=jdbc:postgresql://prod-host:5432/educycledb \
  --spring.datasource.username=prod_user \
  --spring.datasource.password=prod_pass \
  --jwt.secret=your-production-secret-key-min-32-chars
```

---

## 📦 Dependencies Summary (pom.xml)

```xml
spring-boot-starter-web           <!-- REST API -->
spring-boot-starter-data-jpa      <!-- JPA + Hibernate -->
spring-boot-starter-security      <!-- JWT Auth -->
spring-boot-starter-validation     <!-- Bean Validation -->
spring-boot-starter-actuator       <!-- /actuator/health -->
postgresql                         <!-- JDBC driver -->
spring-boot-starter-flyway      <!-- DB migrations (PostgreSQL via JDBC) -->
lombok                             <!-- Boilerplate reduction -->
jjwt-api + jjwt-impl + jjwt-jackson     <!-- JWT generation/validation -->
springdoc-openapi-starter-webmvc-ui      <!-- Swagger UI -->
spring-boot-starter-test           <!-- JUnit 5 + Mockito -->
```
