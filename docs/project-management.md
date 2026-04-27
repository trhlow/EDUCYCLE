# EduCycle Work Management Plan

Tai lieu nay chot cach quan ly backend/frontend cho V1 de tranh lech contract va tranh backlog phinh ra thanh refactor chung chung.

## Diem sync backend/frontend

Chi sync giua backend va frontend o 3 hop dong sau. Ngoai 3 diem nay, backend va frontend giu backlog doc lap.

### Sync 1: Auth contract

Muc tieu: FE va BE thong nhat dang nhap, dang ky, refresh token, current user, role/permission, va error model.

Pham vi backend:

- `apps/api/src/main/java/com/educycle/auth/api/AuthController.java`
- `apps/api/src/main/java/com/educycle/auth/api/dto/request/*`
- `apps/api/src/main/java/com/educycle/auth/api/dto/response/*`
- `apps/api/src/main/java/com/educycle/auth/application/**`
- `apps/api/src/main/java/com/educycle/user/api/UsersController.java`
- `apps/api/src/main/java/com/educycle/user/api/dto/response/UserMeResponse.java`
- `apps/api/src/main/java/com/educycle/user/domain/Role.java`
- `apps/api/src/main/java/com/educycle/shared/exception/*`
- `apps/api/src/main/java/com/educycle/shared/response/*`

Pham vi frontend:

- `apps/web/src/features/auth/**`
- `apps/web/src/features/profile/hooks/useMe.ts`
- `apps/web/src/features/profile/api/index.ts`
- `apps/web/src/context/AuthContext.jsx`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/api-client.ts`
- `apps/web/src/lib/api-error.js`
- `apps/web/src/types/api.ts`

Can chot:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `GET /api/users/me`
- error body: `{ success: false, message, errors }`
- role: `USER`, `ADMIN`
- 401 cho token thieu/sai, 403 cho dung token nhung sai quyen

### Sync 2: Listing contract

Muc tieu: FE va BE thong nhat list/detail/create/update/delete, status product, va upload flow.

Pham vi backend:

- `apps/api/src/main/java/com/educycle/listing/api/ProductsController.java`
- `apps/api/src/main/java/com/educycle/listing/api/CategoriesController.java`
- `apps/api/src/main/java/com/educycle/listing/api/FileUploadController.java`
- `apps/api/src/main/java/com/educycle/listing/api/dto/request/*`
- `apps/api/src/main/java/com/educycle/listing/api/dto/response/*`
- `apps/api/src/main/java/com/educycle/listing/application/**`
- `apps/api/src/main/java/com/educycle/listing/domain/Product.java`
- `apps/api/src/main/java/com/educycle/listing/domain/ProductStatus.java`
- `apps/api/src/main/java/com/educycle/listing/infrastructure/persistence/*`
- `apps/api/src/main/resources/db/migration/V1__baseline.sql`

Pham vi frontend:

- `apps/web/src/features/listing/**`
- `apps/web/src/lib/entity-schemas.ts`
- `apps/web/src/lib/query-keys.ts`
- `apps/web/src/app/router/routes.jsx`
- `apps/web/src/app/(dashboard)/routes.jsx`
- `apps/web/public/sitemap.xml`

Can chot:

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `POST /api/upload/product-image`
- product status: `PENDING`, `APPROVED`, `REJECTED`, `SOLD`
- create/update payload va image URL field

### Sync 3: Transaction contract

Muc tieu: FE va BE thong nhat tao giao dich, doi trang thai, OTP/handoff, chat HTTP trong transaction, va luc nao review duoc kich hoat.

Pham vi backend:

- `apps/api/src/main/java/com/educycle/transaction/api/TransactionsController.java`
- `apps/api/src/main/java/com/educycle/transaction/api/dto/request/*`
- `apps/api/src/main/java/com/educycle/transaction/api/dto/response/*`
- `apps/api/src/main/java/com/educycle/transaction/application/**`
- `apps/api/src/main/java/com/educycle/transaction/domain/*`
- `apps/api/src/main/java/com/educycle/transaction/infrastructure/**`
- `apps/api/src/main/java/com/educycle/review/api/ReviewsController.java`
- `apps/api/src/main/java/com/educycle/review/api/dto/request/CreateReviewRequest.java`
- `apps/api/src/main/java/com/educycle/review/api/dto/response/ReviewResponse.java`
- `apps/api/src/main/java/com/educycle/review/application/**`
- `apps/api/src/main/resources/db/migration/V1__baseline.sql`

Pham vi frontend:

- `apps/web/src/features/transaction/**`
- `apps/web/src/features/review/**`
- `apps/web/src/features/listing/pages/ProductDetailPage.jsx`
- `apps/web/src/features/profile/pages/UserPublicProfilePage.jsx`
- `apps/web/src/lib/query-keys.ts`
- `apps/web/src/lib/entity-schemas.ts`

Can chot:

- `POST /api/transactions`
- `PATCH /api/transactions/{id}/status`
- `POST /api/transactions/{id}/otp`
- `POST /api/transactions/{id}/verify-otp`
- `POST /api/transactions/{id}/confirm`
- `GET/POST /api/transactions/{transactionId}/messages`
- review chi mo sau transaction hoan tat hop le
- transaction status: `PENDING`, `ACCEPTED`, `MEETING`, `COMPLETED`, `AUTO_COMPLETED`, `REJECTED`, `CANCELLED`, `DISPUTED`

## Board Backend

Cot:

- Scope
- Design
- Implement
- Test
- Done

Rule:

- Moi task toi da 1 ngay.
- Khong tao task ten "refactor backend".
- Task phai ghi cu the file/thu muc bi dong.
- Cuoi ngay chot 1 commit backend chay duoc neu backend la trong tam ngay do.

Backlog de xuat:

| Thu tu | Cot bat dau | Task | File/thu muc bi dong | Output |
| --- | --- | --- | --- | --- |
| BE-01 | Scope | Chot auth contract va error model hien tai | `AuthController.java`, `UsersController.java`, `GlobalExceptionHandler.java`, `ApiErrorBody.java`, `apps/web/src/features/auth/schemas/index.ts` de doi chieu | Bang contract auth ngan trong docs/api |
| BE-02 | Design | Doi chieu role/permission cho auth/profile/admin | `SecurityConfig.java`, `Role.java`, `AdminController.java`, `UsersController.java` | Ma tran 401/403 va quyen theo route |
| BE-03 | Implement | Khoa contract login/register/refresh/me theo DTO hien tai | `auth/api/dto/**`, `user/api/dto/response/UserMeResponse.java`, `auth/application/**` | DTO on dinh, test service pass |
| BE-04 | Test | Them/doi test auth core | `AuthServiceTest.java`, `CoreFlowIntegrationTest.java` | Test auth/login/me/refresh pass |
| BE-05 | Scope | Chot listing contract list/detail/create/update/delete/upload | `ProductsController.java`, `FileUploadController.java`, `ProductResponse.java`, `CreateProductRequest.java`, `UpdateProductRequest.java` | Bang contract listing trong docs/api |
| BE-06 | Design | Chot product status va ownership seller/admin | `ProductStatus.java`, `ProductOwnerUseCase.java`, `ProductModerationUseCase.java`, `ProductServiceImpl.java` | Rule status/ownership ro |
| BE-07 | Implement | Dong bo upload flow voi listing response | `FileUploadController.java`, `ProductImageFileService.java`, `ProductImages.java`, `ProductResponse.java` | FE nhan URL on dinh de tao/update listing |
| BE-08 | Test | Them/doi test listing core | `ProductServiceTest.java`, `CategoryServiceTest.java`, `CoreFlowIntegrationTest.java` | Test list/detail/create/update/delete/upload lien quan pass |
| BE-09 | Scope | Chot transaction/review contract | `TransactionsController.java`, `ReviewsController.java`, DTO request/response transaction/review | Bang contract transaction/review trong docs/api |
| BE-10 | Design | Chot state machine transaction va review trigger | `TransactionStatus.java`, `TransactionStatusUseCase.java`, `TransactionOtpUseCase.java`, `CreateReviewUseCase.java` | Luong status/OTP/review ro |
| BE-11 | Implement | Dong bo create/change status/OTP/handoff | `TransactionServiceImpl.java`, `TransactionResponseMapper.java`, `ProductSoldMarker.java`, `TransactionAccess.java` | Transaction flow chay het |
| BE-12 | Test | Them/doi test transaction/review core | `TransactionServiceTest.java`, `TransactionExpiryServiceTest.java`, `ReviewServiceTest.java`, `CoreFlowIntegrationTest.java` | Test transaction/review pass |
| BE-13 | Test | Chay backend test core | `apps/api` | `./mvnw.cmd -q test` pass |

## Board Frontend

Cot:

- Route/App shell
- TypeScript
- Feature build
- UI polish
- Test
- Done

Rule:

- Moi task toi da 1 ngay.
- Khong tron task route voi UI polish neu co the tach.
- Task phai ghi cu the file/thu muc bi dong.
- Cuoi ngay chot 1 commit frontend chay duoc neu frontend la trong tam ngay do.

Backlog de xuat:

| Thu tu | Cot bat dau | Task | File/thu muc bi dong | Output |
| --- | --- | --- | --- | --- |
| FE-01 | Route/App shell | Chot route V1 va bo route deferred khoi shell neu con active | `apps/web/src/app/router/routes.jsx`, `apps/web/src/app/(dashboard)/routes.jsx`, `apps/web/docs/frontend-v1-route-map.md` | Router chi expose V1 loop |
| FE-02 | TypeScript | Chot API error parser theo BE error model | `apps/web/src/lib/api-error.js`, `apps/web/src/lib/api-client.ts`, `apps/web/src/types/api.ts`, `apps/web/tests/unit/api-error.test.js` | FE hien loi thong nhat |
| FE-03 | TypeScript | Chot auth schemas/types | `apps/web/src/features/auth/schemas/index.ts`, `apps/web/src/features/auth/api/index.ts`, `apps/web/src/context/AuthContext.jsx` | Login/register/refresh/me type ro |
| FE-04 | Feature build | Dong bo auth UI voi contract | `apps/web/src/features/auth/pages/AuthPage.jsx`, `AuthPage.css`, `AuthPage.test.jsx` | Login/register dung API va error |
| FE-05 | TypeScript | Chot listing schemas/types | `apps/web/src/features/listing/schemas/index.ts`, `apps/web/src/features/listing/api/index.ts`, `apps/web/src/lib/entity-schemas.ts` | Product status/payload ro |
| FE-06 | Feature build | Dong bo listing browse/detail/create/update/upload | `apps/web/src/features/listing/pages/**`, `apps/web/src/features/listing/hooks/**` | Listing flow dung contract |
| FE-07 | UI polish | Lam sach UI listing sau khi contract on dinh | `ProductListingPage.css`, `ProductDetailPage.css`, `PostProductPage.css`, `marketplace-ui.css` | Khong doi logic API |
| FE-08 | TypeScript | Chot transaction/review schemas/types | `apps/web/src/features/transaction/schemas/index.ts`, `apps/web/src/features/review/schemas/index.ts`, API index tuong ung | Status/OTP/review typed |
| FE-09 | Feature build | Dong bo transaction detail/status/OTP/messages | `apps/web/src/features/transaction/pages/**`, `apps/web/src/features/transaction/hooks/**`, `TransactionTimeline.tsx` | Transaction flow dung contract |
| FE-10 | Feature build | Dong bo review trigger sau transaction | `apps/web/src/features/review/**`, `TransactionDetailPage.jsx`, `ProductDetailPage.jsx`, `UserPublicProfilePage.jsx` | Review chi xuat hien dung luc |
| FE-11 | UI polish | Lam sach UI transaction/review | `TransactionDetailPage.css`, `TransactionsPage.css`, `TransactionTimeline.css`, review CSS neu co | Khong doi state machine |
| FE-12 | Test | Cap nhat unit/e2e V1 core | `apps/web/tests/unit/**`, `apps/web/tests/e2e/**`, `apps/web/tests/e2e/api/**` | Test FE pass voi V1 loop |
| FE-13 | Test | Chay frontend build/test | `apps/web` | `npm run build` va test can thiet pass |

## Thu tu trien khai

Trinh tu it rui ro nhat cho repo hien tai:

1. Backend scope + domain + migration.
2. Frontend route scope.
3. Backend auth/listing.
4. Frontend auth/listing.
5. Backend transaction/review.
6. Frontend transaction/review.
7. Test hai ben.
8. Compose/deploy local.

Khong doi frontend theo cam tinh khi backend contract chua chot. Khong doi backend ngoai 3 sync point neu task frontend dang can on dinh route/ownership.

## Definition of done moi ngay

- Backend commit: backend test lien quan pass, app start duoc voi profile local/ci phu hop, contract khong bi doi am tham.
- Frontend commit: build pass, route lien quan render duoc, API client xu ly loi thong nhat.
- Fullstack commit: it nhat mot golden path co the chay qua auth -> listing -> transaction -> review hoac phan contract dang lam.
