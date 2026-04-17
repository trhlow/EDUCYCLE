# Fullstack Structure (Frontend + Java Backend)

Project hiện tại đã theo hướng fullstack production và được chuẩn hóa thêm các lớp triển khai:

```text
project-root/
├── apps/
│   ├── api/                  # Spring Boot
│   └── web/                  # React / Vite
├── infra/
│   ├── docker/               # Dockerfiles, compose deploy, database bootstrap
│   ├── nginx/                # Reverse proxy config
│   ├── scripts/              # Verify and release helpers
│   └── k8s/                  # Kubernetes manifests
├── docs/
└── docker-compose.yml         # compose local hiện có
```

## Backend Java layering

Trong `apps/api/src/main/java/com/educycle` đã tách theo tầng:
- `controller/`
- `service/` và `service/impl/`
- `repository/`
- `model/` (entity)
- `dto/`
- `config/`
- `exception/`
- `security/`

## Gợi ý tiếp theo

- Nếu muốn đúng naming Spring phổ biến hơn: đổi `model/` -> `entity/` theo roadmap.
- Bổ sung pipeline CI build image và deploy k8s theo environment (`dev/staging/prod`).
