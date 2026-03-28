📍 Vị trí trong monorepo: `source/backend/educycle-java/`

> **Bản chính (cập nhật):** [source/backend/educycle-java/README.md](../../source/backend/educycle-java/README.md). File này giữ phần so sánh migration / lịch sử.

# EduCycle API — Java Spring Boot 3.x

> Migrated from **ASP.NET Core 10 + EF Core** → **Spring Boot 3.2 + JPA/Hibernate + Flyway**

---

## 📋 Tech Stack

| Layer | C# (Original) | Java (Migration) |
|---|---|---|
| Framework | ASP.NET Core 10 | Spring Boot 3.2.5 |
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

### Clone the repository

```bash
git clone https://github.com/trhlow/EDUCYCLE.git
cd EDUCYCLE/source/backend/educycle-java
```

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL 15+

### 1. Create database
```sql
CREATE DATABASE educycledb;
CREATE USER educycle WITH PASSWORD 'educycle123';
GRANT ALL PRIVILEGES ON DATABASE educycledb TO educycle;
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

### 3. Run
```bash
mvn spring-boot:run
```

Flyway will automatically run `V1__initial_schema.sql` on first startup, creating all tables and seeding:
- Admin user: `admin@educycle.com` / `admin@1`
- 6 default categories

### 4. Swagger UI
```
http://localhost:8080/swagger-ui.html
```
Click **Authorize** and enter: `Bearer <your-jwt-token>`

### 5. Run tests
```bash
mvn test
```

---

## 📁 Project Structure

```
src/main/java/com/educycle/
├── EduCycleApplication.java        # Entry point (maps C# Program.cs)
├── config/
│   ├── AppConfig.java              # ObjectMapper bean
│   ├── JwtProperties.java          # @ConfigurationProperties for jwt.*
│   ├── OpenApiConfig.java          # Swagger + Bearer auth setup
│   └── SecurityConfig.java         # Spring Security (replaces C# JWT middleware)
├── controller/
│   ├── AuthController.java         # POST /api/auth/*
│   ├── ProductsController.java     # /api/products
│   ├── CategoriesController.java   # /api/categories
│   ├── TransactionsController.java # /api/transactions (+ messages sub-routes)
│   ├── ReviewsController.java      # /api/reviews
│   └── AdminController.java        # /api/admin (ADMIN only)
├── dto/                            # Records (immutable DTOs, replace C# records/POCOs)
├── enums/                          # Role, ProductStatus, TransactionStatus
├── exception/
│   ├── AppException.java           # Base exception (maps C# abstract AppException)
│   ├── BadRequestException.java    # 400
│   ├── NotFoundException.java      # 404
│   ├── UnauthorizedException.java  # 401
│   └── GlobalExceptionHandler.java # @RestControllerAdvice (maps C# Middleware)
├── model/                          # @Entity classes (User, Product, Category, etc.)
├── repository/                     # JpaRepository interfaces (replaces EF Core DbContext)
├── security/
│   ├── JwtTokenProvider.java       # Generates & validates JWT (maps C# JwtTokenGenerator)
│   ├── JwtAuthenticationFilter.java # OncePerRequestFilter (maps C# JwtBearer middleware)
│   └── UserDetailsServiceImpl.java # Loads user by email for Spring Security
└── service/
    ├── AuthService.java            # Interface
    ├── impl/AuthServiceImpl.java   # Implementation
    └── impl/...                    # All 6 service implementations

src/main/resources/
├── application.yml                 # Config (maps appsettings.json)
└── db/migration/
    └── V1__initial_schema.sql      # Flyway migration (replaces all EF Core migrations)

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
| POST | `/api/auth/register` | Public | Đăng ký .edu.vn — gửi OTP email, chưa JWT |
| POST | `/api/auth/login` | Public | Đăng nhập (sau khi đã verify OTP), trả JWT |
| POST | `/api/auth/verify-otp` | Public | Xác thực OTP — trả JWT + refresh |
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
flyway-core + flyway-database-postgresql  <!-- DB migrations -->
lombok                             <!-- Boilerplate reduction -->
jjwt-api + jjwt-impl + jjwt-jackson     <!-- JWT generation/validation -->
springdoc-openapi-starter-webmvc-ui      <!-- Swagger UI -->
spring-boot-starter-test           <!-- JUnit 5 + Mockito -->
```
