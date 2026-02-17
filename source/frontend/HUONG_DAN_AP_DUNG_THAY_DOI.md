# HƯỚNG DẪN ÁP DỤNG THAY ĐỔI

Tài liệu này hướng dẫn chi tiết cách **build**, **triển khai** và **áp dụng thay đổi** cho frontend EduCycle theo đúng quy trình.

---

## 1. Chuẩn bị môi trường

- **Node.js**: ≥ 18  
- **npm**: ≥ 9  
- Đã clone repo `educycle-frontend` về máy / server
- Backend `.NET Web API` chạy tại `http://localhost:5171` (hoặc URL tương đương, nếu cấu hình proxy khác)

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

---

## 2. Cài đặt dependencies

Tại thư mục gốc dự án:

```bash
cd educycle-frontend
npm install
```

Lưu ý:
- Chỉ cần chạy lại `npm install` khi có thay đổi trong `package.json` hoặc lần đầu deploy trên môi trường mới.

---

## 3. Biến môi trường (nếu có)

Tạo file `.env` (hoặc chỉnh sửa nếu đã có) tại thư mục gốc dự án.  
Ví dụ (tùy chỉnh theo backend thực tế):

```bash
VITE_API_BASE_URL=http://localhost:5171/api
```

Kiểm tra lại:
- Frontend đang gọi tới đúng URL API của backend.
- Nếu deploy production, hãy sử dụng URL backend production tương ứng.

---

## 4. Chạy Development (local)

Áp dụng khi DEV muốn kiểm tra nhanh thay đổi trước khi build:

```bash
npm run dev
```

Sau đó mở trình duyệt:

- `http://localhost:5173`

Kiểm tra sơ bộ:
- Đăng nhập / Đăng ký
- Duyệt sản phẩm, tạo giao dịch test
- Các chức năng liên quan đến phần code vừa thay đổi

---

## 5. Build Production

Khi chuẩn bị deploy lên môi trường Staging / Production:

```bash
npm run build
```

Output build sẽ nằm trong thư mục:

- `dist/`

Có thể kiểm tra nhanh bằng:

```bash
npm run preview
```

Mặc định port: `4173` (hoặc theo log hiển thị).

---

## 6. Triển khai lên server

Tùy môi trường deploy thực tế (Nginx, IIS, Docker, v.v.). Ví dụ generic:

1. **Copy build**:
   - Copy toàn bộ nội dung thư mục `dist/` lên server (thư mục serve static).

2. **Cấu hình web server** (ví dụ Nginx):
   - Serve static từ `dist/`.
   - Thêm rule fallback cho SPA (React Router): tất cả đường dẫn `/*` trỏ về `index.html`.

3. **Kết nối backend**:
   - Đảm bảo `VITE_API_BASE_URL` (hoặc config tương đương) trỏ đúng tới API backend (HTTPS/HTTP, domain, port).

4. **Reload / Restart service**:
   - Reload Nginx / IIS / container để nhận build mới.

---

## 7. Quy trình áp dụng thay đổi cho mỗi release

1. **Cập nhật code**:
   - Pull branch tương ứng (`dev` hoặc `main`):

   ```bash
   git pull origin main
   # hoặc
   git pull origin dev
   ```

2. **Xem tóm tắt thay đổi**:
   - Cập nhật nội dung trong file `TOM_TAT_THAY_DOI.md` cho release này:
     - Phiên bản, ngày triển khai
     - Các thay đổi chính (Frontend / Backend)
     - Ảnh hưởng tới người dùng
     - Yêu cầu khi triển khai

3. **Cài đặt & build**:

   ```bash
   npm install        # nếu cần
   npm run build
   ```

4. **Triển khai build**:
   - Copy thư mục `dist/` lên server như mục 6.

5. **Smoke test sau deploy**:
   - Đăng nhập / Đăng ký
   - Duyệt sản phẩm, xem chi tiết
   - Một luồng giao dịch thử (tạo yêu cầu, chấp nhận, OTP, hoàn thành)
   - Dashboard & trang Admin (nếu có thay đổi liên quan)

6. **Ghi nhận kết quả**:
   - Tick các mục đã test trong `TOM_TAT_THAY_DOI.md`.
   - Ghi lại `Known issues` (nếu có).

---

## 8. Xử lý rollback (nếu cần)

Trong trường hợp deploy gặp lỗi nghiêm trọng:

1. Khôi phục source code frontend về tag/commit ổn định trước đó:

```bash
git checkout <commit_ổn_định>
npm install
npm run build
```

2. Triển khai lại thư mục `dist/` cũ lên server.
3. Cập nhật `TOM_TAT_THAY_DOI.md` ghi rõ:
   - Lý do rollback
   - Commit / Version bị rollback

---

## 9. Ghi chú

- Luôn chạy `npm run build` trước khi deploy để phát hiện sớm lỗi build.
- Khuyến khích test trên môi trường Staging trước khi lên Production.
- Luôn cập nhật `TOM_TAT_THAY_DOI.md` đi kèm mỗi lần deploy để dễ truy vết.

