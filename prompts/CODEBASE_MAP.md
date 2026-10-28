# Bản đồ mã nguồn — Hệ thống quản lý điện nước

Tài liệu định vị nhanh các phần chính của repository. Cập nhật khi thêm, chuyển hoặc xóa module; luôn kiểm tra file thực tế trước khi sửa.

## Cấu trúc

```text
.
├── start.ps1                         # Build frontend, chuẩn bị static và chạy backend
├── backend/
│   ├── main.py                       # FastAPI app, startup/shutdown, router, phục vụ SPA
│   ├── database.py                   # SQLAlchemy engine, 7 model, session, create_tables
│   ├── schemas.py                    # Pydantic request/response và validation
│   ├── seed_data.py                  # Dữ liệu mẫu và tài khoản demo
│   ├── README.md                     # Endpoint, cách chạy, ghi chú migration
│   ├── routers/
│   │   ├── auth.py                   # Đăng nhập, session, phân quyền, danh sách tài khoản
│   │   ├── ho_gia_dinh.py            # CRUD hộ gia đình
│   │   ├── dong_ho.py                # CRUD đồng hồ điện/nước
│   │   ├── chi_so.py                 # Nhập chỉ số, tạo/cập nhật hóa đơn, thanh toán
│   │   ├── ai_insight.py             # Prompt, provider AI, truy vấn dữ liệu, phân tích và hỏi đáp
│   │   └── thong_ke.py               # Dashboard, lịch sử, cảnh báo, lọc và xếp hạng
│   ├── services/
│   │   └── nhac_no.py                # Chọn hóa đơn quá hạn và gửi SMS qua Twilio
│   ├── tests/                        # Kiểm thử API, nghiệp vụ và AI
│   └── static/                       # Bản build frontend được backend phục vụ
├── frontend/
│   ├── src/App.tsx                   # Trạng thái phiên và điều hướng tab
│   ├── src/components/               # Màn hình đăng nhập, dashboard, chỉ số, hóa đơn, admin
│   ├── src/data/mockData.ts           # Dữ liệu giao diện mẫu/helper
│   └── package.json                  # Vite, TypeScript, React, Tailwind và thư viện UI
└── prompts/                          # Đề bài, tài liệu học tập và bộ hướng dẫn AI
```

## Model dữ liệu hiện có

`backend/database.py` khai báo 7 model SQLAlchemy:

| Model | Vai trò |
|---|---|
| `HoGiaDinh` | Chủ hộ, số điện thoại, mã phòng và thông tin địa chỉ/giới tính |
| `DongHo` | Đồng hồ điện/nước, hộ sở hữu và đơn giá |
| `ChiSoTieuThu` | Chỉ số đầu/cuối và kỳ ghi nhận |
| `HoaDon` | Tổng tiền và trạng thái thanh toán theo hộ/kỳ |
| `PhanTichAI` | Nhận xét và mức cảnh báo liên kết hóa đơn |
| `NguoiDung` | Tài khoản, hash mật khẩu, vai trò và hộ liên kết |
| `LogNhacNo` | Khóa ghi nhận gửi SMS nhắc nợ theo hộ/kỳ nhắc |

Header trong `database.py` hoặc tài liệu cũ có thể còn ghi “5 bảng”; hãy dùng model đang khai báo làm trạng thái hiện hành.

## Router và endpoint chính

- `auth.py`: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `GET /auth/users`.
- `ho_gia_dinh.py`: CRUD tại `/ho-gia-dinh/` và `/ho-gia-dinh/{ma_ho}`.
- `dong_ho.py`: CRUD tại `/dong-ho/`, `/dong-ho/{ma_dong_ho}` và lọc theo hộ.
- `chi_so.py`: `POST /chi-so/`, xem chỉ số theo đồng hồ, xem hóa đơn theo hộ và `PATCH` trạng thái thanh toán.
- `ai_insight.py`: `POST /ai-insight/generate`, `GET /ai-insight/{ma_hoa_don}`, `POST /ai-insight/hoi-dap`.
- `thong_ke.py`: tổng quan, lịch sử tiêu thụ, doanh thu theo tháng, cảnh báo, xếp hạng, lọc hóa đơn và trạng thái SMS.

Router là nguồn chuẩn cho HTTP method, response model và quyền của từng endpoint. Đừng suy diễn quyền chỉ từ tên component hoặc tên route.

## Kiểm thử

`backend/tests/` có `conftest.py` và các nhóm `test_ai.py`, `test_ai_hoi_dap.py`, `test_canh_bao.py`, `test_chi_so.py`, `test_hoa_don.py`, `test_ho_gia_dinh.py`, `test_thong_ke.py`. Đọc test liên quan khi thay đổi hành vi; cập nhật tài liệu nếu phạm vi test thay đổi.

## Chạy ứng dụng

- `start.ps1`: luồng chạy thuận tiện, build giao diện và khởi chạy backend.
- Backend: xem `backend/README.md`; API docs được FastAPI phục vụ tại `/docs` khi server chạy.
- SQLite dùng URL tương đối `sqlite:///./database.db`; thư mục làm việc có thể ảnh hưởng file DB được mở.
