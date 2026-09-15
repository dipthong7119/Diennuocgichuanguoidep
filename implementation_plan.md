# Kế hoạch: Hệ thống Quản lý Điện Nước Hộ Gia Đình Tích hợp AI

## Phần 1: Giải thích chi tiết `de_tai_48.md` và `rubric_chung.md`

---

### 📄 File `de_tai_48.md` — Đề tài số 48

File này là **đề bài của bạn**. Nó mô tả hệ thống bạn cần xây dựng:

| Mục | Nội dung | Ý nghĩa |
|-----|----------|----------|
| **1. Mô tả bài toán** | Hộ gia đình/khu trọ cần theo dõi điện nước, hóa đơn, thanh toán | Đây là **WHY** — tại sao cần hệ thống này |
| **2. Mục tiêu** | Quản lý hộ/phòng, chỉ số, hóa đơn, báo cáo + AI phân tích | Đây là **WHAT** — hệ thống phải làm gì |
| **3.1. Chức năng quản lý** | 8 chức năng: đăng nhập, CRUD, nhập chỉ số, tính hóa đơn, thanh toán, tra cứu, cảnh báo, thống kê | Đây là danh sách **tính năng bắt buộc** phải code |
| **3.2. Chức năng AI** | 3 chức năng: sinh nhận xét, cảnh báo bất thường, gợi ý tiết kiệm | Phần AI **phải tích hợp** vào sản phẩm |
| **4. Yêu cầu kỹ thuật** | FastAPI + HTML + SQLite + AI API (Gemini/OpenAI) + Test | **Tech stack** bạn phải dùng |
| **5. Dữ liệu** | Bảng hộ, đồng hồ, chỉ số, đơn giá, hóa đơn, thanh toán | **Cấu trúc DB** |
| **6. SDLC + AI** | KT1→KT3→Cuối kỳ: mỗi giai đoạn dùng AI khác nhau | **Lộ trình** qua 4 mốc kiểm tra |
| **7. Mức độ khó** | Cơ bản — AI chủ yếu sinh nhận xét từ báo cáo tổng hợp | Đề tài thuộc **mức cơ bản** |

> [!IMPORTANT]
> **Mục 6 rất quan trọng**: Bạn phải ghi lại nhật ký dùng AI (prompt + kết quả) ở MỌI giai đoạn. Đây là minh chứng bắt buộc để chấm điểm.

---

### 📄 File `rubric_chung.md` — Rubric chấm điểm

File này là **bảng tiêu chí chấm điểm** cho TOÀN BỘ 4 bài kiểm tra. Mỗi bài 10 tiêu chí, chia 3 mức:

#### 🔵 Bài kiểm tra 1 (KT1): Phân tích yêu cầu, thiết kế hệ thống, xác định AI

| # | Mức | Bạn cần làm gì |
|---|-----|----------------|
| 1 | Biết | Phân tích bài toán: bối cảnh, người dùng, dữ liệu, quy trình |
| 2 | Biết | Liệt kê chức năng quản lý: đầu vào/xử lý/đầu ra |
| 3 | Hiểu | Yêu cầu phi chức năng: bảo mật, hiệu năng, phân quyền |
| 4 | Hiểu | Use Case: xác định actor, vẽ sơ đồ Use Case |
| 5 | Hiểu | ERD: vẽ sơ đồ cơ sở dữ liệu, khóa chính/ngoại |
| 6 | Hiểu | Kiến trúc: Frontend–Backend–DB–AI Service |
| 7 | V.dụng | Xác định chức năng AI hợp lý, gắn với dữ liệu thực |
| 8 | V.dụng | Thiết kế prompt: system prompt, user prompt, input/output format |
| 9 | V.dụng | Minh chứng dùng AI: lưu prompt, phản hồi, nhận xét kết quả |
| 10 | V.dụng | Tài liệu phân tích thiết kế đầy đủ, có cấu trúc |

#### 🟢 Bài kiểm tra 2 (KT2): Xây dựng chức năng quản lý

| # | Nội dung chính |
|---|---------------|
| 1-2 | Cấu trúc dự án + Đăng nhập/phân quyền |
| 3-6 | CRUD, tìm kiếm/lọc, thống kê, giao diện |
| 7-10 | CSDL ổn định, xử lý lỗi, nhật ký AI, README |

#### 🟡 Bài kiểm tra 3 (KT3): Tích hợp AI + kiểm thử

| # | Nội dung chính |
|---|---------------|
| 1-2 | AI chạy được trong hệ thống + kết nối API đúng |
| 3-6 | Prompt có hệ thống, tối ưu 3 vòng, dùng dữ liệu DB, hiển thị rõ |
| 7-10 | Xử lý lỗi AI, test case, review code bằng AI, UX tốt |

#### 🔴 Bài thi cuối kỳ: Hoàn thiện + báo cáo

Tổng hợp: hệ thống chạy ổn, code sạch, bảo mật, hiệu năng, báo cáo kỹ thuật, demo tốt.

> [!TIP]
> **Minh chứng bắt buộc** (trang cuối rubric):
> - Nhật ký dùng AI theo từng giai đoạn
> - Tài liệu phân tích: use case, ERD, kiến trúc
> - Mã nguồn + commit
> - Test case
> - Dữ liệu mẫu demo
> - Báo cáo chất lượng AI

---

## Phần 2: Kế hoạch thực hiện KT1

> [!IMPORTANT]
> Đây là phần **ưu tiên số 1** theo yêu cầu của bạn.

Tôi sẽ tạo file tài liệu `KT1_Phan_tich_thiet_ke.md` bao gồm đầy đủ 10 tiêu chí:

### Nội dung sẽ tạo:

#### 1. Phân tích bài toán (Tiêu chí 1)
- Bối cảnh: Khu trọ/hộ gia đình ghi chép điện nước rời rạc
- Người dùng: Quản lý (admin) và Người dùng hộ gia đình
- Dữ liệu: Hộ, đồng hồ, chỉ số, hóa đơn, thanh toán
- Quy trình nghiệp vụ: Nhập chỉ số → Tính tiền → Thanh toán → Phân tích AI
- Vấn đề: Khó phát hiện tiêu thụ bất thường khi ghi chép thủ công

#### 2. Yêu cầu chức năng (Tiêu chí 2)
Bảng mô tả 8 chức năng quản lý + 3 chức năng AI với Đầu vào/Xử lý/Đầu ra

#### 3. Yêu cầu phi chức năng (Tiêu chí 3)
Bảo mật API key, phân quyền, ẩn danh hóa dữ liệu gửi AI, responsive UI

#### 4. Use Case Diagram (Tiêu chí 4)
Sơ đồ Use Case bằng Mermaid cho 2 actor: Admin và Hộ gia đình

#### 5. ERD - Sơ đồ CSDL (Tiêu chí 5)
ERD Mermaid với 5 bảng: HoGiaDinh, DongHo, ChiSoTieuThu, HoaDon, PhanTichAI

#### 6. Kiến trúc hệ thống (Tiêu chí 6)
Sơ đồ kiến trúc: Browser ↔ FastAPI ↔ SQLite + Gemini/OpenAI API

#### 7. Vị trí ứng dụng AI (Tiêu chí 7)
3 chức năng AI: sinh nhận xét, cảnh báo bất thường, gợi ý tiết kiệm

#### 8. Thiết kế Prompt + Luồng gọi AI (Tiêu chí 8)
System prompt, user prompt, input/output format, ràng buộc ẩn danh hóa

#### 9. Minh chứng sử dụng AI (Tiêu chí 9)
Nhật ký prompt đã dùng, phản hồi AI nhận được, phần đã kiểm tra/chỉnh sửa

#### 10. Tổng hợp tài liệu (Tiêu chí 10)
Kế hoạch triển khai các giai đoạn KT2, KT3, Cuối kỳ

---

## Phần 3: Xây dựng hệ thống hoàn chỉnh (Frontend + Backend)

### Hiện trạng
Bạn đã có **Backend FastAPI hoàn chỉnh**:
- ✅ `database.py` — 5 bảng ORM
- ✅ `schemas.py` — Pydantic validation
- ✅ `routers/ho_gia_dinh.py` — CRUD hộ gia đình
- ✅ `routers/dong_ho.py` — CRUD đồng hồ
- ✅ `routers/chi_so.py` — Nhập chỉ số + tính hóa đơn
- ✅ `routers/ai_insight.py` — Phân tích AI (Gemini/OpenAI + mock)
- ✅ `main.py` — FastAPI app + CORS

### Cần bổ sung
- ❌ **Frontend** (HTML/CSS/JS) — Giao diện web đẹp, responsive
- ❌ **Trang đăng nhập** — Phân quyền admin/user (cần thêm vào backend)
- ❌ **Dashboard** — Thống kê tổng quan
- ❌ **Trang quản lý** — Hộ gia đình, đồng hồ, chỉ số, hóa đơn
- ❌ **Trang AI** — Xem kết quả phân tích AI
- ❌ **Static file serving** — FastAPI serve HTML
- ❌ **Dữ liệu mẫu** — Seed data cho demo
- ❌ **Search/Filter** — Tìm kiếm, lọc dữ liệu

### Kế hoạch code

#### Backend bổ sung:
| File | Mô tả |
|------|-------|
| [MODIFY] [main.py](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/main.py) | Thêm StaticFiles + Jinja2 template serving |
| [MODIFY] [database.py](file:///c:/Users/Admin/Downloads/Diennuocgichuanguoidep-main/database.py) | Thêm bảng User cho đăng nhập (tối thiểu) |
| [NEW] `routers/auth.py` | Đăng nhập đơn giản (session-based) |
| [NEW] `routers/thong_ke.py` | API thống kê doanh thu, tiêu thụ |
| [NEW] `seed_data.py` | Script tạo dữ liệu mẫu |

#### Frontend (HTML/CSS/JS thuần):
| File | Mô tả |
|------|-------|
| [NEW] `static/index.html` | Trang chính (SPA-like, đổi tab) |
| [NEW] `static/css/style.css` | CSS hiện đại: dark mode, glassmorphism, animation |
| [NEW] `static/js/app.js` | JavaScript: gọi API, render DOM, routing |
| [NEW] `static/js/api.js` | Module gọi API (fetch wrapper) |

### Cách chạy trên cả Android lẫn PC
> [!NOTE]
> Vì hệ thống dùng **FastAPI + HTML/CSS/JS thuần**, nó là **Web App** chạy trên trình duyệt:
> - **PC**: Mở trình duyệt → `http://localhost:8000`
> - **Android**: Kết nối cùng WiFi → mở trình duyệt → `http://<IP-máy-PC>:8000`
> - Hoặc dùng Termux trên Android để chạy Python + FastAPI trực tiếp
>
> **Không cần tạo app riêng cho Android**. Giao diện responsive sẽ tự điều chỉnh kích thước.

---

## Phần 4: Áp dụng Prompts mẫu

Các prompt trong folder `prompts/` là **mẫu cho đề tài bán hàng**. Tôi sẽ **chuyển thể** sang đề tài điện nước của bạn:

| Prompt mẫu | Áp dụng cho đề tài điện nước |
|-------------|------------------------------|
| `01-Cau-truc-Phan-tich-yeu-cau.md` | → Phân tích yêu cầu hệ thống điện nước |
| `02-Zero-Shot-Xac-dinh-actor.md` | → Xác định actor: Admin, Hộ gia đình |
| `04-CoT-Thiet-ke-CSDL.md` | → Thiết kế 5 bảng CSDL điện nước |
| `08-Sinh-ma-API-CRUD.md` | → Sinh code CRUD cho hộ gia đình, đồng hồ |

---

## Thứ tự thực hiện

### Phase 1: KT1 — Tài liệu phân tích thiết kế ⭐ (LÀM TRƯỚC)
1. Tạo file `KT1_Phan_tich_thiet_ke.md` đầy đủ 10 tiêu chí
2. Bao gồm: Use Case diagram, ERD, kiến trúc, prompt design, nhật ký AI

### Phase 2: Xây dựng Frontend + Bổ sung Backend
1. Thêm authentication đơn giản
2. Tạo giao diện HTML/CSS/JS đẹp, responsive
3. Kết nối frontend với backend API
4. Tạo dữ liệu mẫu

### Phase 3: (Tùy chọn) KT2 + KT3
- Nếu bạn muốn tiếp: bổ sung test case, nhật ký AI chi tiết, tối ưu prompt

---

## Verification Plan

### Automated Tests
- `python -m uvicorn main:app --reload` — Kiểm tra server khởi động
- Truy cập `http://localhost:8000/docs` — Kiểm tra Swagger API
- Truy cập `http://localhost:8000` — Kiểm tra giao diện

### Manual Verification
- Bạn tự test trên trình duyệt PC
- Test responsive trên trình duyệt mobile
- Test flow: Thêm hộ → Thêm đồng hồ → Nhập chỉ số → Xem hóa đơn → Gọi AI phân tích

> [!WARNING]
> **Cần bạn xác nhận trước khi tiến hành:**
> 1. Bạn có Gemini API Key chưa? (Miễn phí tại https://aistudio.google.com). Nếu chưa có, hệ thống vẫn chạy được với mock response.
> 2. Bạn muốn giao diện tiếng Việt hoàn toàn chứ?
> 3. Bạn có muốn thêm chức năng đăng nhập/phân quyền không? (Rubric KT2 yêu cầu)
