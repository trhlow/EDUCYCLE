# Fullstack Structure (Frontend + Java Backend)

Project hiện tại đã theo hướng fullstack production và được chuẩn hóa thêm các lớp triển khai:

```text
project-root/
├── frontend/                  # React / Vite
├── backend/
│   └── educycle-java/         # Spring Boot
├── database/
│   └── init/                  # SQL bootstrap scripts
├── docker/
│   ├── frontend/
│   ├── backend/
│   └── nginx/
├── k8s/
├── deploy/                    # compose deploy hiện có
├── docs/
└── docker-compose.yml         # compose local hiện có
```

## Backend Java layering

Trong `backend/educycle-java/src/main/java/com/educycle` đã tách theo tầng:
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
