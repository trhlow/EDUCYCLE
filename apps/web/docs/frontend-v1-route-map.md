# EduCycle Frontend V1 Route Map

FE-1 narrows the app to the smallest marketplace loop that can be owned, typed, tested, and shipped cleanly.

## V1 Scope

Keep:

- `auth`
- `listing`
- `transaction`
- `review`
- minimal `profile`
- admin lite

Defer:

- `book-wanted`
- standalone inquiry chat
- secondary static/support screens
- full UI redesign
- route-level wishlist/cart expansion beyond what the core listing flow already needs

## Route Ownership

| Route | Access | Owner | V1 status | Notes |
| --- | --- | --- | --- | --- |
| `/` | public | `listing` | keep | Marketplace entry point focused on discovery. |
| `/auth` | guest | `auth` | keep | Login/register/reset entry. |
| `/products` | public | `listing` | keep | Canonical browse/search/filter route. |
| `/search` | public | `listing` | keep as redirect | Redirects query strings to `/products`. |
| `/products/:id` | public | `listing` | keep | Product detail, seller trust, start transaction. |
| `/products/new` | protected | `listing` | keep | Create listing. |
| `/products/:id/edit` | protected | `listing` | keep | Edit own listing or admin-supported moderation correction. |
| `/transactions` | protected | `transaction` | keep | User transaction inbox. |
| `/transactions/:id` | protected | `transaction` | keep | Transaction detail, chat inside transaction, OTP, dispute, review submission. |
| `/transactions/guide` | public | `transaction` | keep | Public safety and transaction education. |
| `/profile` | protected | `profile` | keep minimal | Basic identity, verification, password, notification preferences. |
| `/users/:id` | public | `profile` | keep minimal | Seller public profile and reputation context. |
| `/admin` | admin protected | `admin` | keep lite | Moderation, users, products, transactions, categories, reviews in one admin shell for V1. |
| `*` | public | `shell` | keep | Not found page. |

## Embedded Feature Ownership

| Feature | Route surface | Owner | V1 decision |
| --- | --- | --- | --- |
| Reviews | `/transactions/:id`, `/products/:id`, `/users/:id`, `/admin` | `review` | No standalone review route in V1. Reviews are created from completed transactions and displayed as seller reputation. |
| Transaction chat | `/transactions/:id` | `transaction` | Keep only as part of a transaction. Defer inquiry chat as an independent route. |
| Wishlist affordance | `/products`, `/products/:id` | `listing` | Keep as a lightweight product action if already present, but do not treat `/wishlist` as a V1-owned route. |
| Product moderation | `/admin`, `/products/:id`, `/products/:id/edit` | `admin`, `listing` | Keep only the moderation loop needed to approve/reject and let sellers correct listings. |

## Deferred Route Inventory

| Current route | Deferred owner | Reason |
| --- | --- | --- |
| `/book-wanted` | `book-wanted` | Separate demand-posting workflow; not required for core sell/buy transaction loop. |
| `/book-wanted/:id` | `book-wanted` | Depends on book-wanted listing surface. |
| `/book-wanted/new` | `book-wanted` | Creation flow deferred. |
| `/book-wanted/:id/edit` | `book-wanted` | Edit flow deferred. |
| `/book-wanted/mine` | `book-wanted` | Management flow deferred. |
| `/book-wanted/inquiry/:inquiryId` | `book-wanted` | Standalone inquiry chat deferred. |
| `/cart` | `cart` | Transaction starts from product detail in V1; cart creates a second buying model. |
| `/wishlist` | `listing` | Useful later, but V1 should not allocate route ownership to it. |
| `/dashboard` | `listing` | Replace later with listing-owned seller inventory route or fold into profile. |
| `/about` | `marketing` | Secondary static page. |
| `/contact` | `support` | Secondary support/static page. |

## V1 Sitemap

Only public, indexable V1 pages belong in `public/sitemap.xml`:

- `/`
- `/products`
- `/transactions/guide`

Do not include protected routes, guest-only auth routes, admin routes, dynamic detail routes without generated canonical URLs, or deferred routes.

## Next FE Steps

1. Continue moving feature logic from route pages into `src/features/*`.
2. Convert the route map and page components to TypeScript as each feature is cut over.
3. Move remaining app-level contexts behind feature or `src/lib` facades where it reduces coupling.
4. Add a dedicated seller inventory surface only if V1 needs it; do not revive the old catch-all dashboard route.
