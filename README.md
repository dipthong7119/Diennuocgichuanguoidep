# Quản lý Điện Nước

Ứng dụng quản lý hộ thuê, đồng hồ điện nước, chỉ số tiêu thụ và hóa đơn. Giao diện hỗ trợ quản trị viên và người thuê; backend cung cấp REST API bằng FastAPI.

## Chức năng chính

- Quản lý hộ gia đình và đồng hồ điện/nước.
- Nhập chỉ số, tự tính tiền và tạo/cập nhật hóa đơn theo tháng.
- Xem hóa đơn, trạng thái thanh toán, thống kê và lịch sử tiêu thụ theo phòng/tháng.
- Phân tích và hỏi đáp AI (Gemini hoặc OpenAI, cần API key).
- Gửi SMS nhắc nợ qua Twilio (tùy chọn).

## Yêu cầu

- Windows PowerShell
- Python 3.10 trở lên
- Node.js 20.19 trở lên hoặc 22.12 trở lên, kèm npm

## Cài đặt lần đầu

Tại thư mục dự án, cài các thư viện backend:

```powershell
py -m pip install fastapi "uvicorn[standard]" sqlalchemy python-dotenv
```

Tạo file cấu hình tùy chọn từ mẫu:

```powershell
Copy-Item backend\.env.example backend\.env
```

Mở `backend/.env` để thêm API key AI hoặc thông tin Twilio nếu cần. Có thể để trống nếu chỉ muốn chạy các chức năng quản lý hóa đơn cơ bản.

## Chạy toàn bộ ứng dụng

Từ thư mục gốc dự án:

```powershell
.\start.ps1
```

Script sẽ cài dependencies frontend nếu chưa có, build giao diện, chép giao diện vào backend, tạo/bổ sung dữ liệu mẫu và chạy FastAPI.

- Giao diện: [http://localhost:8000](http://localhost:8000)
- Tài liệu API: [http://localhost:8000/docs](http://localhost:8000/docs)

Nếu PowerShell chặn chạy script, dùng:

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

## Chạy frontend và backend riêng

Mở hai cửa sổ PowerShell.

**Cửa sổ 1 — backend:**

```powershell
Set-Location backend
py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Cửa sổ 2 — frontend:**

```powershell
Set-Location frontend
npm install
npm run dev
```

Mở giao diện phát triển tại [http://localhost:5173](http://localhost:5173). Vite chuyển tiếp các API về backend tại cổng 8000.

## Tài khoản mẫu

`start.ps1` chạy `backend/seed_data.py` để tạo dữ liệu mẫu ban đầu và bổ sung các kỳ còn thiếu của năm 2026.

| Vai trò | Tên đăng nhập | Mật khẩu |
|---|---|---|
| Quản trị viên | `admin` | `admin123` |
| Người thuê | `user1` | `user123` |
| Người thuê | `user2` | `user456` |
| Người thuê | `user3` | `user789` |

Dữ liệu được lưu trong SQLite tại `backend/database.db`. Không xóa file này nếu cần giữ dữ liệu đã nhập.

## Cấu hình AI và SMS (tùy chọn)

- **AI:** đặt `AI_PROVIDER=gemini` và `GEMINI_API_KEY`, hoặc đặt `AI_PROVIDER=openai` và `OPENAI_API_KEY`. Khi dùng OpenAI, cài thêm `py -m pip install openai`.
- **SMS:** đặt `SMS_ENABLED=true`, điền `TWILIO_ACCOUNT_SID`, `TWILIO_FROM_NUMBER` và một trong hai cách xác thực: `TWILIO_AUTH_TOKEN` hoặc cặp `TWILIO_API_KEY_SID`/`TWILIO_API_KEY_SECRET`. Lịch nhắc nợ tự động tắt mặc định; chỉ bật khi đã thay toàn bộ số mẫu bằng số thật, hoàn tất cấu hình Twilio và được phép liên hệ bằng `TWILIO_BULK_REMINDERS_ENABLED=true`. Với Việt Nam, dùng Sender ID đã đăng ký; nội dung tùy chỉnh yêu cầu tài khoản đã nâng cấp.
- Khởi động lại backend sau khi sửa `backend/.env`.

## Cấu trúc thư mục

```text
backend/       FastAPI, API routers, service, SQLite và dữ liệu mẫu
frontend/      React, TypeScript và Vite
start.ps1      Build frontend, nạp dữ liệu mẫu và chạy backend
```
