# Production TLS (Caddy / nginx) — EduCycle

Stack gốc [`docker-compose.yml`](../../docker-compose.yml) publish **`web:80`** (HTTP). JWT và cookie (nếu có) trên **HTTP cleartext** chỉ chấp nhận được trên **mạng tin cậy** (localhost, lab). Trên Internet cần **TLS termination** ở edge (reverse proxy hoặc tunnel).

## Chuẩn bị

1. **Tên miền** trỏ A/AAAA về máy chạy Docker (hoặc dùng tunnel — xem cuối trang).
2. Trong `.env` (hoặc env production):
   - `APP_FRONTEND_BASE_URL=https://your-domain.com` (URL mà user thấy trên trình duyệt).
   - `CORS_ALLOWED_ORIGINS=https://your-domain.com` (và origin bổ sung nếu có).
3. **Không** commit file chứng chỉ hoặc private key; dùng volume hoặc secret manager.

---

## Tuỳ chọn A — Caddy (Let's Encrypt tự động)

Thêm service (ví dụ file override `docker-compose.tls.yml` — **không** bật mặc định trong repo):

```yaml
# docker-compose.tls.yml — chạy: docker compose -f docker-compose.yml -f docker-compose.tls.yml up -d
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      EDUCYCLE_DOMAIN: ${EDUCYCLE_DOMAIN:?đặt ví dụ app.example.edu.vn}
    volumes:
      - ./deploy/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      web:
        condition: service_started

volumes:
  caddy_data:
  caddy_config:
```

**`deploy/caddy/Caddyfile`** — biến `EDUCYCLE_DOMAIN` truyền từ Compose (ví dụ `app.example.edu.vn`):

```caddyfile
{$EDUCYCLE_DOMAIN} {
    encode gzip zstd
    reverse_proxy web:80
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}
```

- **Production + domain public:** Caddy xin chứng chỉ Let's Encrypt (HTTP-01 — cổng **80** và **443** mở ra Internet).
- **Chỉ lab (không có domain):** dùng site kiểu `localhost` với chỉ thị `tls internal` trong cùng block (trình duyệt cảnh báo cert tự ký) — xem [Caddy docs](https://caddyserver.com/docs/caddyfile/directives/tls).

---

## Tuỳ chọn B — nginx + chứng chỉ có sẵn

Giả sử bạn có `fullchain.pem` và `privkey.pem` (Let's Encrypt hoặc CA nội bộ):

```yaml
# docker-compose.tls-nginx.yml
services:
  edge:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/nginx/tls.conf:/etc/nginx/conf.d/default.conf:ro
      - ./deploy/nginx/certs:/etc/nginx/certs:ro
    depends_on:
      web:
        condition: service_started
```

**`deploy/nginx/tls.conf`:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name your-domain.edu.vn;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://web:80;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
    }
}
```

Đặt file PEM vào `deploy/nginx/certs/` trên server (không commit).

---

## Tuỳ chọn C — Cloudflare Tunnel / tương đương

Không mở cổng 443 trên router: dùng **Cloudflare Tunnel**, **ngrok**, v.v. — vẫn phải cấu hình **HTTPS** phía edge và cập nhật `APP_FRONTEND_BASE_URL` + CORS cho đúng origin công khai.

---

## Kiểm tra nhanh

- Mở `https://your-domain` → SPA + `/api` qua proxy như hiện tại.
- Đăng nhập → request có `Authorization` qua HTTPS.
- WebSocket: nếu FE dùng `wss://`, đảm bảo proxy chuyển tiếp **Upgrade** (snippet nginx phía trên).

Xem thêm: [ARCHITECTURE.md §11](../../ARCHITECTURE.md) (tóm tắt trong repo).
