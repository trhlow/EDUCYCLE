# 🎨 FRONTEND IMPROVEMENT PROMPT
> Nguồn gốc: đọc trực tiếp code thực tế. Không giả định, không hallucinate.
> Cập nhật: 2026-03-21

---

## CONTEXT

```
Stack: React 19 + Vite 7, Axios, Context API
Design system: src/styles/tokens.css (169 CSS variables — dùng var(--xxx), KHÔNG hardcode màu)
Path: source/frontend/src/

Backend trả UPPERCASE enums:
  TransactionStatus: "PENDING" | "ACCEPTED" | "MEETING" | "COMPLETED" | "REJECTED" | "CANCELLED"
  ProductStatus    : "PENDING" | "APPROVED" | "REJECTED" | "SOLD"
  Role             : "USER" | "ADMIN"
```

---

## ✅ ĐÃ XONG (Issues 1–6)

| # | Issue | Cách đã fix |
|---|-------|------------|
| 1 | STATUS_CONFIG TitleCase → UPPERCASE | Keys đổi UPPERCASE, `statusKey = status?.toUpperCase()` |
| 2 | Mock bypass trong AuthContext | Xóa MOCK_ACCOUNTS, throw lỗi thật khi BE down |
| 3 | AuthPage thiếu OTP step | Thêm form OTP sau register → verify → redirect login |
| 4 | Chat không có realtime | STOMP WebSocket trong TransactionDetailPage |
| 5 | endpoints.js thiếu hàm | Thêm verifyOtp/resendOtp/socialLogin/verifyPhone |
| 6 | AuthContext thiếu export | Export đủ verifyOtp/resendOtp/socialLogin/verifyPhone |

---

## ⚠️ CÒN MỞ (Issues 7–8)

### ISSUE 7 — UI Hiện đại hóa (Medium)

**Triệu chứng:**
- Loading states dùng text `⏳ Đang tải...` — không có skeleton
- Product card thiếu placeholder ảnh đẹp

**Fix cần làm:**

**[TẠO MỚI] `src/components/Skeleton.jsx` + `Skeleton.css`**
```jsx
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-price" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-row" />
      ))}
    </div>
  );
}
```

```css
/* Skeleton.css */
.skeleton {
  background: linear-gradient(90deg, var(--neutral-200) 25%, var(--neutral-100) 50%, var(--neutral-200) 75%);
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: var(--radius-md);
}
.skeleton-card  { border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-light); }
.skeleton-image { height: 200px; width: 100%; border-radius: 0; }
.skeleton-body  { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.skeleton-title { height: 20px; width: 70%; }
.skeleton-text  { height: 14px; width: 90%; }
.skeleton-price { height: 24px; width: 40%; }
.skeleton-row   { height: 48px; width: 100%; margin-bottom: var(--space-2); }
```

**[SỬA] `ProductListingPage.jsx`** — thay block loading:
```jsx
import { SkeletonCard } from '../components/Skeleton';

{loading ? (
  <div className="plp-product-grid">
    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
) : /* ... */}
```

**[SỬA] `DashboardPage.jsx`** — thay `⏳ Đang tải...` bằng `<SkeletonList count={5} />`.

---

### ISSUE 8 — Dashboard chỉ cho admin, user thường bị redirect (Medium)

**Triệu chứng:**
```javascript
// DashboardPage.jsx — redirect tất cả non-admin về /profile
useEffect(() => {
  if (!isAdmin) navigate('/profile', { replace: true });
}, [isAdmin, navigate]);
```
Các view `OverviewView`, `ProductsView`, `PurchasesView`, `SalesView` đều dùng API thật và hoàn toàn phù hợp cho user thường.

**Fix cần làm:**

**[SỬA] `DashboardPage.jsx`** — xóa redirect, mở cho user thường:
```javascript
// XÓA block redirect
// useEffect(() => { if (!isAdmin) navigate('/profile'...) }, ...)

// Sidebar items phân theo role
const SIDEBAR_ITEMS_USER = [
  { icon: '📊', label: 'Tổng Quan',        view: 'overview'  },
  { icon: '📚', label: 'Sản Phẩm Của Tôi', view: 'products'  },
  { icon: '🛒', label: 'Đã Mua',            view: 'purchases' },
  { icon: '💰', label: 'Lịch Sử Bán',       view: 'sales'     },
  { icon: '⚙️', label: 'Cài Đặt',           view: 'settings'  },
];
const SIDEBAR_ITEMS_ADMIN = [
  ...SIDEBAR_ITEMS_USER,
  { icon: '🛡️', label: 'Quản Trị',         view: 'admin'     },
];
const sidebarItems = isAdmin ? SIDEBAR_ITEMS_ADMIN : SIDEBAR_ITEMS_USER;
```

**[SỬA] `App.jsx`** — bỏ `adminOnly` trên route dashboard:
```jsx
// Từ:
<Route path="dashboard" element={<ProtectedRoute adminOnly><DashboardPage /></ProtectedRoute>} />
// Thành:
<Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
```

---

## RULES KHÔNG ĐƯỢC VI PHẠM

1. Luôn dùng `var(--xxx)` từ tokens.css — không hardcode màu
2. Normalize status về UPPERCASE trước khi so sánh
3. Không tái tạo mock data — khi BE down UI báo lỗi rõ ràng
4. Error message từ backend — dùng `err.response?.data?.message` trước khi fallback
