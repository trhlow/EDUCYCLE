# 🌿 GITFLOW — EduCycle Monorepo
> Quy tắc commit, push, và branching cho monorepo `trhlow/EDUCYCLE`.

---

## 1. BRANCH STRATEGY

```
main
 └── dev
      ├── feature/be-<tên>   ← backend features
      ├── feature/fe-<tên>   ← frontend features
      ├── fix/<tên>          ← bug fixes
      └── docs/<tên>         ← documentation only
```

| Branch | Mục đích | Rule |
|--------|----------|------|
| `main` | Production-ready | Chỉ merge từ `dev`, không commit trực tiếp |
| `dev` | Integration | Branch làm việc chính |
| `feature/*` | Tính năng mới | Từ `dev`, merge về `dev` khi xong |
| `fix/*` | Bug fix | Từ `dev`, merge về `dev` |
| `docs/*` | Chỉ cập nhật markdown | Từ `dev`, merge về `dev` |

---

## 2. COMMIT MESSAGE CONVENTION

```
<type>(<scope>): <mô tả ngắn gọn>
```

### Type

| Type | Khi nào dùng |
|------|-------------|
| `feat` | Tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Refactor không đổi behavior |
| `docs` | Chỉ cập nhật markdown/comment |
| `chore` | Config, dependencies, build |
| `test` | Thêm/sửa test |
| `security` | Vá lỗ hổng bảo mật |
| `ci` | CI/CD workflow |

### Scope

| Scope | Áp dụng cho |
|-------|------------|
| `be` | Backend |
| `fe` | Frontend |
| `db` | Database migrations |
| `ws` | WebSocket |
| `auth` | Authentication |
| `notif` | Notification system |
| `docs` | Markdown files ở root |

### Ví dụ

```bash
feat(be/auth): add refresh token endpoint with SecureRandom
fix(fe): normalize status to uppercase before comparison
feat(be/ws): add STOMP ChatController and WebSocketAuthInterceptor
security(be): move JWT secret to env variable
docs: update AI_CONTEXT status table
chore(fe): remove unused dependencies
```

---

## 3. SEMANTIC VERSIONING

| Version | Khi nào |
|---------|---------|
| `x.x.1` PATCH | Bug fix, docs |
| `x.1.0` MINOR | Tính năng mới backward-compatible |
| `1.0.0` MAJOR | Breaking change / Release chính thức |

**Trạng thái hiện tại:** `v0.6.x` — fix bugs sau 5 module, FE improvements

---

## 4. DAILY WORKFLOW

### 4A. Feature branch (cách đúng)

```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev
git checkout -b feature/fe-skeleton-ui

# ... edit files ...

# Stage đúng files — KHÔNG git add .
git add source/frontend/src/components/Skeleton.jsx
git add source/frontend/src/components/Skeleton.css

git commit -m "feat(fe): add Skeleton loading component"
git push origin feature/fe-skeleton-ui

# Merge về dev
git checkout dev
git merge --no-ff feature/fe-skeleton-ui -m "Merge feature/fe-skeleton-ui into dev"
git push origin dev

git branch -d feature/fe-skeleton-ui
git push origin --delete feature/fe-skeleton-ui
```

### 4B. Fix nhỏ trực tiếp vào dev

```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev

git add source/frontend/src/pages/DashboardPage.jsx
git commit -m "fix(fe): normalize status to uppercase in DashboardPage"
git push origin dev
```

### 4C. Release — Merge dev → main + Tag

```powershell
cd D:\EDUCYCLE
git checkout dev && git pull origin dev
# Verify: mvn clean compile -q && npm run build

git checkout main && git pull origin main
git merge --no-ff dev -m "Release v0.6.0 — bug fixes + FE improvements"
git push origin main

git tag -a v0.6.0 -m "v0.6.0: Fix status case, mock bypass, OTP flow, notifications"
git push origin v0.6.0
```

---

## 5. RULES STAGE FILES

```powershell
# ✅ ĐÚNG — stage theo module
git add source/backend/educycle-java/src/...
git add source/frontend/src/contexts/AuthContext.jsx
git add AI_CONTEXT.md PROJECT_AUDIT.md

# ❌ SAI
git add .   # có thể add node_modules, target/, dist/
```

**Files KHÔNG BAO GIỜ commit:**
```
source/backend/educycle-java/target/
source/frontend/dist/
source/frontend/node_modules/
.env
application-local.yml
```

---

## 6. CHECKLIST TRƯỚC KHI PUSH

```powershell
# Backend
cd D:\EDUCYCLE\source\backend\educycle-java
mvn clean compile -q

# Frontend
cd D:\EDUCYCLE\source\frontend
npm run build

# Kiểm tra không có file nhạy cảm
git diff --staged --name-only
# Nếu thấy .env, target/, dist/ → git reset HEAD <file>
```

---

## 7. VERSION ROADMAP

| Version | Nội dung | Status |
|---------|---------|--------|
| `v0.1.0` | Project khởi tạo | ✅ Done |
| `v0.2.0` | Auth + JWT + Flyway schema | ✅ Done |
| `v0.3.0` | Product CRUD + Admin | ✅ Done |
| `v0.4.0` | Transaction flow + OTP | ✅ Done |
| `v0.5.0` | 5 module BE: Refresh Token, CORS, Rate Limit, WebSocket, Notification | ✅ Done |
| `v0.6.0` | Fix critical bugs FE (status, isAdmin, OTP flow) | 🔄 In Progress |
| `v0.7.0` | FE improvements: Skeleton UI, Dashboard user access | 📋 Planned |
| `v1.0.0` | Production release | 📋 Planned |
