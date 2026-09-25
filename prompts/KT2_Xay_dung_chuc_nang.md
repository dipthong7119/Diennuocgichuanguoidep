# Bài Kiểm Tra 2: Xây dựng chức năng quản lý và minh chứng sử dụng AI trong lập trình

**Đề tài:** Hệ thống quản lý hóa đơn điện nước hộ gia đình có tích hợp AI  
**Sinh viên:** _(điền tên)_  
**Ngày thực hiện:** 10/09/2026

---

## 1. Cấu trúc dự án hợp lý (Tiêu chí 1 — Mức Biết)

### 1.1. Sơ đồ cấu trúc thư mục

```
Diennuocgichuanguoidep-main/
├── main.py                  ← Entry point FastAPI
├── database.py              ← ORM models (6 bảng) + SQLite engine
├── schemas.py               ← Pydantic validation schemas
├── seed_data.py             ← Script tạo dữ liệu mẫu
├── requirements.txt         ← Python dependencies
├── .env.example             ← Cấu hình API Key mẫu
├── database.db              ← SQLite database file
│
├── routers/                 ← Backend API modules
│   ├── __init__.py
│   ├── auth.py              ← Xác thực đăng nhập/đăng xuất
│   ├── ho_gia_dinh.py       ← CRUD hộ gia đình
│   ├── dong_ho.py           ← CRUD đồng hồ điện/nước
│   ├── chi_so.py            ← Nhập chỉ số + tự tạo hóa đơn
│   ├── ai_insight.py        ← Gọi AI phân tích tiêu thụ
│   └── thong_ke.py          ← API thống kê dashboard
│
├── frontend/                ← React + TypeScript + Tailwind
│   ├── index.html           ← HTML entry point
│   ├── package.json         ← Node.js dependencies
│   ├── vite.config.ts       ← Vite bundler + API proxy
│   ├── tsconfig.json        ← TypeScript config
│   └── src/
│       ├── main.tsx          ← React entry
│       ├── App.tsx           ← Root component + tab routing
│       ├── index.css         ← Global styles + Tailwind
│       ├── types/index.ts    ← TypeScript interfaces
│       ├── data/mockData.ts  ← Dữ liệu mẫu + helper functions
│       └── components/
│           ├── Header.tsx        ← Header Zalo Mini App
│           ├── BottomNav.tsx     ← Bottom tab navigation
│           ├── DashboardTab.tsx  ← Tổng quan + biểu đồ
│           ├── MeterTab.tsx      ← Form nhập chỉ số
│           └── BillTab.tsx       ← Hóa đơn + AI Insight
│
├── KT1_Phan_tich_thiet_ke.md  ← Tài liệu KT1
├── KT2_Xay_dung_chuc_nang.md  ← Tài liệu KT2 (file này)
└── KT3_Tich_hop_AI_kiem_thu.md ← Tài liệu KT3
```

### 1.2. Giải thích phân chia

| Thư mục / File | Vai trò | Framework |
|---|---|---|
| `main.py` | Entry point, khởi tạo FastAPI app, mount routers, serve frontend | FastAPI |
| `database.py` | ORM models cho 6 bảng CSDL, engine SQLite | SQLAlchemy 2.0 |
| `schemas.py` | Validate đầu vào/đầu ra API bằng Pydantic | Pydantic v2 |
| `routers/` | Mỗi file 1 module nghiệp vụ, tách biệt rõ ràng | FastAPI Router |
| `frontend/src/` | SPA React + TypeScript, thiết kế Mobile-first | Vite + React 19 + Tailwind v4 |

> **Nhận xét:** Dự án tuân theo mô hình MVC — Models (`database.py`), Views (`frontend/`), Controllers (`routers/`). Backend và frontend tách biệt hoàn toàn, giao tiếp qua REST API.

---

## 2. Xây dựng chức năng đăng nhập và phân quyền (Tiêu chí 2 — Mức Biết)

### 2.1. Mô hình bảng NguoiDung

```python
# database.py
class NguoiDung(Base):
    __tablename__ = "NguoiDung"
    Username      = Column(String, primary_key=True, index=True)
    PasswordHash  = Column(String, nullable=False)
    Role          = Column(String, nullable=False, default="user")  # 'admin' | 'user'
```

### 2.2. Luồng xác thực (Session-based Token)

```
[Client] → POST /auth/login {username, password}
         ← 200 {token, username, role}

[Client] → GET /auth/me  (Header: Authorization: Bearer <token>)
         ← 200 {username, role}

[Client] → POST /auth/logout (Header: Authorization: Bearer <token>)
         ← 200 {message: "Đăng xuất thành công"}
```

### 2.3. Bảo mật

- **Mật khẩu**: Hash SHA256 trước khi lưu, so sánh hash khi đăng nhập
- **Token**: UUID session ngẫu nhiên, lưu in-memory phía server
- **Phân quyền**: Field `Role` phân biệt Admin / User
- **Frontend**: Token lưu localStorage, gửi kèm mọi API request

### 2.4. Code minh họa (routers/auth.py)

```python
@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(NguoiDung).filter(NguoiDung.Username == payload.username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

    hashed = _hash_password(payload.password)
    if user.PasswordHash != hashed:
        raise HTTPException(status_code=401, detail="Sai tên đăng nhập hoặc mật khẩu")

    token = f"session-{uuid.uuid4().hex}"
    sessions[token] = {"username": user.Username, "role": user.Role}
    return {"message": "Đăng nhập thành công", "token": token, ...}
```

### 2.5. Tài khoản demo

| Vai trò | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| User | `user1` | `user123` |

---

## 3. Hoàn thiện CRUD nghiệp vụ chính (Tiêu chí 3 — Mức Hiểu)

### 3.1. Tổng quan các API CRUD

| Đối tượng | Create | Read | Update | Delete | Router |
|---|---|---|---|---|---|
| Hộ gia đình | `POST /ho-gia-dinh/` | `GET /ho-gia-dinh/` `GET /{ma_ho}` | `PUT /{ma_ho}` | `DELETE /{ma_ho}` | `ho_gia_dinh.py` |
| Đồng hồ | `POST /dong-ho/` | `GET /dong-ho/` `GET /{ma_dh}` | `PUT /{ma_dh}` | `DELETE /{ma_dh}` | `dong_ho.py` |
| Chỉ số tiêu thụ | `POST /chi-so/` | `GET /chi-so/{ma_dh}` | — | — | `chi_so.py` |
| Hóa đơn | (auto-created) | `GET /chi-so/hoa-don/{ma_ho}` | `PATCH /.../thanh-toan` | — | `chi_so.py` |
| Phân tích AI | `POST /ai-insight/generate` | `GET /ai-insight/{ma_hd}` | — | — | `ai_insight.py` |

### 3.2. Ví dụ chi tiết: CRUD Hộ gia đình

**Tạo mới (Create):**
```
POST /ho-gia-dinh/
Body: { "MaHo": "HO-006", "TenChuHo": "Võ Thị Hoa", "SoDienThoai": "0956789012", "MaPhong": "P302" }
Response 201: { "MaHo": "HO-006", ... }
```

**Đọc (Read):**
```
GET /ho-gia-dinh/         → Danh sách tất cả hộ
GET /ho-gia-dinh/HO-001   → Chi tiết 1 hộ
```

**Cập nhật (Update):**
```
PUT /ho-gia-dinh/HO-006
Body: { "TenChuHo": "Võ Thị Hoa (cập nhật)", "SoDienThoai": "0956789999", "MaPhong": "P303" }
```

**Xóa (Delete):**
```
DELETE /ho-gia-dinh/HO-006
Response: { "message": "Đã xóa hộ gia đình 'HO-006'" }
```

### 3.3. Nghiệp vụ đặc biệt: Nhập chỉ số → Tự tạo hóa đơn

```
POST /chi-so/
Body: { "MaChiSo": "CS-0031", "MaDongHo": "DH-D001", "ThangNam": "2026-04-01",
        "ChiSoCu": 1360, "ChiSoMoi": 1490 }
→ Tự tính: TongTien = (1490 - 1360) × 3500 = 455.000 đ
→ Nếu HoaDon tháng 4 đã tồn tại → cộng thêm; chưa có → tạo mới
Response: { chi_so: {...}, hoa_don: {...}, message: "Đã thêm chỉ số và tạo hóa đơn mới" }
```

---

## 4. Xây dựng chức năng tìm kiếm và lọc (Tiêu chí 4 — Mức Hiểu)

### 4.1. Frontend: Lọc theo phòng/hộ gia đình

Trên giao diện React, người dùng có thể:
- **Header dropdown**: Chọn phòng (P101, P102, ...) → tự động cập nhật Dashboard, Form nhập, Hóa đơn cho phòng đó
- **Tab Hóa đơn**: Filter hóa đơn theo hộ đang chọn

### 4.2. Backend: API filter

```
GET /chi-so/hoa-don/HO-002        → Hóa đơn của hộ HO-002
GET /chi-so/DH-D001               → Lịch sử chỉ số đồng hồ DH-D001
GET /thong-ke/tieu-thu-theo-ho/HO-001 → Lịch sử tiêu thụ điện/nước riêng của hộ
```

### 4.3. Frontend: Sắp xếp dữ liệu

Dữ liệu chỉ số tiêu thụ được sắp xếp theo `ThangNam` từ cũ → mới để hiển thị biểu đồ so sánh 3 tháng.

---

## 5. Xây dựng thống kê/báo cáo cơ bản (Tiêu chí 5 — Mức Hiểu)

### 5.1. API Thống kê tổng quan

```
GET /thong-ke/tong-quan
Response:
{
  "tong_ho_gia_dinh": 5,
  "tong_dong_ho": 10,
  "tong_hoa_don": 15,
  "tong_doanh_thu": 4770500,
  "da_thu": 2830000,
  "cong_no": 1940500,
  "hoa_don_chua_thanh_toan": 5
}
```

### 5.2. Dashboard Frontend

Dashboard hiển thị:

| Thẻ thống kê | Nội dung |
|---|---|
| **Quick Stats** | Điện tiêu thụ (kWh) + Nước tiêu thụ (m³) với xu hướng tăng/giảm % |
| **Tổng tiền tạm tính** | Tổng tiền điện + nước kỳ hiện tại, badge trạng thái thanh toán |
| **AI Highlight** | Banner cảnh báo AI với mức Đỏ/Vàng/Xanh, glassmorphism effect |
| **Biểu đồ 3 tháng** | Bar chart so sánh tiêu thụ điện và nước 3 tháng gần nhất |

### 5.3. Doanh thu theo tháng

```
GET /thong-ke/doanh-thu-theo-thang
Response: [
  { "thang": "2026-06-01", "tong_tien": 1460000, "so_hoa_don": 5 },
  { "thang": "2026-07-01", "tong_tien": 1370500, "so_hoa_don": 5 },
  ...
]
```

---

## 6. Thiết kế giao diện rõ ràng, dễ sử dụng (Tiêu chí 6 — Mức Hiểu)

### 6.1. Design Language

Giao diện được thiết kế theo chuẩn **Zalo Mini App Mobile View** (tham khảo Figma template công khai):

| Yếu tố | Giá trị |
|---|---|
| **Tone màu chính** | Blue `#0068FF`, Dark Navy/Slate |
| **Layout** | Mobile-first, `max-w-md mx-auto` |
| **Header** | Gradient xanh, bo góc 24px dưới |
| **Cards** | Bo góc 16px, shadow nhẹ, nền trắng |
| **AI Box** | Glassmorphism: gradient + backdrop-blur + border phát sáng |
| **Typography** | Inter font, hệ thống size 11-24px |
| **Bottom Nav** | Fixed, 3 tab: Tổng quan / Nhập số / Hóa đơn |

### 6.2. Phản hồi người dùng (UX Feedback)

| Tình huống | Phản hồi |
|---|---|
| Nhập chỉ số mới < chỉ số cũ | Viền đỏ + thông báo lỗi real-time |
| Nhập chỉ số hợp lệ | Live calculation hiển thị tiêu thụ + thành tiền |
| Submit form | Spinner loading + text "Đang lưu & phân tích AI..." |
| Submit thành công | Màn hình CheckCircle xanh + tóm tắt kết quả |
| Thanh toán hóa đơn | Bottom sheet xác nhận → chuyển badge sang "Đã TT" |
| Chọn phòng khác | Dropdown animated → tự reload toàn bộ dữ liệu |

### 6.3. Responsive

- **Mobile** (≤ 480px): Layout column, full-width
- **Tablet/PC**: Centered container `max-w-md` giữ tỷ lệ mobile app

---

## 7. Kết nối và thao tác CSDL ổn định (Tiêu chí 7 — Mức Vận dụng)

### 7.1. Cấu hình SQLAlchemy

```python
DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 7.2. Dependency Injection

```python
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # Đảm bảo đóng session sau mỗi request
```

### 7.3. Dữ liệu mẫu (seed_data.py)

Script `seed_data.py` tạo sẵn:
- 2 tài khoản (admin, user)
- 5 hộ gia đình (P101–P301)
- 10 đồng hồ (5 điện + 5 nước)
- 30 bản ghi chỉ số (3 tháng × 5 hộ × 2 loại)
- 15 hóa đơn (3 tháng × 5 hộ)

### 7.4. Auto-create tables

```python
@app.on_event("startup")
def on_startup():
    create_tables()  # Base.metadata.create_all(bind=engine)
```

---

## 8. Xử lý lỗi cơ bản (Tiêu chí 8 — Mức Vận dụng)

### 8.1. Backend Error Handling

| Tình huống lỗi | HTTP Code | Xử lý |
|---|---|---|
| Sai tên đăng nhập/mật khẩu | `401` | `"Sai tên đăng nhập hoặc mật khẩu"` |
| Chưa đăng nhập | `401` | `"Chưa đăng nhập hoặc phiên đã hết hạn"` |
| Không tìm thấy hộ/đồng hồ | `404` | `"Không tìm thấy '{id}'"` |
| MaChiSo trùng lặp | `409` | `"MaChiSo '{id}' đã tồn tại"` |
| Lỗi database | `500` | `"Lỗi CSDL: {chi_tiết}"` + `db.rollback()` |
| Lỗi AI API | `500` | Fallback sang mock response, không crash |

### 8.2. Frontend Validation

```typescript
// MeterTab.tsx — Real-time validation
const errors = useMemo(() => {
  const e: { dien?: string; nuoc?: string } = {};
  if (soDienMoi && dienMoiNum < chiSoCuDien) {
    e.dien = `Số mới không được nhỏ hơn số cũ (${chiSoCuDien})`;
  }
  if (soNuocMoi && nuocMoiNum < chiSoCuNuoc) {
    e.nuoc = `Số mới không được nhỏ hơn số cũ (${chiSoCuNuoc})`;
  }
  return e;
}, [...]);
// → Disable nút submit khi có lỗi
const canSubmit = !hasErrors && !isEmpty && !isSubmitting;
```

### 8.3. Pydantic Validation (schemas.py)

```python
class ChiSoCreate(BaseModel):
    ChiSoCu: int = Field(ge=0)   # >= 0
    ChiSoMoi: int = Field(ge=0)
    
    @model_validator(mode='after')
    def check_chi_so(self):
        if self.ChiSoMoi < self.ChiSoCu:
            raise ValueError('ChiSoMoi phải >= ChiSoCu')
        return self
```

---

## 9. Minh chứng sử dụng AI khi lập trình (Tiêu chí 9 — Mức Vận dụng)

### 9.1. Nhật ký sử dụng AI trong lập trình

#### Prompt 1: Tạo cấu trúc dự án

**Prompt gửi AI:**
> "Tôi cần tạo hệ thống quản lý điện nước hộ gia đình bằng FastAPI + SQLAlchemy + React. Hãy thiết kế cấu trúc thư mục và các model ORM cho 5 bảng: HoGiaDinh, DongHo, ChiSoTieuThu, HoaDon, PhanTichAI."

**Phản hồi AI:** AI đề xuất cấu trúc MVC với routers tách biệt theo module. Tôi đã chỉnh sửa:
- Thêm bảng `NguoiDung` cho xác thực
- Thêm `thong_ke.py` cho dashboard thống kê
- Điều chỉnh tên cột theo tiếng Việt (MaHo, TenChuHo, ...)

#### Prompt 2: Tạo logic nhập chỉ số + auto hóa đơn

**Prompt gửi AI:**
> "Viết endpoint POST /chi-so/ nhập chỉ số điện/nước, tự động tính TongTien = (ChiSoMoi - ChiSoCu) × DonGia, và tạo/cập nhật HoaDon tương ứng."

**Phản hồi AI:** AI tạo logic cơ bản. Tôi đã kiểm tra và bổ sung:
- Validation MaChiSo trùng lặp (409 Conflict)
- Logic cộng thêm TongTien nếu HoaDon tháng đó đã tồn tại
- `db.rollback()` trong exception handler

#### Prompt 3: Thiết kế giao diện React

**Prompt gửi AI:**
> "Dựa trên Figma Zalo Mini App template, tạo 3 tab: Dashboard (Quick Stats + AI Banner + Chart), MeterTab (Form nhập + Live Calculation), BillTab (Bảng kê + AI Insight). Dùng Tailwind CSS + Lucide Icons."

**Phản hồi AI:** AI tạo layout cơ bản. Tôi đã chỉnh sửa:
- Điều chỉnh màu sắc theo Zalo blue `#0068FF`
- Thêm glassmorphism effect cho AI banner
- Thêm bottom sheet payment confirmation modal
- Fix responsive cho mobile view

### 9.2. Phần code được AI hỗ trợ vs. tự viết

| Phần | AI hỗ trợ | Tự viết / chỉnh sửa |
|---|---|---|
| Cấu trúc thư mục | ✅ Đề xuất ban đầu | Thêm auth, thống kê |
| ORM Models | ✅ 5 bảng gốc | Thêm NguoiDung, FK constraints |
| CRUD Routers | ✅ Template cơ bản | Error handling, validation |
| Nhập chỉ số logic | ✅ Tính toán cơ bản | Auto hóa đơn, rollback |
| React Components | ✅ Layout skeleton | Design, animations, UX |
| AI Integration | ✅ Gemini API call | Mock fallback, ẩn danh hóa |

---

## 10. Quản lý mã nguồn và tài liệu chạy thử (Tiêu chí 10 — Mức Vận dụng)

### 10.1. File hướng dẫn

| File | Nội dung |
|---|---|
| `README.md` | Giới thiệu dự án, hướng dẫn cài đặt |
| `.env.example` | Template biến môi trường (API keys) |
| `requirements.txt` | Python dependencies |
| `package.json` | Node.js dependencies |

### 10.2. Hướng dẫn cài đặt và chạy

**Bước 1: Cài Python dependencies**
```bash
py -m pip install -r requirements.txt
```

**Bước 2: Tạo dữ liệu mẫu**
```bash
py seed_data.py
```

**Bước 3: Chạy Backend**
```bash
py main.py
# → http://127.0.0.1:8000 (API)
# → http://127.0.0.1:8000/docs (Swagger UI)
```

**Bước 4: Cài và chạy Frontend**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (Dev server)
```

**Bước 5: Build production**
```bash
cd frontend
npm run build
# → Truy cập http://127.0.0.1:8000 (FastAPI serve React)
```

### 10.3. Cấu hình .env

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
