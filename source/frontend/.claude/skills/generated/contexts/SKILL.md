---
name: contexts
description: "Skill for the Contexts area of frontend. 11 symbols across 5 files."
---

# Contexts

11 symbols | 5 files | Cohesion: 95%

## When to Use

- Working with code in `src/`
- Understanding how validateLogin, handleLoginSubmit, applySession work
- Modifying contexts-related functionality

## Key Files

| File | Symbols |
|------|---------|
| `src/contexts/AuthContext.jsx` | persistSession, applySession, login, register, socialLogin |
| `src/pages/AuthPage.jsx` | validateLogin, handleLoginSubmit |
| `src/contexts/WishlistContext.jsx` | getStorageKey, WishlistProvider |
| `src/utils/safeStorage.js` | readStoredArray |
| `src/contexts/CartContext.jsx` | CartProvider |

## Entry Points

Start here when exploring this area:

- **`validateLogin`** (Function) — `src/pages/AuthPage.jsx:145`
- **`handleLoginSubmit`** (Function) — `src/pages/AuthPage.jsx:178`
- **`applySession`** (Function) — `src/contexts/AuthContext.jsx:36`
- **`login`** (Function) — `src/contexts/AuthContext.jsx:49`
- **`register`** (Function) — `src/contexts/AuthContext.jsx:80`

## Key Symbols

| Symbol | Type | File | Line |
|--------|------|------|------|
| `validateLogin` | Function | `src/pages/AuthPage.jsx` | 145 |
| `handleLoginSubmit` | Function | `src/pages/AuthPage.jsx` | 178 |
| `applySession` | Function | `src/contexts/AuthContext.jsx` | 36 |
| `login` | Function | `src/contexts/AuthContext.jsx` | 49 |
| `register` | Function | `src/contexts/AuthContext.jsx` | 80 |
| `socialLogin` | Function | `src/contexts/AuthContext.jsx` | 130 |
| `readStoredArray` | Function | `src/utils/safeStorage.js` | 3 |
| `WishlistProvider` | Function | `src/contexts/WishlistContext.jsx` | 9 |
| `CartProvider` | Function | `src/contexts/CartContext.jsx` | 5 |
| `persistSession` | Function | `src/contexts/AuthContext.jsx` | 6 |
| `getStorageKey` | Function | `src/contexts/WishlistContext.jsx` | 5 |

## Execution Flows

| Flow | Type | Steps |
|------|------|-------|
| `HandleLoginSubmit → ClearAuthStorage` | cross_community | 4 |
| `HandleLoginSubmit → PersistSession` | intra_community | 4 |
| `Register → ClearAuthStorage` | cross_community | 3 |
| `Register → PersistSession` | intra_community | 3 |
| `SocialLogin → ClearAuthStorage` | cross_community | 3 |
| `SocialLogin → PersistSession` | intra_community | 3 |

## Connected Areas

| Area | Connections |
|------|-------------|
| Pages | 1 calls |

## How to Explore

1. `gitnexus_context({name: "validateLogin"})` — see callers and callees
2. `gitnexus_query({query: "contexts"})` — find related execution flows
3. Read key files listed above for implementation details
