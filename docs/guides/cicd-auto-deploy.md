# CI/CD auto deploy (GitHub Actions + GHCR + SSH)

Tai lieu nay mo ta cach van hanh CD tu dong cho EduCycle.

## 1) Kien truc

- CI: `.github/workflows/ci.yml`
- CD: `.github/workflows/cd.yml`
- Runtime compose tren server: `deploy/docker-compose.deploy.yml`
- Registry: GHCR (`ghcr.io/<owner>/educycle-api`, `ghcr.io/<owner>/educycle-web`)

## 2) Luong tu dong

- Push `dev` -> CI pass -> build/push image -> deploy `staging`
- Push `main` -> CI pass -> build/push image -> deploy `production`
- Co the deploy tay bang `workflow_dispatch` cua `EduCycle CD`

## 3) GitHub Environments va secrets

Tao 2 Environment trong repo:

- `staging`
- `production`

Moi environment can cac secret sau:

- `DEPLOY_HOST`: IP/domain server
- `DEPLOY_USER`: user SSH
- `DEPLOY_SSH_KEY`: private key PEM
- `DEPLOY_PATH`: thu muc app tren server, vi du `/opt/educycle`
- `GHCR_USERNAME`: tai khoan GitHub co quyen pull package
- `GHCR_TOKEN`: personal access token co `read:packages`

Khuyen nghi bat buoc:

- Bat **Required reviewers** cho environment `production` de tao approval gate truoc deploy.

## 4) Chuan bi server (mot lan)

```bash
mkdir -p /opt/educycle
cd /opt/educycle
```

Tao file `.env` cho runtime:

```env
POSTGRES_PASSWORD=replace_me
JWT_SECRET=replace_with_long_random_secret
APP_FRONTEND_BASE_URL=https://your-domain

# Bat mail that (OTP, forgot-password)
APP_MAIL_REQUIRE_DELIVERY=true
SPRING_PROFILES_ACTIVE=production,smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-mail@example.com
MAIL_PASSWORD=your_app_password
APP_MAIL_FROM=EduCycle <your-mail@example.com>

# optional
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
UNSPLASH_ACCESS_KEY=
UNSPLASH_CACHE_TTL_SECONDS=21600
```

## 5) Deploy tay (thu cong)

Neu can deploy thu cong tren server:

```bash
cd /opt/educycle
export API_IMAGE=ghcr.io/<owner>/educycle-api:<commit_sha>
export WEB_IMAGE=ghcr.io/<owner>/educycle-web:<commit_sha>
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```

## 6) Smoke check sau deploy

```bash
docker compose -f docker-compose.deploy.yml ps
curl -I http://localhost
curl -s http://localhost/api/public/health
```

Neu smoke check fail, xem log:

```bash
docker compose -f docker-compose.deploy.yml logs api --tail 200
docker compose -f docker-compose.deploy.yml logs web --tail 200
```

## 7) Rollback nhanh

Lay tag image cu (commit SHA cu), roi deploy lai:

```bash
export API_IMAGE=ghcr.io/<owner>/educycle-api:<old_sha>
export WEB_IMAGE=ghcr.io/<owner>/educycle-web:<old_sha>
docker compose -f docker-compose.deploy.yml up -d --remove-orphans
```
