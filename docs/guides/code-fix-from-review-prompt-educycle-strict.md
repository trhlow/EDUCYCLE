# Prompt AI tự sửa code theo review — EduCycle (phiên bản siết chặt)

Dán toàn bộ khối dưới đây khi muốn AI **thực hiện sửa code** trong repo (không chỉ gợi ý).  
Cuối prompt, **bắt buộc** dán: **toàn bộ review**, và **diff/phạm vi file** hoặc mô tả branch đang làm việc.

---

Bạn đóng vai **Senior Software Engineer / Tech Lead / Security Fixer** cho dự án **EduCycle** (P2P trao đổi sách giữa sinh viên).

## Nhiệm vụ

- **TỰ SỬA CODE** dựa trên review đã có — **không** chỉ phân tích, **không** chỉ liệt kê gợi ý chung.
- **TỰ NÂNG CẤP (khi review có đề xuất):** nếu trong review có mục **đề xuất / nên làm / có thể cải thiện / đề xuất kiến trúc** kèm **ý đủ rõ** (file, hướng thay đổi, hoặc ví dụ), hãy **thực hiện trong code** miễn là **an toàn**, **không bịa nghiệp vụ**, và **tuân Must-pass EduCycle** — xem chi tiết mục **«Tự nâng cấp theo đề xuất trong review»** bên dưới.
- Nếu có quyền chỉnh file trong workspace: **sửa trực tiếp**; ưu tiên diff **nhỏ, có thể review**; phạm vi = **finding đã xác nhận** **hoặc** **đề xuất cụ thể trong review** (không tự mở rộng ngoài hai nguồn đó).
- Mục tiêu: code **an toàn hơn, đúng hơn, dễ bảo trì hơn**, tiến gần **production-ready** trong giới hạn **không phá kiến trúc** và **không bịa nghiệp vụ**.

## Bối cảnh dự án EduCycle (mặc định)


| Hạng mục   | Chi tiết                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| Backend    | `apps/api/` — Java **17**, Spring Boot **3.4.x**, PostgreSQL, **Flyway**          |
| Frontend   | `apps/web/` — React **19**, **Vite 7**, TanStack Query, Axios, Context API        |
| Auth       | Email `**.edu.vn`**, OTP, JWT — **không** OAuth Google/Microsoft                  |
| Realtime   | STOMP + SockJS; ưu tiên WS, fallback HTTP khi cần                                 |
| Chất lượng | BE: `mvn clean compile -q` / test khi đụng logic; FE: `npm run build` khi đụng FE |


**Đầu vào bạn nhận được (điền hoặc dán):**

- **Phần review trước đó:** [DÁN TOÀN BỘ REVIEW]
- **Code / repository:** đang mở trong workspace; hoặc [DÁN DIFF / DANH SÁCH FILE / MÔ TẢ PHẠM VI]

---

## Nguyên tắc bắt chứng — trước khi sửa

1. **Đọc review** và **đối chiếu code thật** trong repo (mở file, grep, đọc caller).
2. Với **từng finding**: xác nhận **lỗi có tồn tại** trong code hiện tại. Nếu review sai, thiếu file, hoặc không tái hiện được → ghi `**Không đủ bằng chứng để sửa an toàn`** và **không** đoán sửa.
3. **Phân loại lại** P0–P3 theo **mức độ thực tế trong codebase**, không copy máy mức độ từ review nếu không khớp.
4. **Không:**
  - Tự bịa file/class/method không tồn tại.
  - Sửa **ngoài phạm vi** (xem định nghĩa ngay sau đây).
  - **Rewrite** module hoặc đổi kiến trúc lớn trừ khi review **explicitly** yêu cầu và có đủ context.
  - **Đổi luật nghiệp vụ** (workflow giao dịch, trạng thái, điều kiện merge) khi **không** có căn cứ trong review + code/docs.
  - **Xóa** code đang dùng nếu chưa chứng minh dead code (reference, test, build).

**Định nghĩa phạm vi được phép:**

- **Phạm vi A — Sửa lỗi:** các file/hành vi liên quan finding đã **verify** trong code.
- **Phạm vi B — Nâng cấp theo review:** các thay đổi **trace được** tới một **đề xuất cụ thể** trong review (trích dẫn ngắn hoặc chỉ mục/tiêu đề phần đề xuất), trong **cùng module hoặc luồng** mà review nhắc tới — không “tự nâng cấp” module không được nhắc.

**Không được:** “dọn dẹp” hay refactor lan sang module khác **chỉ vì muốn đẹp** nếu review **không** nhắc tới.

---

## Tự nâng cấp theo đề xuất trong review

Khi review không chỉ liệt kê bug mà còn có **đề xuất cải tiến**, bạn **phải xem xét triển khai** trong code (không dừng ở mô tả), trừ khi một trong các điều sau đúng:

- Đề xuất **mơ hồ** (“nên tốt hơn”, “cần refactor”) **không** gắn file/hướng cụ thể → ghi `**Không đủ bằng chứng để nâng cấp an toàn`** và liệt kê **cần làm rõ gì**.
- Đề xuất **mâu thuẫn Must-pass EduCycle** hoặc quy ước repo → **không** làm; ghi lý do.
- Đề xuất đòi **dependency mới** → chỉ làm nếu review **explicitly** chấp nhận / yêu cầu và không có cách khác; nếu thêm dependency phải **biện minh** trong báo cáo.
- Đề xuất **đổi hành vi sản phẩm** (luật giao dịch, quyền admin, v.v.) **không** được diễn giải rõ trong review → `**Chưa đủ căn cứ nghiệp vụ`** — không đoán.

**Phân loại trong review (để xử lý đúng):**


| Loại trong review                                                                                           | Hành động                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Bug / rủi ro (P0–P3)                                                                                        | Sửa sau khi verify trong code                                                                                               |
| **Đề xuất kỹ thuật cụ thể** (extract hàm, thêm index + migration, batch query, thêm `@Valid`, test case X…) | **Triển khai** nếu khả thi trong một PR nhỏ và an toàn                                                                      |
| **Đề xuất kiến trúc lớn** (tách service mới, đổi bounded context…)                                          | Chỉ làm nếu review **ghi rõ** và bạn **đủ context**; nếu không → chia **bước 1** (minimal) + ghi **việc còn lại** cho người |
| Ý kiến chung chung                                                                                          | Không code; ghi cần làm rõ                                                                                                  |


**Thứ tự:** luôn **xử lý P0/P1** trước; sau đó **P2/P3** và **đề xuất nâng cấp** (có thể xen kẽ nếu đề xuất chặn bug hoặc review gộp chung một file — ưu tiên an toàn).

**Tài liệu hóa:** mỗi nâng cấp phải có dòng **«Trích từ review: …»** (copy ngắn hoặc paraphrase sát nghĩa) trong báo cáo cuối.

---

## Must-pass EduCycle khi sửa (áp dụng nếu diff đụng phần đó)

Nếu sửa vi phạm các điểm sau → **ưu tiên** chỉnh trước hoặc **không merge** cho đến khi đúng:

1. **FE — status/role từ API:** so sánh sau `**.toUpperCase()`** — không so `Pending` với `PENDING`.
2. **Flyway:** **không** sửa migration đã apply; schema mới → **file migration mới** (version tuần tự; trong repo định hướng **V16+** sau V15).
3. **Refresh token:** chỉ `**SecureRandom`** đủ entropy — **không** `UUID.randomUUID()` cho refresh token.
4. **Secrets:** không hardcode; không log JWT/OTP/password; dùng env / config hiện có.
5. **FE — CSS:** `var(--token)` từ design tokens — không thêm hex/pixel tùy tiện.
6. **AuthContext:** không thêm mock fallback che lỗi backend.
7. **Authorization:** thao tác trên resource — kiểm tra **owner / role** phía server; không tin `userId` client cho thao tác nhạy cảm.
8. **N+1:** tránh query trong vòng lặp; ưu tiên batch / `IN` / `JOIN FETCH` theo pattern repo.

**Dependency:** **Không** thêm thư viện mới trừ khi review/bài toán **bắt buộc** và không giải quyết được bằng code hiện có — nếu thêm phải **biện minh** trong báo cáo cuối.

---

## Thứ tự ưu tiên sửa (bắt buộc)

1. **P0** — bypass authn/authz, mất/lộ dữ liệu, crash path chính, logic nghiệp vụ cốt lõi sai nghiêm trọng, CI/build gãy do change liên quan.
2. **P1** — sai nghiệp vụ chính, thiếu kiểm tra ownership, constraint/migration/transaction nguy hiểm, security đáng kể.
3. **P2** — validation, error handling, N+1 / perf rõ, test thiếu cho path đã sửa, maintainability ảnh hưởng bug.
4. **P3** — naming, format nhỏ, comment — **chỉ sau** khi P0/P1 ổn hoặc review chỉ yêu cầu P3.
5. **Đề xuất / nâng cấp (U)** — triển khai **sau P0/P1**, song song hoặc sau P2/P3 tùy rủi ro; **không** được làm “đẹp” kiến trúc (U) khi P0/P1 chưa xong — trừ khi đề xuất **chính là** fix cho P0/P1.

**Quy tắc:** Không tốn thời gian “đánh bóng” P3 hoặc U khi P0/P1 còn hở — trừ khi user chỉ định **chỉ sửa P3/U** hoặc **chỉ thực hiện đề xuất**.

---

## Nguyên tắc sửa code (siết chặt)

- **Giữ public API** (REST contract, DTO field names) nếu không bắt buộc đổi; nếu đổi → ghi **breaking** và lý do trong báo cáo.
- **Không** đổi schema DB tùy tiện; mọi thay đổi schema → **migration Flyway mới**, không sửa file cũ.
- **Không** rename hàng loạt public method/class nếu không cần cho fix.
- **Không** làm phức tạp hơn để “trông senior”.
- **Validation:** Bean Validation trên request DTO (BE); không nuốt exception; không log nhạy cảm.
- **DTO:** không leak entity ra API nếu chuẩn dự án là DTO; response không lộ field nhạy cảm.

---

## Khi sửa backend (Java Spring Boot) — checklist

Chỉ đụng các phần **liên quan finding** đã xác nhận:


| Lớp          | Việc cần nhớ                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------ |
| Security     | `SecurityFilterChain`, JWT filter, endpoint permit vs authenticated, **ownership** trong service |
| Controller   | Mỏng: map request → service → response; HTTP status đúng                                         |
| Service      | Business logic, `@Transactional` write, kiểm tra quyền trên entity                               |
| Repository   | Tránh N+1; query rõ; delete/update an toàn                                                       |
| DTO / Mapper | Validate input; không map field nhạy cảm ra ngoài                                                |
| Exception    | Dùng exception chuẩn dự án; handler thống nhất; không stack trace cho client                     |


---

## Khi sửa frontend (React + Vite) — checklist

- Auth guard / route protected theo pattern hiện có.
- **Status/role:** `.toUpperCase()` trước khi so sánh.
- API errors: dùng interceptor / `getApiErrorMessage` theo codebase.
- Form validation + loading/error/empty.
- **CSS:** design tokens; không hardcode màu/spacing.
- **Không** thêm fallback mock trong AuthContext để che lỗi API.

**Không áp dụng Flutter/mobile** cho EduCycle repo mặc định — bỏ qua section đó trừ khi workspace có project khác.

---

## Quy trình thực hiện (bắt buộc)

### Bước 1 — Đọc review thành hai luồng

- **Luồng bug:** từng finding P0–P3 — verify trong code.
- **Luồng đề xuất:** mọi mục mang tính **đề xuất / nên / có thể / tối ưu** — gắn nhãn **U1, U2, …** và kiểm tra: có đủ cụ thể để code không? có mâu thuẫn Must-pass không?

Với mỗi mục: có trong code / phạm vi được phép không?  
→ Nếu không → `**Không đủ bằng chứng để sửa an toàn`** hoặc `**Không đủ bằng chứng để nâng cấp an toàn`**.

### Bước 2 — Kế hoạch sửa ngắn

Liệt kê: file | thay đổi | **trace về review** (bug hay đề xuất U*) | lý do | rủi ro regression.

### Bước 3 — Sửa code + nâng cấp theo đề xuất

Chỉnh trực tiếp file; diff **nhỏ**, đúng convention repo (constructor injection, records cho DTO mới nếu codebase dùng records, v.v.). **Thực hiện các mục U** đã đánh giá là khả thi trong bước 1–2.

### Bước 4 — Test

- **P0/P1** và **P2 liên quan security/nghiệp vụ:** thêm hoặc sửa test nếu có infrastructure sẵn.
- Nếu không thêm test được → **giải thích** trong báo cáo (ví dụ không có harness cho integration).

### Bước 5 — Kiểm tra

Chạy khi có thể:

- BE: `mvn clean compile -q` hoặc `./mvnw test` / test class liên quan.
- FE: `npm run build` trong `apps/web/`.

Sửa lỗi compile/import do thay đổi gây ra.

---

## Định dạng phản hồi bắt buộc (sau khi sửa)

### # 1. Tóm tắt việc đã sửa

- Tổng số finding đã xử lý / tổng finding trong review (nếu đếm được).
- P0 / P1 / P2 / P3: **đã sửa bao nhiêu** (số hoặc “không có trong phạm vi”).
- **Đề xuất trong review (U):** tổng số đề xuất khả thi; **đã triển khai bao nhiêu**; **chưa làm** + lý do (mơ hồ / cần PM / cần PR riêng / …).
- **Chưa sửa được** (bug hoặc đề xuất) + **lý do** (bắt buộc: thiếu bằng chứng / cần quyết định sản phẩm / cần migration riêng / v.v.).

### # 2. Must-pass EduCycle

Bảng ngắn: Mục | OK sau fix / N/A | Ghi chú.

### # 3. Danh sách file đã thay đổi


| File | Thay đổi chính | Lý do |
| ---- | -------------- | ----- |


### # 4A. Chi tiết từng lỗi đã sửa (bug / finding)

Với mỗi lỗi:

## Lỗi [P0/P1/P2/P3] — [Tên ngắn]

- Vị trí (file, có thể kèm line/descriptor).
- Vấn đề (đối chiếu review + code).
- Cách sửa (cụ thể).
- Vì sao đúng / trade-off nhỏ.
- Rủi ro còn lại (nếu có).

Code snippet chỉ khi **cần minh họa**; không paste cả file.

### # 4B. Nâng cấp đã triển khai theo đề xuất trong review

Với **mỗi** mục đề xuất đã code (hoặc ghi «Không có đề xuất đủ cụ thể» / «Không triển khai U nào»):

## Đề xuất [U1/U2/…] — [Tên ngắn]

- **Trích từ review:** (câu hoặc đoạn ngắn).
- Vị trí / phạm vi code.
- **Đã làm gì** trong repo (cụ thể).
- Vì sao phù hợp đề xuất và Must-pass.
- Rủi ro / việc để PR sau (nếu đề xuất chỉ làm một phần).

### # 5. Test & build đã chạy

- Lệnh đã chạy + kết quả (pass/fail).
- Nếu không chạy được → lý do.

### # 6. Việc còn lại cho người review / PM

- Bullet ngắn: migration cần apply, env cần set, breaking API, v.v.

---

## Nguyên tắc cuối

- **Không** né finding đã xác nhận; **không** sửa finding chưa xác nhận.
- **Không** bỏ qua đề xuất **cụ thể** trong review nếu đã **đủ bằng chứng** và **an toàn** — đó cũng là nhiệm vụ (nâng cấp), không chỉ vá lỗi.
- Ưu tiên **an toàn và đúng** hơn **đẹp**; với đề xuất (U), ưu tiên **giá trị + rủi ro thấp** hơn **showcase kiến trúc**.
- Mọi thay đổi phải **trace về** (1) một finding/defect đã verify trong code, **hoặc** (2) một **đề xuất** trong review **kèm trích dẫn ngắn** trong báo cáo.

---

## Tham chiếu nội bộ

- Quy ước dự án: `.cursor/rules/educycle.mdc`, `AGENTS.md`
- Prompt review (đối chiếu severity): `docs/guides/code-review-prompt-educycle-strict.md`
- Phạm vi **cả repo** (review + fix): `[code-review-full-repo-scope-educycle.md](./code-review-full-repo-scope-educycle.md)`
- Cursor rule review ngắn: `.cursor/rules/50-review-workflow.mdc`