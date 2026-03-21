---
name: pages
description: "Skill for the Pages area of frontend. 110 symbols across 25 files."
---

# Pages

110 symbols | 25 files | Cohesion: 90%

## When to Use

- Working with code in `src/`
- Understanding how ProfilePage, OAuthCallbackPage, DashboardPage work
- Modifying pages-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/pages/AdminPage.jsx` | AdminOrders, fetchTransactions, AdminCategories, fetchCategories, handleSubmit (+20) |
| `src/pages/DashboardPage.jsx` | DashboardPage, handleViewChange, PurchasesView, fetchPurchases, SalesView (+9) |
| `src/pages/TransactionDetailPage.jsx` | TransactionDetailPage, scrollToBottom, fetchTransaction, fetchMessages, handleStatusUpdate (+5) |
| `src/pages/AuthPage.jsx` | OtpVerifyModal, AuthPage, switchTab, handleVerify, handleVerifyOtpSubmit (+4) |
| `src/contexts/AuthContext.jsx` | useAuth, AuthProvider, logout, verifyOtp, updateProfile (+2) |
| `src/pages/TransactionsPage.jsx` | TransactionsPage, fetchTransactions, getRole, handleQuickAction, formatDate (+1) |
| `src/pages/PostProductPage.jsx` | PostProductPage, fetchCategories, handleImageUrlAdd, removeImage, validate (+1) |
| `src/pages/ProfilePage.jsx` | ProfilePage, handleDeleteAccount, handleProfileSave, handleVerifyPhoneOtp |
| `src/pages/WishlistPage.jsx` | WishlistPage, handleAddToCart, handleRemove |
| `src/pages/ProductDetailPage.jsx` | ProductDetailPage, fetchProduct, fetchReviews |

## Entry Points

Start here when exploring this area:

- **`ProfilePage`** (Function) — `src/pages/ProfilePage.jsx:5`
- **`OAuthCallbackPage`** (Function) — `src/pages/OAuthCallbackPage.jsx:5`
- **`DashboardPage`** (Function) — `src/pages/DashboardPage.jsx:16`
- **`handleViewChange`** (Function) — `src/pages/DashboardPage.jsx:31`
- **`NotificationProvider`** (Function) — `src/contexts/NotificationContext.jsx:10`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `ProfilePage` | Function | `src/pages/ProfilePage.jsx` | 5 |
| `OAuthCallbackPage` | Function | `src/pages/OAuthCallbackPage.jsx` | 5 |
| `DashboardPage` | Function | `src/pages/DashboardPage.jsx` | 16 |
| `handleViewChange` | Function | `src/pages/DashboardPage.jsx` | 31 |
| `NotificationProvider` | Function | `src/contexts/NotificationContext.jsx` | 10 |
| `useNotifications` | Function | `src/contexts/NotificationContext.jsx` | 119 |
| `useAuth` | Function | `src/contexts/AuthContext.jsx` | 200 |
| `ProtectedRoute` | Function | `src/components/ProtectedRoute.jsx` | 3 |
| `GuestRoute` | Function | `src/components/ProtectedRoute.jsx` | 26 |
| `Navbar` | Function | `src/components/layout/Navbar.jsx` | 6 |
| `Layout` | Function | `src/components/layout/Layout.jsx` | 5 |
| `AuthPage` | Function | `src/pages/AuthPage.jsx` | 124 |
| `switchTab` | Function | `src/pages/AuthPage.jsx` | 247 |
| `useToast` | Function | `src/components/Toast.jsx` | 61 |
| `TransactionDetailPage` | Function | `src/pages/TransactionDetailPage.jsx` | 26 |
| `scrollToBottom` | Function | `src/pages/TransactionDetailPage.jsx` | 87 |
| `fetchTransaction` | Function | `src/pages/TransactionDetailPage.jsx` | 91 |
| `fetchMessages` | Function | `src/pages/TransactionDetailPage.jsx` | 103 |
| `handleStatusUpdate` | Function | `src/pages/TransactionDetailPage.jsx` | 121 |
| `handleConfirmReceipt` | Function | `src/pages/TransactionDetailPage.jsx` | 208 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleLoginSubmit → ClearAuthStorage` | cross_community | 4 |
| `AdminCategories → FetchCategories` | intra_community | 3 |
| `AdminCategories → FetchReviews` | intra_community | 3 |
| `AdminReviews → FetchCategories` | intra_community | 3 |
| `AdminReviews → FetchReviews` | intra_community | 3 |
| `HandleDeleteAccount → ClearAuthStorage` | intra_community | 3 |
| `HandleLogout → ClearAuthStorage` | intra_community | 3 |
| `AdminModeration → FetchPending` | intra_community | 3 |
| `ProductsView → FetchProducts` | intra_community | 3 |
| `HandleLogout → ClearAuthStorage` | intra_community | 3 |

## How to Explore

1. `gitnexus_context({name: "ProfilePage"})` — see callers and callees
2. `gitnexus_query({query: "pages"})` — find related execution flows
3. Read key files listed above for implementation details
