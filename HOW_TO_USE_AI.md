# 🎯 CÁCH DÙNG AI VỚI PROJECT EDUCYCLE

---

## PROMPT A — Bắt đầu session mới

```
Tôi có monorepo EduCycle tại D:\EDUCYCLE.

Trước khi làm bất cứ điều gì, hãy đọc 2 file theo thứ tự:
1. D:\EDUCYCLE\AI_CONTEXT.md       — bản đồ, trạng thái, patterns, lỗi đã gặp
2. D:\EDUCYCLE\PROJECT_AUDIT.md    — danh sách bugs cần fix ngay

Sau khi đọc xong, tóm tắt:
- Trạng thái hiện tại: đã có gì, còn thiếu gì?
- Bug nào critical nhất cần fix ngay?
- Việc tiếp theo nên làm gì?

Chưa cần viết code.
```

---

## PROMPT B — Implement feature / Fix bug

```
Đọc D:\EDUCYCLE\AI_CONTEXT.md trước.

Task: [mô tả task]

Yêu cầu:
- Code đầy đủ, copy-paste được, không placeholder "// existing code..."
- File SỬA: chỉ ra đoạn cũ → đoạn mới
- File TẠO MỚI: viết toàn bộ
- Sau khi xong: chạy lệnh verify

Tham khảo thêm nếu cần:
- Backend modules: D:\EDUCYCLE\MASTER_IMPROVEMENT_PROMPT.md
- Frontend issues: D:\EDUCYCLE\FRONTEND_IMPROVEMENT_PROMPT.md
- Critical bugs: D:\EDUCYCLE\PROJECT_AUDIT.md (có template copy-paste sẵn)
```

**Ví dụ:**
```
Đọc D:\EDUCYCLE\AI_CONTEXT.md.
Fix các mục trong PROJECT_AUDIT.md phần "CÒN MỞ".
Dùng template copy-paste sẵn trong file đó, không cần re-analyze.
```

---

## PROMPT C — Commit và Push code

```
Đọc D:\EDUCYCLE\AI_CONTEXT.md và D:\EDUCYCLE\GITFLOW.md.

Tôi vừa thay đổi các file sau:
[liệt kê file đã thay đổi]

Yêu cầu:
1. Xác định type và scope theo GITFLOW.md Section 2
2. Tạo commit message đúng convention: <type>(<scope>): <mô tả>
3. Stage đúng các files liên quan (KHÔNG git add .)
4. Commit + push lên branch dev
5. Chạy verify: git log -1 --oneline

Branch hiện tại: dev (hoặc nói branch đang dùng)
```

**Ví dụ:**
```
Đọc D:\EDUCYCLE\GITFLOW.md.

Tôi vừa sửa:
- source/frontend/src/contexts/AuthContext.jsx  (xóa mock bypass)
- source/frontend/src/pages/TransactionDetailPage.jsx  (fix STATUS_CONFIG)
- source/frontend/src/api/endpoints.js  (thêm verifyOtp, resendOtp)

Tạo commit message và push lên dev.
```

---

## PROMPT D — Debug lỗi

```
Đọc D:\EDUCYCLE\AI_CONTEXT.md trước — đặc biệt mục 5 (lỗi đã gặp).

Lỗi: [paste error message hoặc mô tả]
File: [tên file nếu biết]

Đừng đề xuất giải pháp vi phạm rules ở mục 4 và 5 của AI_CONTEXT.md.
```

---

## CẤU TRÚC FILE AI (đọc cái nào khi nào)

| File | Khi nào đọc | Token cost |
|------|------------|-----------|
| `AI_CONTEXT.md` | **Mọi session** — đọc đầu tiên | Thấp |
| `PROJECT_AUDIT.md` | Khi fix bugs | Trung bình |
| `GITFLOW.md` | Khi commit/push | Trung bình |
| `MASTER_IMPROVEMENT_PROMPT.md` | Khi implement BE module mới | Cao |
| `FRONTEND_IMPROVEMENT_PROMPT.md` | Khi implement FE features | Cao |

---

## SAU KHI XONG MỖI TASK

1. Cập nhật `AI_CONTEXT.md` bảng trạng thái: ❌/🔴/🟡 → ✅
2. Cập nhật `PROJECT_AUDIT.md`: đánh dấu bug đã fix
3. Cập nhật `GITFLOW.md` Section 7 (Version Roadmap) nếu xong 1 version
