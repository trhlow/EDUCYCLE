# EduCycle - Monorepo

**EduCycle** is a platform for exchanging and trading educational materials among students.

## Repository Structure

```
EDUCYCLE/
├── source/
│   ├── backend/
│   │   └── educycle-java/       # Spring Boot REST API (Java 17)
│   └── frontend/                # React + Vite SPA
├── docs/
│   ├── 00-project_link/
│   ├── 01-system-design/
│   ├── 02-backend/
│   ├── 03-frontend/
│   ├── 04-testing/
│   ├── 05-deployment/
│   └── feature/
├── .github/workflows/ci.yml    # CI/CD pipeline
├── .gitignore
└── README.md
```

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Backend  | Java 17, Spring Boot 3, Maven     |
| Frontend | React 18, Vite, JavaScript (JSX)  |
| Database | MySQL / PostgreSQL                |
| CI/CD    | GitHub Actions                    |

## Quick Start

### Backend

```bash
cd source/backend/educycle-java
mvn clean install
mvn spring-boot:run
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd source/frontend
npm ci
npm run dev
# Dev server at http://localhost:5173
```

## Build

```bash
# Backend
mvn -f source/backend/educycle-java/pom.xml clean verify

# Frontend
cd source/frontend && npm ci && npm run build
```

## Branches

| Branch | Purpose                |
|--------|------------------------|
| `main` | Production-ready code  |
| `dev`  | Development integration|

## License

This project is developed for educational purposes.
