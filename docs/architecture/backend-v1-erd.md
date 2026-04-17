# Backend V1 ERD

Baseline migration: `backend/educycle-java/src/main/resources/db/migration/V1__baseline.sql`.

Scope follows ADR 0001 and ADR 0002: auth/user/profile, listing/category, transaction HTTP messages, review, admin-lite support, plus persisted notifications used by core flows.

Excluded from the V1 baseline: AI/RAG (`ai_knowledge_chunk`), book-wanted (`book_wanted_*`), wishlist (`wishlist_items`), media-only proxy data, and WebSocket-only persistence.

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar username
        varchar email UK
        text password_hash
        varchar role
        text avatar
        text bio
        timestamptz created_at
        varchar google_id
        varchar facebook_id
        varchar microsoft_id
        boolean is_email_verified
        text email_verification_token
        timestamptz email_verification_token_expiry
        text password_reset_token
        timestamptz password_reset_token_expiry
        varchar phone
        boolean phone_verified
        varchar refresh_token
        timestamptz refresh_token_expiry
        uuid refresh_token_family
        boolean notify_product_moderation
        boolean notify_transactions
        boolean notify_messages
        timestamptz transaction_rules_accepted_at
        boolean trading_allowed
    }

    CATEGORIES {
        int id PK
        varchar name
    }

    PRODUCTS {
        uuid id PK
        varchar name
        text description
        numeric price
        text image_url
        text image_urls
        varchar category
        varchar condition
        text contact_note
        int category_id FK
        uuid user_id FK
        varchar status
        text reject_reason
        timestamptz created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid product_id FK
        uuid buyer_id FK
        uuid seller_id FK
        numeric amount
        varchar status
        varchar otp_code
        timestamptz otp_expires_at
        boolean buyer_confirmed
        boolean seller_confirmed
        timestamptz created_at
        timestamptz updated_at
        text dispute_reason
        timestamptz disputed_at
        text cancel_reason
        timestamptz cancelled_at
    }

    MESSAGES {
        uuid id PK
        uuid transaction_id FK
        uuid sender_id FK
        text content
        timestamptz created_at
    }

    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        uuid target_user_id FK
        uuid transaction_id
        int rating
        text content
        timestamptz created_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar type
        varchar title
        text message
        uuid related_id
        boolean is_read
        timestamptz created_at
    }

    USERS ||--o{ PRODUCTS : sells
    CATEGORIES ||--o{ PRODUCTS : categorizes
    PRODUCTS ||--o{ TRANSACTIONS : traded_in
    USERS ||--o{ TRANSACTIONS : buyer
    USERS ||--o{ TRANSACTIONS : seller
    TRANSACTIONS ||--o{ MESSAGES : contains
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ REVIEWS : receives
    PRODUCTS ||--o{ REVIEWS : reviewed_by
    USERS ||--o{ NOTIFICATIONS : receives
```

## Notes

- `TransactionStatus`: `PENDING`, `ACCEPTED`, `MEETING`, `COMPLETED`, `AUTO_COMPLETED`, `REJECTED`, `CANCELLED`, `DISPUTED`.
- `ProductStatus`: `PENDING`, `APPROVED`, `REJECTED`, `SOLD`.
- `Role`: `USER`, `ADMIN`.
- `reviews.transaction_id` is an external reference for business rules, not an enforced FK, matching the current JPA model.
- `notifications` stays in the baseline because product and transaction core services persist notification side effects. The notification REST API is not part of the V1 public contract.
