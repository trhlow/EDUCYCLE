# Design System Master File

> **LOGIC:** When building a specific page, first check `docs/design/educycle/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

## EduCycle — triển khai trong repo (bắt buộc)

1. **CSS / JSX style:** chỉ dùng `**var(--tên-token)`** từ `frontend/src/styles/tokens.css`. **Không** hardcode mã hex, **không** hardcode giá trị pixel cho spacing (dùng `--space-`*, `--radius-*`, v.v.) — đồng bộ `.cursor/rules/educycle.mdc` và `NOTES.md` §8.
2. **MASTER file này + output UI UX Pro Max** (màu Baloo/Comic, purple/green, v.v.) là **hướng dẫn layout, pattern, mood và checklist**. Khi commit code, **ánh xạ** sang token hiện có; chỉ khi team quyết định đổi brand mới chỉnh giá trị trong `tokens.css`.
3. **Typography:** app đang dùng **Poppins / Inter** (`--font-display`, `--font-body`). Giữ font này trừ khi có task đổi toàn hệ thống; có thể vẫn áp dụng *mood* “friendly / education” từ MASTER qua spacing, contrast, hierarchy.

### Ánh xạ nhanh: gợi ý MASTER / skill → token EduCycle


| Ý nghĩa                                               | Token ưu tiên trong code                                             |
| ----------------------------------------------------- | -------------------------------------------------------------------- |
| Nền chính                                             | `var(--bg-primary)`                                                  |
| Nền phụ / section                                     | `var(--bg-secondary)`, `var(--bg-tertiary)`                          |
| Chữ chính / phụ                                       | `var(--text-primary)`, `var(--text-secondary)`                       |
| CTA / hành động tích cực (green trong MASTER)         | `var(--secondary-500)`, `var(--success)`                             |
| Brand / link / focus (xanh giáo dục — brand hiện tại) | `var(--primary-500)` … `var(--primary-700)`, `var(--border-focus)`   |
| Cảnh báo / nhấn mạnh                                  | `var(--accent-500)`, `var(--warning)`                                |
| Lỗi                                                   | `var(--error)`                                                       |
| Viền                                                  | `var(--border-light)`, `var(--border-medium)`                        |
| Bo góc                                                | `var(--radius-md)` … `var(--radius-2xl)`                             |
| Đổ bóng                                               | `var(--shadow-sm)` … `var(--shadow-xl)`, `var(--shadow-focus)`       |
| Chuyển động                                           | `var(--duration-fast)`, `var(--duration-base)`, `var(--ease-in-out)` |


### Spacing: bảng MASTER → `tokens.css`


| MASTER (ý niệm) | Token EduCycle |
| --------------- | -------------- |
| xs              | `--space-1`    |
| sm              | `--space-2`    |
| md              | `--space-4`    |
| lg              | `--space-6`    |
| xl              | `--space-8`    |
| 2xl             | `--space-12`   |
| 3xl             | `--space-16`   |


Các khối **Component Specs** phía dưới dùng hex / px để **minh họa** theo output generator; khi implement EduCycle hãy viết lại tương đương bằng token ở trên.

---

**Project:** EduCycle
**Generated:** 2026-03-28 15:47:03
**Category:** Marketplace (P2P)

---

## Global Rules

### Color Palette


| Role       | Hex       | CSS Variable         |
| ---------- | --------- | -------------------- |
| Primary    | `#7C3AED` | `--color-primary`    |
| Secondary  | `#A78BFA` | `--color-secondary`  |
| CTA/Accent | `#22C55E` | `--color-cta`        |
| Background | `#FAF5FF` | `--color-background` |
| Text       | `#4C1D95` | `--color-text`       |


**Color Notes:** Trust purple + transaction green

### Typography

- **Gợi ý từ generator:** Baloo 2 / Comic Neue — mood kids, education, playful.
- **Trong repo EduCycle:** dùng `var(--font-display)`, `var(--font-body)` (Poppins / Inter). Cỡ chữ: `var(--text-sm)` … `var(--text-5xl)`; weight: `var(--weight-medium)`, v.v.

### Spacing Variables (trong code chỉ dùng `tokens.css`)


| Ý niệm     | Token EduCycle                       |
| ---------- | ------------------------------------ |
| Tight      | `var(--space-1)`, `var(--space-2)`   |
| Chuẩn      | `var(--space-4)`                     |
| Section    | `var(--space-6)`, `var(--space-8)`   |
| Hero / lớn | `var(--space-12)`, `var(--space-16)` |


### Shadow Depths (trong code chỉ dùng `tokens.css`)

Dùng `var(--shadow-sm)` … `var(--shadow-xl)`, `var(--shadow-focus)` khi cần ring focus.

---

## Component Specs (minh họa → implement bằng token)

Ví dụ dưới **đã chuyển** sang token EduCycle; component thật trong repo có thể khác tên class nhưng cùng nguyên tắc.

### Buttons

```css
.btn-primary {
  background: var(--secondary-500);
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  transition: var(--transition);
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.92;
}

.btn-secondary {
  background: transparent;
  color: var(--primary-600);
  border: 2px solid var(--primary-500);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-lg);
  font-weight: var(--weight-semibold);
  transition: var(--transition);
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: var(--bg-elevated);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

### Inputs

```css
.input {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: border-color var(--duration-base) var(--ease-in-out);
}

.input:focus {
  border-color: var(--border-focus);
  outline: none;
  box-shadow: var(--shadow-focus);
}
```

### Modals

```css
.modal-overlay {
  background: var(--bg-overlay);
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-elevated);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Vibrant & Block-based

**Keywords:** Bold, energetic, playful, block layout, geometric shapes, high color contrast, duotone, modern, energetic

**Best For:** Startups, creative agencies, gaming, social media, youth-focused, entertainment, consumer

**Key Effects:** Large sections (48px+ gaps), animated patterns, bold hover (color shift), scroll-snap, large type (32px+), 200-300ms

### Page Pattern

**Pattern Name:** Marketplace / Directory

- **Conversion Strategy:**  map hover pins,  card carousel, Search bar is the CTA. Reduce friction to search. Popular searches suggestions.
- **CTA Placement:** Hero Search Bar + Navbar 'List your item'
- **Section Order:** 1. Hero (Search focused), 2. Categories, 3. Featured Listings, 4. Trust/Safety, 5. CTA (Become a host/seller)

---

## Anti-Patterns (Do NOT Use)

- ❌ Low trust signals
- ❌ Confusing layout

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- No emojis used as icons (use SVG instead)
- All icons from consistent icon set (Heroicons/Lucide)
- `cursor-pointer` on all clickable elements
- Hover states with smooth transitions (150-300ms)
- Light mode: text contrast 4.5:1 minimum
- Focus states visible for keyboard navigation
- `prefers-reduced-motion` respected
- Responsive: 375px, 768px, 1024px, 1440px
- No content hidden behind fixed navbars
- No horizontal scroll on mobile

